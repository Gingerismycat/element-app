const rates = {
    water:       0.03,   // $ per gallon
    electricity: 0.15,   // $ per kWh
    gas:         0.154,  // $ per therm
};

const spriteMoodAssets = {
    water: {
        happy: 'assets/water-happy.gif',
        sad: 'assets/water-sad.gif',
    },
    electricity: {
        happy: 'assets/lightning-happy.gif',
        sad: 'assets/lightning-sad.gif',
    },
    gas: {
        happy: 'assets/cloud-happy.gif',
        sad: 'assets/cloud-sad.gif',
    },
};

const simulationState = {
    water: {
        resource: 'water',
        unit: 'gal',
        currentUsage: 3120,
        minSimulatedUsage: 2800,
        maxSimulatedUsage: 5600,
        simulatedUsage: 3120,
        angle: 0,
    },
    electricity: {
        resource: 'electricity',
        unit: 'kWh',
        currentUsage: 855,
        minSimulatedUsage: 540,
        maxSimulatedUsage: 1300,
        simulatedUsage: 855,
        angle: 0,
    },
    gas: {
        resource: 'gas',
        unit: 'therms',
        currentUsage: 36,
        minSimulatedUsage: 26,
        maxSimulatedUsage: 80,
        simulatedUsage: 36,
        angle: 0,
    },
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function calcEstimatedCost(resource, simulatedUsage) {
    return simulatedUsage * rates[resource];
}

function calcProjectedUsage(simulatedUsage, currentUsage) {
    return ((simulatedUsage - currentUsage) / currentUsage) * 100;
}

function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
}

function formatCurrency(value) {
    return '$' + value.toFixed(2);
}

function updateSimulationState(resource) {
    const state = simulationState[resource];
    if (!state) return;

    if (state.angle >= 0) {
        const positiveRange = state.maxSimulatedUsage - state.currentUsage;
        state.simulatedUsage = Math.round(
            clamp(
                state.currentUsage + (state.angle / 90) * positiveRange,
                state.currentUsage,
                state.maxSimulatedUsage
            )
        );
    } else {
        const negativeRange = state.currentUsage - state.minSimulatedUsage;
        state.simulatedUsage = Math.round(
            clamp(
                state.currentUsage + (state.angle / 90) * negativeRange,
                state.minSimulatedUsage,
                state.currentUsage
            )
        );
    }

    state.estimatedCost = calcEstimatedCost(resource, state.simulatedUsage);
    state.currentBill = calcEstimatedCost(resource, state.currentUsage);
    state.savings = state.currentBill - state.estimatedCost;
    state.projectedUsage = calcProjectedUsage(state.simulatedUsage, state.currentUsage);
}

function setSimulationAngle(resource, angle) {
    const state = simulationState[resource];
    if (!state) return;
    state.angle = clamp(angle, -90, 90);
    updateSimulationState(resource);
}

function adjustSimulationAngle(resource, deltaAngle) {
    const state = simulationState[resource];
    if (!state) return;
    setSimulationAngle(resource, state.angle + deltaAngle);
}

function updateSimulationCard(resource) {
    const state = simulationState[resource];
    if (!state) return;

    const card = document.querySelector(`[data-resource="${resource}"]`);
    if (!card) return;

    const usageEl = card.querySelector('[data-value="usage"]');
    const costEl = card.querySelector('[data-value="cost"]');
    const billEl = card.querySelector('[data-value="bill"]');
    const currentUsageEl = card.querySelector('[data-value="currentUsage"]');
    const projectedEl = card.querySelector('[data-value="projected"]');
    const savingsLabelEl = card.querySelector('[data-value="savingsLabel"]');
    const savingsEl = card.querySelector('[data-value="savings"]');
    const notch = card.querySelector('.meter-notch');

    if (usageEl) {
        usageEl.textContent = `${formatNumber(state.simulatedUsage)} ${state.unit}`;
    }
    if (costEl) {
        costEl.textContent = formatCurrency(state.estimatedCost);
    }
    if (billEl) {
        billEl.textContent = formatCurrency(state.currentBill);
    }
    if (currentUsageEl) {
        currentUsageEl.textContent = `${formatNumber(state.currentUsage)} ${state.unit}`;
    }
    if (projectedEl) {
        projectedEl.textContent = `${state.projectedUsage.toFixed(1)}%`;
    }
    if (savingsLabelEl) {
        savingsLabelEl.textContent = state.savings < 0 ? 'Money Lost' : 'Money Saved';
    }
    if (savingsEl) {
        savingsEl.textContent = formatCurrency(Math.abs(state.savings));
    }
    if (notch) {
        notch.style.transform = `translate(-50%, -50%) rotate(${state.angle}deg)`;
    }
    const spriteEl = card.querySelector('.meter-sprite');
    if (spriteEl) {
        const mood = state.projectedUsage <= 0 ? 'happy' : 'sad';
        spriteEl.src = spriteMoodAssets[resource]?.[mood] || spriteEl.src;
    }
}

function updateAllSimulationCards() {
    Object.keys(simulationState).forEach(resource => {
        updateSimulationState(resource);
        updateSimulationCard(resource);
    });
}

window.simulation = {
    state: simulationState,
    setSimulationAngle,
    adjustSimulationAngle,
    updateSimulationCard,
    updateAllSimulationCards,
};
