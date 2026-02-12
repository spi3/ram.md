/**
 * game.js - Core game loop and state management
 * The single authority on game state. All other modules read state through getters.
 */

import { createDefaultState, saveGame, loadGame, calculateOfflineProgress } from './save.js';
import { getStage, canAdvanceStage, calculateSellPrice, TOTAL_STAGES } from './stages.js';
import {
    loadUpgrades,
    calculateProductionBonuses,
    canPurchaseUpgrade,
    getUpgrade,
    calculateUpgradeCost,
    isPrestigeUnlocked
} from './upgrades.js';
import {
    initUI,
    render,
    renderUpgrades,
    updateUpgradeAffordability,
    updateTicker,
    showWelcomeBackModal,
    showPrestigeModal,
    getMainActionButton
} from './ui.js';

// =============================================================================
// GAME CONSTANTS
// =============================================================================

const TICK_RATE_MS = 100; // Game loop runs every 100ms (10 ticks/second)
const AUTO_SAVE_INTERVAL_MS = 30000; // Auto-save every 30 seconds
const HEADLINE_ROTATE_INTERVAL_MS = 8000; // Rotate headlines every 8 seconds
const TICKS_PER_SECOND = 1000 / TICK_RATE_MS;

// Prestige bonus per simulation depth level
const PRESTIGE_PRODUCTION_BONUS = 0.25; // +25% production per depth
const PRESTIGE_COST_REDUCTION = 0.05; // -5% costs per depth (caps at 50%)
const MAX_PRESTIGE_COST_REDUCTION = 0.5;

// =============================================================================
// GAME STATE
// =============================================================================

let gameState = null;
let headlines = null;
let lastTickTime = 0;
let lastSaveTime = 0;
let lastHeadlineTime = 0;
let gameLoopId = null;
let isInitialized = false;

// Cached production rates (recalculated when upgrades change)
let cachedBonuses = null;
let cachedProductionRates = null;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initializes the game
 */
async function init() {
    console.log('ram.md initializing...');

    // Initialize UI elements
    initUI();

    // Load upgrade data
    await loadUpgrades();

    // Load headlines
    await loadHeadlines();

    // Load or create game state
    const savedState = loadGame();
    if (savedState) {
        gameState = savedState;
        console.log('Loaded saved game');

        // Calculate and apply offline progress
        handleOfflineProgress();
    } else {
        gameState = createDefaultState();
        console.log('Starting new game');
        startGameLoop();
    }

    // Calculate initial bonuses
    recalculateProductionRates();

    // Set up event listeners
    setupEventListeners();

    // Initial render
    render(gameState, cachedProductionRates, cachedBonuses);
    renderUpgrades(gameState, cachedBonuses, handleUpgradePurchase);

    // Set initial headline
    rotateHeadline();

    isInitialized = true;
    console.log('ram.md initialized');
}

/**
 * Loads headlines from JSON
 */
async function loadHeadlines() {
    try {
        const response = await fetch('./js/data/headlines.json');
        const data = await response.json();
        headlines = data.headlines;
    } catch (error) {
        console.error('Failed to load headlines:', error);
        headlines = {
            1: ['Welcome to ram.md!'],
            2: ['Keep clicking!'],
            3: ['You\'re doing great!'],
            4: ['Almost there!'],
            5: ['The future awaits!'],
            6: ['Singularity approaches!']
        };
    }
}

/**
 * Handles offline progress calculation and display
 */
function handleOfflineProgress() {
    recalculateProductionRates();

    const offlineProgress = calculateOfflineProgress(gameState, cachedProductionRates);

    if (offlineProgress.hasSignificantProgress) {
        // Apply offline earnings
        gameState.resources.product += offlineProgress.earnings.product;
        gameState.resources.dollars += offlineProgress.earnings.dollars;
        gameState.resources.computeUnits += offlineProgress.earnings.computeUnits;
        gameState.resources.intelligencePoints += offlineProgress.earnings.intelligencePoints;
        gameState.resources.consciousnessCycles += offlineProgress.earnings.consciousnessCycles;

        // Also add to total earned for stage progression
        gameState.statistics.totalEarned += offlineProgress.earnings.dollars;

        // Show welcome back modal
        showWelcomeBackModal(offlineProgress, () => {
            startGameLoop();
        });
    } else {
        startGameLoop();
    }
}

/**
 * Sets up event listeners
 */
function setupEventListeners() {
    // Main click action
    const actionButton = getMainActionButton();
    actionButton.addEventListener('click', handleClick);

    // Save on tab blur/close
    window.addEventListener('beforeunload', () => {
        saveGame(gameState);
    });

    window.addEventListener('blur', () => {
        saveGame(gameState);
    });

    // Keyboard shortcut for clicking (spacebar)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            handleClick();
        }
    });
}

