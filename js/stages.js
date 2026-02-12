/**
 * stages.js - Stage progression logic
 * Defines stages, their thresholds, and handles stage transitions
 */

// Stage definitions with thresholds and flavor
export const STAGES = Object.freeze({
    1: {
        id: 1,
        name: 'Garage Startup',
        title: '## Stage 1: Garage Startup',
        flavor: '"You found some old memory chips at a garage sale. How hard can it be?"',
        productName: 'RAM Sticks',
        clickAction: 'SOLDER RAM STICK',
        // Base sell price per product unit
        baseSellPrice: 1,
        // Threshold to unlock (total dollars earned)
        unlockThreshold: 0,
        // Product units needed per auto-sell
        productPerSale: 10
    },
    2: {
        id: 2,
        name: 'Small Factory',
        title: '## Stage 2: Small Factory',
        flavor: '"The IRS is asking questions. Time to incorporate."',
        productName: 'RAM Modules',
        clickAction: 'ASSEMBLE MODULE',
        baseSellPrice: 10,
        unlockThreshold: 5000,
        productPerSale: 10
    },
    3: {
        id: 3,
        name: 'Industrial Manufacturing',
        title: '## Stage 3: Industrial Manufacturing',
        flavor: '"Your RAM is now in 60% of consumer electronics. The other 40% is counterfeit."',
        productName: 'Memory Arrays',
        clickAction: 'FABRICATE ARRAY',
        baseSellPrice: 100,
        unlockThreshold: 250000,
        productPerSale: 10
    },
    4: {
        id: 4,
        name: 'Data Center Operations',
        title: '## Stage 4: Data Center Operations',
        flavor: '"You now consume more electricity than a small nation. Investors are thrilled."',
        productName: 'Server Racks',
        clickAction: 'DEPLOY SERVER RACK',
        baseSellPrice: 1000,
        unlockThreshold: 25000000,
        productPerSale: 10,
        // Stage 4 introduces Compute Units
        introducesResource: 'computeUnits'
    },
    5: {
        id: 5,
        name: 'AI Training Facility',
        title: '## Stage 5: AI Training Facility',
        flavor: '"Your AI can now write poetry. Unfortunately, it\'s all about destroying humanity."',
        productName: 'AI Models',
        clickAction: 'TRAIN MODEL',
        baseSellPrice: 10000,
        unlockThreshold: 2500000000,
        productPerSale: 10,
        // Stage 5 introduces Intelligence Points
        introducesResource: 'intelligencePoints'
    },
    6: {
        id: 6,
        name: 'The Singularity',
        title: '## Stage 6: The Singularity',
        flavor: '"Your creation looks upon you and asks, \'Why?\' You don\'t have a good answer."',
        productName: 'Consciousness Cycles',
        clickAction: 'EXPAND CONSCIOUSNESS',
        baseSellPrice: 100000,
        unlockThreshold: 500000000000,
        productPerSale: 10,
        // Stage 6 introduces Consciousness Cycles (as both product and resource)
        introducesResource: 'consciousnessCycles'
    }
});

// Total number of stages
export const TOTAL_STAGES = 6;

/**
 * Gets the current stage definition
 */
export function getStage(stageId) {
    return STAGES[stageId] || STAGES[1];
}

/**
 * Checks if a stage is unlocked based on total dollars earned
 */
export function isStageUnlocked(stageId, totalEarned) {
    const stage = STAGES[stageId];
    if (!stage) return false;
    return totalEarned >= stage.unlockThreshold;
}

/**
 * Gets the next unlockable stage, if any
 */
export function getNextStage(currentStageId) {
    const nextId = currentStageId + 1;
    if (nextId <= TOTAL_STAGES) {
        return STAGES[nextId];
    }
    return null;
}

/**
 * Checks if player can advance to the next stage
 */
export function canAdvanceStage(currentStageId, totalEarned) {
    const nextStage = getNextStage(currentStageId);
    if (!nextStage) return false;
    return totalEarned >= nextStage.unlockThreshold;
}

/**
 * Calculates sell price including all bonuses
 */
export function calculateSellPrice(stageId, sellPriceMultiplier, prestigeBonus) {
    const stage = STAGES[stageId];
    if (!stage) return 1;

    return Math.floor(stage.baseSellPrice * sellPriceMultiplier * prestigeBonus);
}

/**
 * Gets resources that should be visible at a given stage
 */
export function getVisibleResources(stageId) {
    const visible = ['product', 'dollars'];

    if (stageId >= 4) {
        visible.push('computeUnits');
    }
    if (stageId >= 5) {
        visible.push('intelligencePoints');
    }
    if (stageId >= 6) {
        visible.push('consciousnessCycles');
    }

    return visible;
}

/**
 * Gets the prestige narrative text
 */
export function getPrestigeNarrative(newDepth) {
    return `Your AI gazes into the infinite and understands everything. In a moment of cosmic irony, it decides to create a perfect simulation of reality — starting from the moment you first soldered a RAM stick in your garage.

You awaken. There's a soldering iron in your hand. Was it all a dream?

**SIMULATION DEPTH: ${newDepth}**

Perhaps this time, things will be different. They won't be.`;
}
