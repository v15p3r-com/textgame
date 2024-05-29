import gameData from './game.json';

interface GameState {
    currentLocation: string;
    health: number;
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
    strength: 5,
    item: null,
    traps: {},
    heals: {},
    locations: gameData
};

function fightEnemy(enemy: Enemy, callback: () => void) {
    const playerStrength = gameState.strength + (gameState.item ?
        gameState.item.strengthBoost : 0);
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;

    if (playerStrength + playerRoll > enemy.strength + enemyRoll) {
        gameState.health -= 2;
        updateHealth(); // Lebenspunkte aktualisieren
        gameState.locations[gameState.currentLocation].enemy = undefined;
        showMessage(`Du hast den ${enemy.name} besiegt!`, callback);
    } else {
        gameState.health -= 2;
        updateHealth(); // Lebenspunkte aktualisieren
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
                updateHealth(); // Lebenspunkte aktualisieren
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

function showConfirmation(message: string, onConfirm: () => void,
                          onCancel: () => void) {
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
        updateHealth(); // Lebenspunkte aktualisieren
        gameState.traps[gameState.currentLocation] = true;
        additionalDescription = currentLocation.trapDescription || '';
    }

    if (currentLocation.heal && !gameState.heals[gameState.currentLocation]) {
        gameState.health = 10;
        updateHealth(); // Lebenspunkte aktualisieren
        gameState.heals[gameState.currentLocation] = true;
        additionalDescription = currentLocation.healDescription || '';
    }

    output.innerHTML = `<p>${currentLocation.description}</p><p>${additionalDescription}</p><p>Lebenspunkte: ${gameState.health}</p>`;
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
        for (const [action, nextLocation] of Object.entries(
            currentLocation.actions)) {
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

function updateHealth() {
    const output = document.getElementById('output')!;
    output.innerHTML += `<p>Lebenspunkte: ${gameState.health}</p>`;
}

function restart() {
    console.log('restart');
    gameState.currentLocation = 'start';
    gameState.health = 10;
    gameState.traps = {};
    gameState.heals = {};
    render();
}

document.addEventListener('DOMContentLoaded', render);
