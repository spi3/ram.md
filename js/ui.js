/**
 * ui.js - DOM manipulation and rendering
 * Renders game state to the DOM. Never stores gameplay data - only projects state.
 */

import { getStage, getVisibleResources, getPrestigeNarrative } from './stages.js';
import {
    getAvailableUpgrades,
    getUpgrade,
    calculateUpgradeCost,
    canPurchaseUpgrade,
    getEffectDescription
} from './upgrades.js';

// Cache DOM elements for performance
let elements = null;

// Number formatting suffixes
const NUMBER_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/**
 * Initializes the UI module by caching DOM elements
 */
export function initUI() {
    elements = {
        // Header
        depthValue: document.getElementById('depth-value'),

        // Stage banner
        stageTitle: document.getElementById('stage-title'),
        stageFlavor: document.getElementById('stage-flavor'),

        // Resources
        resourceProduct: document.getElementById('resource-product'),
        productCount: document.getElementById('product-count'),
        productRate: document.getElementById('product-rate'),
        dollarsCount: document.getElementById('dollars-count'),
        dollarsRate: document.getElementById('dollars-rate'),
        resourceCompute: document.getElementById('resource-compute'),
        computeCount: document.getElementById('compute-count'),
        computeRate: document.getElementById('compute-rate'),
        resourceIntelligence: document.getElementById('resource-intelligence'),
        intelligenceCount: document.getElementById('intelligence-count'),
        intelligenceRate: document.getElementById('intelligence-rate'),
        resourceConsciousness: document.getElementById('resource-consciousness'),
        consciousnessCount: document.getElementById('consciousness-count'),
        consciousnessRate: document.getElementById('consciousness-rate'),

        // Progress bar
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),

        // Action area
        mainActionButton: document.getElementById('main-action-button'),
        clickPowerValue: document.getElementById('click-power-value'),

        // Upgrades
        upgradesList: document.getElementById('upgrades-list'),

        // Statistics
        statClicks: document.getElementById('stat-clicks'),
        statEarned: document.getElementById('stat-earned'),
        statPlaytime: document.getElementById('stat-playtime'),
        statPrestige: document.getElementById('stat-prestige'),

        // News ticker
        tickerContent: document.getElementById('ticker-content'),

        // Modals
        welcomeBackModal: document.getElementById('welcome-back-modal'),
        welcomeBackMessage: document.getElementById('welcome-back-message'),
        welcomeBackClose: document.getElementById('welcome-back-close'),
        prestigeModal: document.getElementById('prestige-modal'),
        prestigeMessage: document.getElementById('prestige-message'),
        prestigeConfirm: document.getElementById('prestige-confirm'),
        prestigeCancel: document.getElementById('prestige-cancel')
    };

    return elements;
}

/**
 * Formats a number for display with appropriate suffixes
 */
export function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 0) return '-' + formatNumber(-num);

    // For small numbers, use commas
    if (num < 10000) {
        return Math.floor(num).toLocaleString('en-US');
    }

    // For large numbers, use suffixes
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    if (tier === 0) return Math.floor(num).toLocaleString('en-US');

    const suffix = NUMBER_SUFFIXES[tier] || 'e' + (tier * 3);
    const scale = Math.pow(10, tier * 3);
    const scaled = num / scale;

    // Show 2 decimal places for cleaner display
    return scaled.toFixed(2) + suffix;
}

/**
 * Formats a dollar amount
 */
export function formatDollars(num) {
    return '$' + formatNumber(num);
}

/**
 * Formats a duration in seconds to HH:MM:SS
 */
export function formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generates an ASCII progress bar
 */
function generateProgressBar(current, max, width = 20) {
    const ratio = Math.min(current / max, 1);
    const filled = Math.floor(ratio * (width - 2));
    const empty = width - 2 - filled;

    const filledPart = '='.repeat(filled);
    const pointer = filled < width - 2 ? '>' : '=';
    const emptyPart = '.'.repeat(Math.max(0, empty - 1));

    return `[${filledPart}${pointer}${emptyPart}]`;
}

/**
 * Updates the entire UI based on game state
 */
