import gameData from './game.json';

interface GameState {
    previousLocation: string | null;
    currentLocation: string;
    health: number;
    maxHealth: number;
    strength: number;
    weapon: Weapon | null;
    traps: { [key: string]: boolean };
    heals: { [key: string]: boolean };
    locations: { [key: string]: Location };
}

interface Weapon {
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
    weapon?: Weapon;
}

let gameState: GameState = {
    previousLocation: null,
    currentLocation: 'start',
    health: 10,
    maxHealth: 10,
    strength: 5,
    weapon: null,
    traps: {},
    heals: {},
    locations: gameData
};

function updateStats() {
    const healthElement = document.getElementById('health')!;
    const strengthElement = document.getElementById('strength')!;
    const weaponElement = document.getElementById('weapon')!;
    healthElement.textContent = `Lebenspunkte: ${gameState.health}/${gameState.maxHealth}`;
    strengthElement.textContent = `Stärke: ${gameState.strength}`;
    weaponElement.textContent = `Waffe: ${gameState.weapon ? gameState.weapon.name : 'Keine'}`;
}

function pickUpWeapon(location: string) {
    const currentLocation = gameState.locations[location];
    if (currentLocation.weapon) {
        const newWeapon = currentLocation.weapon;
        // Remove the weapon from the location
        currentLocation.weapon = undefined;
        if (gameState.weapon) {
            // Drop the old weapon
            const oldItem = gameState.weapon;
            gameState.locations[gameState.currentLocation].weapon = oldItem;
            gameState.strength -= oldItem.strengthBoost;
        }
        // Pick up the new weapon
        gameState.weapon = newWeapon;
        gameState.strength += newWeapon.strengthBoost;
        updateStats();
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

function fightEnemy(enemy: Enemy, callback: () => void) {
    const playerStrength = gameState.strength + (gameState.weapon ? gameState.weapon.strengthBoost : 0);
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;

    if (playerStrength + playerRoll > enemy.strength + enemyRoll) {
        updateStats();
        gameState.locations[gameState.currentLocation].enemy = undefined;
        showMessage(`Du hast den ${enemy.name} besiegt!`, callback);
    } else {
        gameState.health -= 2;
        updateStats();
        showMessage(`Der ${enemy.name} hat dich verletzt!`, callback);
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

            // Check if the action leads back to the previous location
            if (nextLocation === gameState.previousLocation) {
                button.innerHTML = `<span style="font-size: small;">${action}<br>(zurück gehen)</span>`;
            } else {
                button.textContent = action;
            }

            button.onclick = () => {
                gameState.previousLocation = gameState.currentLocation;
                gameState.currentLocation = nextLocation;
                render();
            };
            input.appendChild(button);
        }

        if (currentLocation.weapon) {
            const weaponButton = document.createElement('button');
            weaponButton.textContent = `Nimm ${currentLocation.weapon.name}`;
            weaponButton.onclick = () => {
                pickUpWeapon(gameState.currentLocation);
                render();
            };
            input.appendChild(weaponButton);
        }
    });
}

function restart() {
    gameState.currentLocation = 'start';
    gameState.previousLocation = null;  // Add this line to reset the previous location
    gameState.health = gameState.maxHealth;
    gameState.weapon = null;
    gameState.strength = 5;
    gameState.traps = {};
    gameState.heals = {};
    updateStats();
    render();
}

document.addEventListener('DOMContentLoaded', () => {
    gameState.previousLocation = null;  // Add this line to initialize the previous location
    updateStats();
    render();
});
