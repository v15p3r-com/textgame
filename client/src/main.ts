import gameData from './game.json';

interface GameState {
    currentLocation: string;
    health: number;
    maxHealth: number;
    strength: number;
    item: Item | null;
    traps: { [key: string]: boolean };
    heals: { [key: string]: boolean };
    locations: { [key: string]: Location };
}

interface Item {
    name: string;
    strengthBoost: number;
}

interface Enemy {
    name: string;
    strength: number;
    health: number;
}

interface Location {
    description: string;
    actions: { [key: string]: string };
    trap?: boolean;
    trapDescription?: string;
    heal?: boolean;
    healDescription?: string;
    enemy?: Enemy;
}

let gameState: GameState = {
    currentLocation: 'start',
    health: 10,
    maxHealth: 10, // Maximale Lebenspunkte hinzugefügt
    strength: 5,
    item: null,
    traps: {},
    heals: {},
    locations: gameData
};

function updateStats() {
    const healthElement = document.getElementById('health')!;
    const strengthElement = document.getElementById('strength')!;
    healthElement.textContent = `Lebenspunkte: ${gameState.health}/${gameState.maxHealth}`;
    strengthElement.textContent = `Stärke: ${gameState.strength}`;
}

function fightEnemy(enemy: Enemy, callback: () => void) {
    const playerStrength = gameState.strength + (gameState.item ? gameState.item.strengthBoost : 0);
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;

    if (playerStrength + playerRoll > enemy.strength + enemyRoll) {
        gameState.health -= 2;
        updateStats();
        gameState.locations[gameState.currentLocation].enemy = undefined;
        showMessage(`Du hast den ${enemy.name} besiegt!`, callback);
    } else {
        gameState.health -= 2;
        updateStats();
        showMessage(`Der ${enemy.name} hat dich verletzt!`, callback);
    }
}

function handleEnemy(callback: () => void) {
    const currentLocation = gameState.locations[gameState.currentLocation];
    if (currentLocation.enemy) {
        showConfirmation(
            `Ein ${currentLocation.enemy.name} greift an! Willst du kämpfen?`,
            () => {
                fightEnemy(currentLocation.enemy, callback);
            }, () => {
                gameState.health -= 2;
                updateStats();
                showMessage(
                    `Der ${currentLocation.enemy.name} hat dich verletzt, als du versucht hast zu fliehen!`,
                    callback);
            });
    } else {
        callback();
    }
}

function showMessage(message: string, callback: () => void) {
    const output = document.getElementById('output')!;
    const input = document.getElementById('input')!;

    output.innerHTML += `<p>${message}</p>`;
    input.innerHTML = '';
    const button = document.createElement('button');
    button.textContent = 'OK';
    button.onclick = () => {
        button.parentElement.removeChild(button);
        callback();
    }
    input.appendChild(button);
}

function showConfirmation(message: string, onConfirm: () => void, onCancel: () => void) {
    const output = document.getElementById('output')!;
    const input = document.getElementById('input')!;

    output.innerHTML += `<p>${message}</p>`;
    input.innerHTML = '';

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Ja';
    yesButton.onclick = () => onConfirm();
    input.appendChild(yesButton);

    const noButton = document.createElement('button');
    noButton.textContent = 'Nein';
    noButton.onclick = () => onCancel();
    input.appendChild(noButton);
}

function render() {
    const output = document.getElementById('output')!;
    const input = document.getElementById('input')!;

    const currentLocation = gameState.locations[gameState.currentLocation];
    let additionalDescription = '';

    if (currentLocation.trap && !gameState.traps[gameState.currentLocation]) {
        gameState.health -= 5;
        updateStats();
        gameState.traps[gameState.currentLocation] = true;
        additionalDescription = currentLocation.trapDescription || '';
    }

    if (currentLocation.heal && !gameState.heals[gameState.currentLocation]) {
        gameState.health = gameState.maxHealth;
        updateStats();
        gameState.heals[gameState.currentLocation] = true;
        additionalDescription = currentLocation.healDescription || '';
    }

    output.innerHTML = `<p>${currentLocation.description}</p><p>${additionalDescription}</p>`;
    input.innerHTML = '';

    if (gameState.health <= 0) {
        output.innerHTML += `<p>Du bist gestorben.</p>`;
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Neu beginnen';
        restartButton.onclick = () => restart();
        input.appendChild(restartButton);
        return;
    }

    handleEnemy(() => {
        for (const [action, nextLocation] of Object.entries(currentLocation.actions)) {
            const button = document.createElement('button');
            button.textContent = action;
            button.onclick = () => {
                gameState.currentLocation = nextLocation;
                render();
            };
            input.appendChild(button);
        }
    });
}

function restart() {
    console.log('restart');
    gameState.currentLocation = 'start';
    gameState.health = gameState.maxHealth;
    gameState.traps = {};
    gameState.heals = {};
    updateStats();
    render();
}

document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    render();
});