export function render(state, productionRates, bonuses) {
    if (!elements) {
        initUI();
    }

    const stage = getStage(state.currentStage);
    const visibleResources = getVisibleResources(state.currentStage);

    // Update header
    elements.depthValue.textContent = state.prestige.simulationDepth;

    // Update stage banner
    elements.stageTitle.textContent = stage.title;
    elements.stageFlavor.textContent = stage.flavor;

    // Update resources
    updateResources(state, productionRates, stage, visibleResources);

    // Update progress bar
    updateProgressBar(state.resources.product, stage.productPerSale);

    // Update action button
    elements.mainActionButton.textContent = `> [${stage.clickAction}]`;
    elements.clickPowerValue.textContent = formatNumber(bonuses.clickPower);

    // Update statistics
    elements.statClicks.textContent = formatNumber(state.statistics.totalClicks);
    elements.statEarned.textContent = formatDollars(state.statistics.totalEarned);
    elements.statPlaytime.textContent = formatPlaytime(state.statistics.playTime);
    elements.statPrestige.textContent = state.statistics.prestigeCount;
}

/**
 * Updates the resource display
 */
function updateResources(state, rates, stage, visibleResources) {
    // Update product name based on stage
    const productNameEl = elements.resourceProduct.querySelector('.resource-name');
    productNameEl.textContent = `- ${stage.productName}:`;

    // Update product
    elements.productCount.textContent = formatNumber(state.resources.product);
    elements.productRate.textContent = `(+${formatNumber(rates.productPerSecond)}/sec)`;

    // Update dollars
    elements.dollarsCount.textContent = formatDollars(state.resources.dollars);
    elements.dollarsRate.textContent = `(+${formatDollars(rates.dollarsPerSecond)}/sec)`;

    // Update compute units visibility and value
    if (visibleResources.includes('computeUnits')) {
        elements.resourceCompute.classList.remove('hidden');
        elements.computeCount.textContent = formatNumber(state.resources.computeUnits);
        elements.computeRate.textContent = `(+${formatNumber(rates.computePerSecond)}/sec)`;
    } else {
        elements.resourceCompute.classList.add('hidden');
    }

    // Update intelligence points visibility and value
    if (visibleResources.includes('intelligencePoints')) {
        elements.resourceIntelligence.classList.remove('hidden');
        elements.intelligenceCount.textContent = formatNumber(state.resources.intelligencePoints);
        elements.intelligenceRate.textContent = `(+${formatNumber(rates.intelligencePerSecond)}/sec)`;
    } else {
        elements.resourceIntelligence.classList.add('hidden');
    }

    // Update consciousness cycles visibility and value
    if (visibleResources.includes('consciousnessCycles')) {
        elements.resourceConsciousness.classList.remove('hidden');
        elements.consciousnessCount.textContent = formatNumber(state.resources.consciousnessCycles);
        elements.consciousnessRate.textContent = `(+${formatNumber(rates.consciousnessPerSecond)}/sec)`;
    } else {
        elements.resourceConsciousness.classList.add('hidden');
    }
}

/**
 * Updates the progress bar
 */
function updateProgressBar(currentProduct, productPerSale) {
    const progress = currentProduct % productPerSale;
    const bar = generateProgressBar(progress, productPerSale);

    elements.progressBar.textContent = bar;
    elements.progressText.textContent = `${Math.floor(progress)}/${productPerSale} to next sale`;
}

/**
 * Renders the upgrades list
 */