// =============================================================================
// GAME LOOP
// =============================================================================

/**
 * Starts the game loop
 */
function startGameLoop() {
    if (gameLoopId !== null) return;

    lastTickTime = Date.now();
    lastSaveTime = Date.now();
    lastHeadlineTime = Date.now();

    gameLoopId = setInterval(tick, TICK_RATE_MS);
    console.log('Game loop started');
}

/**
 * Stops the game loop
 */
function stopGameLoop() {
    if (gameLoopId !== null) {
        clearInterval(gameLoopId);
        gameLoopId = null;
        console.log('Game loop stopped');
    }
}

/**
 * Main game tick function
 */
function tick() {
    const now = Date.now();
    const deltaTime = (now - lastTickTime) / 1000; // Convert to seconds
    lastTickTime = now;

    // Update play time
    gameState.statistics.playTime += deltaTime;

    // Apply passive production
    applyPassiveProduction(deltaTime);

    // Auto-sell products
    autoSellProducts();

    // Check for stage advancement
    checkStageAdvancement();

    // Update UI
    render(gameState, cachedProductionRates, cachedBonuses);
    updateUpgradeAffordability(gameState, cachedBonuses);

    // Auto-save check
    if (now - lastSaveTime >= AUTO_SAVE_INTERVAL_MS) {
        saveGame(gameState);
        lastSaveTime = now;
    }

    // Headline rotation check
    if (now - lastHeadlineTime >= HEADLINE_ROTATE_INTERVAL_MS) {
        rotateHeadline();
        lastHeadlineTime = now;
    }
}

/**
 * Applies passive production based on elapsed time
 */
function applyPassiveProduction(deltaTime) {
    const rates = cachedProductionRates;

    gameState.resources.product += rates.productPerSecond * deltaTime;
    gameState.resources.dollars += rates.dollarsPerSecond * deltaTime;
    gameState.resources.computeUnits += rates.computePerSecond * deltaTime;
    gameState.resources.intelligencePoints += rates.intelligencePerSecond * deltaTime;
    gameState.resources.consciousnessCycles += rates.consciousnessPerSecond * deltaTime;

    // Track passive earnings
    gameState.statistics.totalEarned += rates.dollarsPerSecond * deltaTime;
}

/**
 * Automatically sells products when threshold is reached
 */
function autoSellProducts() {
    const stage = getStage(gameState.currentStage);
    const productPerSale = stage.productPerSale;

    while (gameState.resources.product >= productPerSale) {
        // Calculate sell price with bonuses
        const prestigeMultiplier = 1 + (gameState.prestige.simulationDepth * PRESTIGE_PRODUCTION_BONUS);
        const sellPrice = calculateSellPrice(
            gameState.currentStage,
            cachedBonuses.sellPriceMultiplier,
            prestigeMultiplier
        );

        // Perform the sale
        gameState.resources.product -= productPerSale;
        gameState.resources.dollars += sellPrice;
        gameState.statistics.totalEarned += sellPrice;
    }
}

/**
 * Checks if player can advance to the next stage
 */
function checkStageAdvancement() {
    if (gameState.currentStage >= TOTAL_STAGES) return;

    if (canAdvanceStage(gameState.currentStage, gameState.statistics.totalEarned)) {
        advanceStage();
    }
}

/**
 * Advances to the next stage
 */
function advanceStage() {
    gameState.currentStage++;
    console.log(`Advanced to stage ${gameState.currentStage}`);

    // Save on stage transition
    saveGame(gameState);

    // Re-render upgrades for new stage
    renderUpgrades(gameState, cachedBonuses, handleUpgradePurchase);

    // Update headline for new stage
    rotateHeadline();
}

// =============================================================================
// PLAYER ACTIONS
// =============================================================================

/**
 * Handles the main click action
 */
function handleClick() {
    const clickPower = cachedBonuses.clickPower;
    const prestigeMultiplier = 1 + (gameState.prestige.simulationDepth * PRESTIGE_PRODUCTION_BONUS);
    const totalClick = clickPower * prestigeMultiplier;

    gameState.resources.product += totalClick;
    gameState.statistics.totalClicks++;
}

/**
 * Handles upgrade purchase
 */
