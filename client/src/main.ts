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

function fightEnemy(enemy: Enemy) {
    const playerStrength = gameState.strength + (gameState.item ? gameState.item.strengthBoost : 0);
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const enemyRoll = Math.floor(Math.random() * 6) + 1;

    if (playerStrength + playerRoll > enemy.strength + enemyRoll) {
        gameState.health -= 2;
        gameState.locations[gameState.currentLocation].enemy = undefined;
        alert(`Du hast den ${enemy.name} besiegt!`);
    } else {
        gameState.health -= 2;
        alert(`Der ${enemy.name} hat dich verletzt!`);
    }
}

function handleEnemy() {
    const currentLocation = gameState.locations[gameState.currentLocation];
    if (currentLocation.enemy) {
        const fight = confirm(`Ein ${currentLocation.enemy.name} greift an! Willst du kämpfen?`);
        if (fight) {
            fightEnemy(currentLocation.enemy);
        } else {
            gameState.health -= 2;
            alert(`Der ${currentLocation.enemy.name} hat dich verletzt, als du versucht hast zu fliehen!`);
        }
    }
}

function render() {
    const output = document.getElementById('output')!;
    const input = document.getElementById('input')!;

    const currentLocation = gameState.locations[gameState.currentLocation];
    let additionalDescription = '';

    if (currentLocation.trap && !gameState.traps[gameState.currentLocation]) {
        gameState.health -= 5;
        gameState.traps[gameState.currentLocation] = true;
        additionalDescription = currentLocation.trapDescription || '';
    }

    if (currentLocation.heal && !gameState.heals[gameState.currentLocation]) {
        gameState.health = 10;
        gameState.heals[gameState.currentLocation] = true;
        additionalDescription = currentLocation.healDescription || '';
    }

    output.innerHTML = `<p>${currentLocation.description}</p><p>${additionalDescription}</p><p>Lebenspunkte: ${gameState.health}</p>`;
    input.innerHTML = '';

    if (gameState.health <= 0) {
        output.innerHTML += `<p>Du bist gestorben.</p>`;
        input.innerHTML = '<button onclick="()=> restart()">Neu beginnen</button>';
        return;
    }

    handleEnemy();

    for (const [action, nextLocation] of Object.entries(currentLocation.actions)) {
        const button = document.createElement('button');
        button.textContent = action;
        button.onclick = () => {
            gameState.currentLocation = nextLocation;
            render();
        };
        input.appendChild(button);
    }
}


function restart() {
    console.log('restart');
    gameState.currentLocation = 'start';
    gameState.health = 10;
    gameState.traps = {};
    gameState.heals = {};
    render();
}

(window as any).restart = restart;
document.addEventListener('DOMContentLoaded', render);