export function renderUpgrades(state, bonuses, onPurchase) {
    if (!elements) {
        initUI();
    }

    const availableUpgrades = getAvailableUpgrades(state.currentStage);
    const costReduction = bonuses.costReduction;

    // Track which upgrade IDs should exist
    const upgradeIds = new Set(availableUpgrades.map(u => u.id));

    // Remove upgrades that shouldn't be here (e.g., from stage changes)
    const existingElements = elements.upgradesList.querySelectorAll('.upgrade-item');
    existingElements.forEach(el => {
        if (!upgradeIds.has(el.dataset.upgradeId)) {
            el.remove();
        }
    });

    for (const upgrade of availableUpgrades) {
        const purchaseCount = state.upgrades[upgrade.id] || 0;
        const purchaseCheck = canPurchaseUpgrade(
            upgrade,
            purchaseCount,
            state.resources,
            state.upgrades,
            costReduction
        );

        const baseCost = calculateUpgradeCost(upgrade, purchaseCount);
        const finalCost = Math.floor(baseCost * (1 - costReduction));
        const isMaxed = purchaseCount >= upgrade.maxPurchases;
        const isLocked = purchaseCheck.reason === 'prerequisite';

        // Find or create upgrade element
        let upgradeEl = elements.upgradesList.querySelector(`[data-upgrade-id="${upgrade.id}"]`);
        const isNewElement = !upgradeEl;

        if (isNewElement) {
            upgradeEl = document.createElement('div');
            upgradeEl.className = 'upgrade-item';
            upgradeEl.dataset.upgradeId = upgrade.id;
        }

        // Determine what state class should be applied
        let stateClass = '';
        if (isMaxed && upgrade.effectType === 'unlockPrestige') {
            stateClass = 'upgrade-affordable';
        } else if (isMaxed) {
            stateClass = 'upgrade-maxed';
        } else if (isLocked) {
            stateClass = 'upgrade-locked';
        } else if (purchaseCheck.canPurchase) {
            stateClass = 'upgrade-affordable';
        }

        // Only update classes if they've changed (to preserve hover state)
        const currentStateClass = upgradeEl.className.replace('upgrade-item', '').trim();
        if (currentStateClass !== stateClass) {
            upgradeEl.className = 'upgrade-item' + (stateClass ? ' ' + stateClass : '');
        }

        // Build content parts
        const isPrestigeReady = isMaxed && upgrade.effectType === 'unlockPrestige';
        const checkbox = isPrestigeReady ? '[>]' : (isMaxed ? '[x]' : '[ ]');
        const countDisplay = upgrade.maxPurchases > 1 ? ` (${purchaseCount}/${upgrade.maxPurchases})` : '';
        const costDisplay = isPrestigeReady ? 'READY' : (isMaxed ? 'MAXED' : formatDollars(finalCost));

        if (isNewElement) {
            // Create new element structure
            upgradeEl.innerHTML = `
                <div class="upgrade-header">
                    <span class="upgrade-checkbox">${checkbox}</span>
                    <span class="upgrade-name">${upgrade.name}${countDisplay}</span>
                    <span class="upgrade-cost">${costDisplay}</span>
                </div>
                <div class="upgrade-flavor">*"${upgrade.flavorText}"*</div>
                <div class="upgrade-effect">${getEffectDescription(upgrade)}</div>
            `;
            elements.upgradesList.appendChild(upgradeEl);
        } else {
            // Update existing element - only change the dynamic parts
            const checkboxEl = upgradeEl.querySelector('.upgrade-checkbox');
            const nameEl = upgradeEl.querySelector('.upgrade-name');
            const costEl = upgradeEl.querySelector('.upgrade-cost');

            if (checkboxEl) checkboxEl.textContent = checkbox;
            if (nameEl) nameEl.textContent = upgrade.name + countDisplay;
            if (costEl) costEl.textContent = costDisplay;
        }

        // Always update click handler - uses onclick to replace any existing handler
        // This ensures upgrades that transition from locked to unlocked become clickable
        // Prestige upgrades stay clickable when maxed so the player can re-trigger prestige
        if (isMaxed && upgrade.effectType === 'unlockPrestige') {
            upgradeEl.onclick = () => onPurchase(upgrade.id);
        } else if (!isMaxed && !isLocked) {
            upgradeEl.onclick = () => onPurchase(upgrade.id);
        } else {
            upgradeEl.onclick = null;
        }
    }
}

/**
 * Lightweight affordability update for the game loop.
 * Only updates CSS classes and cost text on existing upgrade elements
 * without recreating DOM structure, preserving hover and click state.
 */
export function updateUpgradeAffordability(state, bonuses) {
    if (!elements) return;

    const costReduction = bonuses.costReduction;
    const upgradeEls = elements.upgradesList.querySelectorAll('.upgrade-item');

    for (const upgradeEl of upgradeEls) {
        const upgradeId = upgradeEl.dataset.upgradeId;
        if (!upgradeId) continue;

        const upgrade = getUpgrade(upgradeId);
        if (!upgrade) continue;

        const purchaseCount = state.upgrades[upgrade.id] || 0;
        const isMaxed = purchaseCount >= upgrade.maxPurchases;
        if (isMaxed) continue; // No changes needed for maxed upgrades

        const purchaseCheck = canPurchaseUpgrade(
            upgrade,
            purchaseCount,
            state.resources,
            state.upgrades,
            costReduction
        );

        const isLocked = purchaseCheck.reason === 'prerequisite';

        let stateClass = '';
        if (isLocked) {
            stateClass = 'upgrade-locked';
        } else if (purchaseCheck.canPurchase) {
            stateClass = 'upgrade-affordable';
        }

        const currentStateClass = upgradeEl.className.replace('upgrade-item', '').trim();
        if (currentStateClass !== stateClass) {
            upgradeEl.className = 'upgrade-item' + (stateClass ? ' ' + stateClass : '');
        }

        // Update cost display
        const baseCost = calculateUpgradeCost(upgrade, purchaseCount);
        const finalCost = Math.floor(baseCost * (1 - costReduction));
        const costEl = upgradeEl.querySelector('.upgrade-cost');
        if (costEl) {
            const costText = formatDollars(finalCost);
            if (costEl.textContent !== costText) {
                costEl.textContent = costText;
            }
        }
    }
}

