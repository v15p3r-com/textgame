import gameData from './game.json';

interface GameState {
    currentLocation: string;
    locations: { [key: string]: Location };
}

interface Location {
    description: string;
    actions: { [key: string]: string };
}

let gameState: GameState = {
    currentLocation: 'start',
    locations: gameData
};

function render() {
    const output = document.getElementById('output')!;
    const input = document.getElementById('input')!;

    const currentLocation = gameState.locations[gameState.currentLocation];
    output.innerHTML = `<p>${currentLocation.description}</p>`;
    input.innerHTML = '';

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

document.addEventListener('DOMContentLoaded', render);