function handleUpgradePurchase(upgradeId) {
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) return;

    const purchaseCount = gameState.upgrades[upgradeId] || 0;
    const purchaseCheck = canPurchaseUpgrade(
        upgrade,
        purchaseCount,
        gameState.resources,
        gameState.upgrades,
        cachedBonuses.costReduction
    );

    if (!purchaseCheck.canPurchase) {
        return;
    }

    // Calculate cost fresh (don't use stale values from UI)
    const baseCost = calculateUpgradeCost(upgrade, purchaseCount);
    const finalCost = Math.floor(baseCost * (1 - cachedBonuses.costReduction));

    // Deduct cost
    const resourceKey = upgrade.costResource || 'dollars';
    gameState.resources[resourceKey] -= finalCost;

    // Record purchase
    gameState.upgrades[upgradeId] = purchaseCount + 1;

    // Recalculate production rates
    recalculateProductionRates();

    // Check for prestige unlock
    if (upgrade.effectType === 'unlockPrestige') {
        gameState.prestigeUnlocked = true;
        showPrestigePrompt();
    }

    // Re-render upgrades
    renderUpgrades(gameState, cachedBonuses, handleUpgradePurchase);

    // Save on upgrade purchase
    saveGame(gameState);

    console.log(`Purchased upgrade: ${upgrade.name}`);
}

/**
 * Shows the prestige prompt
 */
function showPrestigePrompt() {
    showPrestigeModal(
        gameState.prestige.simulationDepth,
        handlePrestigeConfirm,
        handlePrestigeCancel
    );
}

/**
 * Handles prestige confirmation
 */
function handlePrestigeConfirm() {
    // Increment simulation depth
    gameState.prestige.simulationDepth++;
    gameState.statistics.prestigeCount++;

    // Calculate new permanent bonuses
    const newDepth = gameState.prestige.simulationDepth;
    gameState.prestige.permanentBonuses.productionMultiplier = 1 + (newDepth * PRESTIGE_PRODUCTION_BONUS);
    gameState.prestige.permanentBonuses.costReduction = Math.min(
        newDepth * PRESTIGE_COST_REDUCTION,
        MAX_PRESTIGE_COST_REDUCTION
    );

    // Reset progress but keep prestige data
    const prestigeData = { ...gameState.prestige };
    const statistics = {
        totalClicks: 0,
        totalEarned: 0,
        playTime: gameState.statistics.playTime,
        prestigeCount: gameState.statistics.prestigeCount
    };

    // Create fresh state
    gameState = createDefaultState();
    gameState.prestige = prestigeData;
    gameState.statistics = statistics;

    // Recalculate rates with new prestige bonuses
    recalculateProductionRates();

    // Save and re-render
    saveGame(gameState);
    render(gameState, cachedProductionRates, cachedBonuses);
    renderUpgrades(gameState, cachedBonuses, handleUpgradePurchase);
    rotateHeadline();

    console.log(`Prestige! New simulation depth: ${newDepth}`);
}

/**
 * Handles prestige cancellation
 */
function handlePrestigeCancel() {
    // Do nothing, just close the modal
    console.log('Prestige cancelled');
}

// =============================================================================
// PRODUCTION CALCULATIONS
// =============================================================================

/**
 * Recalculates all production rates based on current upgrades and prestige
 */
function recalculateProductionRates() {
    cachedBonuses = calculateProductionBonuses(gameState.upgrades);

    // Apply prestige cost reduction on top of upgrade cost reduction
    const prestigeCostReduction = gameState.prestige.permanentBonuses.costReduction || 0;
    cachedBonuses.costReduction = Math.min(
        cachedBonuses.costReduction + prestigeCostReduction,
        0.9 // Hard cap at 90%
    );

    // Calculate prestige production multiplier
    const prestigeMultiplier = gameState.prestige.permanentBonuses.productionMultiplier || 1;

    // Calculate per-second production rates
    cachedProductionRates = {
        productPerSecond: cachedBonuses.passiveProduct * prestigeMultiplier,
        dollarsPerSecond: cachedBonuses.passiveDollars * prestigeMultiplier,
        computePerSecond: cachedBonuses.passiveCompute * prestigeMultiplier,
        intelligencePerSecond: cachedBonuses.passiveIntelligence * prestigeMultiplier,
        consciousnessPerSecond: cachedBonuses.passiveConsciousness * prestigeMultiplier
    };
}

// =============================================================================
// NEWS TICKER
// =============================================================================

/**
 * Rotates to the next headline
 */
function rotateHeadline() {
    if (!headlines) return;

    const stageHeadlines = headlines[gameState.currentStage] || headlines['1'];
    if (!stageHeadlines || stageHeadlines.length === 0) return;

    // Get next headline index
    let index = gameState.settings.lastHeadlineIndex || 0;
    index = (index + 1) % stageHeadlines.length;
    gameState.settings.lastHeadlineIndex = index;

    // Update ticker
    updateTicker(stageHeadlines[index]);
}

// =============================================================================
// START GAME
// =============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