/**
 * Updates the news ticker
 */
export function updateTicker(headline) {
    if (!elements) {
        initUI();
    }
    elements.tickerContent.textContent = headline;
}

/**
 * Shows the welcome back modal
 */
export function showWelcomeBackModal(offlineProgress, onClose) {
    if (!elements) {
        initUI();
    }

    const { formattedTime, earnings, wasCapped } = offlineProgress;

    let message = `<p>You were away for <strong>${formattedTime}</strong>.</p>`;
    message += `<p>While you were gone, your empire produced:</p>`;
    message += `<p>- Products: <strong>+${formatNumber(earnings.product)}</strong></p>`;
    message += `<p>- Dollars: <strong>+${formatDollars(earnings.dollars)}</strong></p>`;

    if (earnings.computeUnits > 0) {
        message += `<p>- Compute Units: <strong>+${formatNumber(earnings.computeUnits)}</strong></p>`;
    }
    if (earnings.intelligencePoints > 0) {
        message += `<p>- Intelligence Points: <strong>+${formatNumber(earnings.intelligencePoints)}</strong></p>`;
    }
    if (earnings.consciousnessCycles > 0) {
        message += `<p>- Consciousness Cycles: <strong>+${formatNumber(earnings.consciousnessCycles)}</strong></p>`;
    }

    if (wasCapped) {
        message += `<p><em>(Offline progress capped at 7 days)</em></p>`;
    }

    elements.welcomeBackMessage.innerHTML = message;
    elements.welcomeBackModal.classList.remove('hidden');

    // Set up close handler
    const closeHandler = () => {
        elements.welcomeBackModal.classList.add('hidden');
        elements.welcomeBackClose.removeEventListener('click', closeHandler);
        onClose();
    };

    elements.welcomeBackClose.addEventListener('click', closeHandler);
}

/**
 * Shows the prestige modal
 */
export function showPrestigeModal(currentDepth, onConfirm, onCancel) {
    if (!elements) {
        initUI();
    }

    const newDepth = currentDepth + 1;
    const narrative = getPrestigeNarrative(newDepth);

    // Convert markdown-style formatting to HTML
    const formattedNarrative = narrative
        .split('\n\n')
        .map(para => {
            // Handle bold text
            para = para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            return `<p>${para}</p>`;
        })
        .join('');

    elements.prestigeMessage.innerHTML = formattedNarrative;
    elements.prestigeModal.classList.remove('hidden');

    // Set up handlers
    const confirmHandler = () => {
        elements.prestigeModal.classList.add('hidden');
        elements.prestigeConfirm.removeEventListener('click', confirmHandler);
        elements.prestigeCancel.removeEventListener('click', cancelHandler);
        onConfirm();
    };

    const cancelHandler = () => {
        elements.prestigeModal.classList.add('hidden');
        elements.prestigeConfirm.removeEventListener('click', confirmHandler);
        elements.prestigeCancel.removeEventListener('click', cancelHandler);
        onCancel();
    };

    elements.prestigeConfirm.addEventListener('click', confirmHandler);
    elements.prestigeCancel.addEventListener('click', cancelHandler);
}

/**
 * Hides the prestige modal
 */
export function hidePrestigeModal() {
    if (elements && elements.prestigeModal) {
        elements.prestigeModal.classList.add('hidden');
    }
}

/**
 * Gets the main action button element for event binding
 */
export function getMainActionButton() {
    if (!elements) {
        initUI();
    }
    return elements.mainActionButton;
}
