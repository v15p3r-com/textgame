import gameData from './game.json';

interface GameState {
    currentLocation: string;
    health: number;
    traps: { [key: string]: boolean };
    heals: { [key: string]: boolean };
    locations: { [key: string]: Location };
}

interface Location {
    description: string;
    actions: { [key: string]: string };
    trap?: boolean;
    trapDescription?: string;
    heal?: boolean;
    healDescription?: string;
}

let gameState: GameState = {
    currentLocation: 'start',
    health: 10,
    traps: {},
    heals: {},
    locations: gameData
};

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
