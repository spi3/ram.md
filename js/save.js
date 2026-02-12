/**
 * save.js - localStorage persistence layer
 * Handles saving/loading game state, offline progress calculation, and migration
 */

const SAVE_KEY = 'ramClickerSave';
const SAVE_VERSION = '1.0.0';

// Maximum offline time in milliseconds (7 days)
const MAX_OFFLINE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Creates a fresh game state with default values
 */
export function createDefaultState() {
    return {
        version: SAVE_VERSION,
        lastSaveTime: Date.now(),
        currentStage: 1,
        resources: {
            product: 0,
            dollars: 0,
            computeUnits: 0,
            intelligencePoints: 0,
            consciousnessCycles: 0
        },
        upgrades: {},
        statistics: {
            totalClicks: 0,
            totalEarned: 0,
            playTime: 0,
            prestigeCount: 0
        },
        prestige: {
            simulationDepth: 0,
            permanentBonuses: {
                productionMultiplier: 1.0,
                costReduction: 0
            }
        },
        settings: {
            lastHeadlineIndex: 0
        },
        prestigeUnlocked: false
    };
}

/**
 * Saves the game state to localStorage
 */
export function saveGame(state) {
    try {
        const saveData = {
            ...state,
            lastSaveTime: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

/**
 * Loads the game state from localStorage
 * Returns null if no save exists or save is corrupted
 */
export function loadGame() {
    try {
        const saveString = localStorage.getItem(SAVE_KEY);
        if (!saveString) {
            return null;
        }

        const saveData = JSON.parse(saveString);

        // Validate basic structure
        if (!saveData || typeof saveData !== 'object') {
            console.warn('Invalid save data structure');
            return null;
        }

        // Merge with defaults to handle missing fields from older versions
        const defaultState = createDefaultState();
        const mergedState = deepMerge(defaultState, saveData);

        // Ensure version is current
        mergedState.version = SAVE_VERSION;

        return mergedState;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

/**
 * Calculates offline progress based on elapsed time and production rates
 * Returns an object with earned resources and a summary
 */
export function calculateOfflineProgress(state, productionRates) {
    const now = Date.now();
    const lastSave = state.lastSaveTime || now;
    let elapsedMs = now - lastSave;

    // Reject negative elapsed time (clock manipulation)
    if (elapsedMs < 0) {
        elapsedMs = 0;
    }

    // Cap at maximum offline time
    const cappedMs = Math.min(elapsedMs, MAX_OFFLINE_MS);
    const wasCapped = elapsedMs > MAX_OFFLINE_MS;

    // Convert to seconds for production calculation
    const elapsedSeconds = cappedMs / 1000;

    // Calculate offline earnings
    const offlineEarnings = {
        product: Math.floor(productionRates.productPerSecond * elapsedSeconds),
        dollars: Math.floor(productionRates.dollarsPerSecond * elapsedSeconds),
        computeUnits: Math.floor(productionRates.computePerSecond * elapsedSeconds),
        intelligencePoints: Math.floor(productionRates.intelligencePerSecond * elapsedSeconds),
        consciousnessCycles: Math.floor(productionRates.consciousnessPerSecond * elapsedSeconds)
    };

    // Format time for display
    const formattedTime = formatDuration(cappedMs);

    return {
        elapsedMs: cappedMs,
        wasCapped,
        earnings: offlineEarnings,
        formattedTime,
        hasSignificantProgress: elapsedMs > 60000 // More than 1 minute
    };
}

/**
 * Clears the save data (for prestige or manual reset)
 */
export function clearSave() {
    try {
        localStorage.removeItem(SAVE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear save:', error);
        return false;
    }
}

/**
 * Deep merges two objects, with source values taking precedence
 */
function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (target[key] && typeof target[key] === 'object') {
                    result[key] = deepMerge(target[key], source[key]);
                } else {
                    result[key] = { ...source[key] };
                }
            } else {
                result[key] = source[key];
            }
        }
    }

    return result;
}

/**
 * Formats a duration in milliseconds to a human-readable string
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return `${days} day${days !== 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours !== 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
}
