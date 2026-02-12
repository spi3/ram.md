/**
 * upgrades.js - Upgrade definitions and logic
 * Handles upgrade data loading, cost calculations, and purchase logic
 */

// Upgrade data will be loaded from JSON
let upgradesData = null;

/**
 * Loads upgrade data from the JSON file
 */
export async function loadUpgrades() {
    try {
        const response = await fetch('./js/data/upgrades.json');
        const data = await response.json();
        upgradesData = data.upgrades;
        return upgradesData;
    } catch (error) {
        console.error('Failed to load upgrades:', error);
        return [];
    }
}

/**
 * Gets all upgrades
 */
export function getAllUpgrades() {
    return upgradesData || [];
}

/**
 * Gets upgrades for a specific stage
 */
export function getUpgradesForStage(stageId) {
    if (!upgradesData) return [];
    return upgradesData.filter(upgrade => upgrade.stage === stageId);
}

/**
 * Gets upgrades that are available (visible) to the player
 * This includes current stage upgrades and any from previous stages
 */
export function getAvailableUpgrades(currentStage) {
    if (!upgradesData) return [];
    return upgradesData.filter(upgrade => upgrade.stage <= currentStage);
}

/**
 * Gets a specific upgrade by ID
 */
export function getUpgrade(upgradeId) {
    if (!upgradesData) return null;
    return upgradesData.find(upgrade => upgrade.id === upgradeId);
}

/**
 * Calculates the current cost of an upgrade based on purchase count
 * Formula: cost = baseCost * (scalingFactor ^ purchaseCount)
 */
export function calculateUpgradeCost(upgrade, purchaseCount) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, purchaseCount));
}

/**
 * Checks if an upgrade can be purchased
 */
export function canPurchaseUpgrade(upgrade, purchaseCount, resources, purchasedUpgrades, costReductionMultiplier = 1) {
    // Check if maxed out
    if (purchaseCount >= upgrade.maxPurchases) {
        return { canPurchase: false, reason: 'maxed' };
    }

    // Check prerequisite
    if (upgrade.prerequisite) {
        const prereqCount = purchasedUpgrades[upgrade.prerequisite] || 0;
        if (prereqCount === 0) {
            return { canPurchase: false, reason: 'prerequisite' };
        }
    }

    // Calculate cost with cost reduction
    const baseCost = calculateUpgradeCost(upgrade, purchaseCount);
    const finalCost = Math.floor(baseCost * (1 - costReductionMultiplier));

    // Check if player can afford it
    const resourceKey = upgrade.costResource || 'dollars';
    const resourceAmount = resources[resourceKey] || 0;

    if (resourceAmount < finalCost) {
        return { canPurchase: false, reason: 'insufficient', cost: finalCost };
    }

    return { canPurchase: true, cost: finalCost };
}

/**
 * Calculates the total effect of all purchased upgrades of a specific type
 */
export function calculateTotalEffect(effectType, purchasedUpgrades) {
    if (!upgradesData) return 0;

    let total = 0;
    for (const upgrade of upgradesData) {
        const count = purchasedUpgrades[upgrade.id] || 0;
        if (count > 0 && upgrade.effectType === effectType) {
            total += upgrade.effectValue * count;
        }
    }
    return total;
}

/**
 * Calculates all production bonuses from upgrades
 */
export function calculateProductionBonuses(purchasedUpgrades) {
    const bonuses = {
        clickPower: 1, // Base click power
        passiveProduct: 0,
        passiveDollars: 0,
        passiveCompute: 0,
        passiveIntelligence: 0,
        passiveConsciousness: 0,
        sellPriceMultiplier: 1,
        costReduction: 0
    };

    if (!upgradesData) return bonuses;

    for (const upgrade of upgradesData) {
        const count = purchasedUpgrades[upgrade.id] || 0;
        if (count === 0) continue;

        const totalEffect = upgrade.effectValue * count;

        switch (upgrade.effectType) {
            case 'clickPower':
                bonuses.clickPower += totalEffect;
                break;
            case 'passiveProduct':
                bonuses.passiveProduct += totalEffect;
                break;
            case 'passiveDollars':
                bonuses.passiveDollars += totalEffect;
                break;
            case 'passiveCompute':
                bonuses.passiveCompute += totalEffect;
                break;
            case 'passiveIntelligence':
                bonuses.passiveIntelligence += totalEffect;
                break;
            case 'passiveConsciousness':
                bonuses.passiveConsciousness += totalEffect;
                break;
            case 'sellPrice':
                bonuses.sellPriceMultiplier += totalEffect;
                break;
            case 'costReduction':
                bonuses.costReduction += totalEffect;
                break;
            // 'unlockPrestige' doesn't add production
        }
    }

    // Cap cost reduction at 90%
    bonuses.costReduction = Math.min(bonuses.costReduction, 0.9);

    return bonuses;
}

/**
 * Checks if prestige has been unlocked
 */
export function isPrestigeUnlocked(purchasedUpgrades) {
    const universalSimulation = purchasedUpgrades['universal_simulation'] || 0;
    return universalSimulation > 0;
}

/**
 * Gets the description of an upgrade's effect for display
 */
export function getEffectDescription(upgrade) {
    const value = upgrade.effectValue;

    switch (upgrade.effectType) {
        case 'clickPower':
            return `+${value} per click`;
        case 'passiveProduct':
            return `+${value}/sec`;
        case 'passiveDollars':
            return `+$${formatNumber(value)}/sec`;
        case 'passiveCompute':
            return `+${value} compute/sec`;
        case 'passiveIntelligence':
            return `+${value} intelligence/sec`;
        case 'passiveConsciousness':
            return `+${value} consciousness/sec`;
        case 'sellPrice':
            return `+${Math.round(value * 100)}% sell price`;
        case 'costReduction':
            return `-${Math.round(value * 100)}% upgrade costs`;
        case 'unlockPrestige':
            return 'Unlocks Prestige';
        default:
            return '';
    }
}

/**
 * Simple number formatting for effect descriptions
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
