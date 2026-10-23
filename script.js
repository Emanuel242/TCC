
const menu = document.getElementById("menu");
const game = document.getElementById("game");

const startButton = document.getElementById("startButton");
const settingsButton = document.getElementById("settingsButton");
const exitButton = document.getElementById("exitButton");
const backButton = document.getElementById("backButton");

const executeButton = document.getElementById("executeButton");
const clearButton = document.getElementById("clearButton");

const programSequence = document.getElementById("programSequence");
const commandCounter = document.getElementById("commandCounter");
const gameMessage = document.getElementById("gameMessage");
const battleLog = document.getElementById("battleLog");

const commandButtons = document.querySelectorAll(".command-button");

const MAX_HP = 10;
const MAX_STAMINA = 4;
const MAX_COMMANDS = 3;

const commandNames = {
    atk: "codigo atk",
    strong: "codigo atk_forte",
    def: "codigo def",
    dodge: "codigo esquiva",
    sleep: "codigo sleep"
};

const commandCosts = {
    atk: 1,
    strong: 2,
    def: 1,
    dodge: 1,
    sleep: 0
};

let player;
let enemy;
let commands = [];
let currentCommand = 0;
let gameOver = false;
let round = 0;

function createFighter() {
    return {
        hp: MAX_HP,
        stamina: MAX_STAMINA,
        guarding: false,
        dodging: false
    };
}

function resetGame() {
    player = createFighter();
    enemy = createFighter();

    commands = [];
    currentCommand = 0;
    gameOver = false;
    round = 0;

    battleLog.innerHTML = "";
    addLog("O combate começou! Escolha seus comandos.");

    gameMessage.textContent = "Monte sua sequência de combate.";

    renderCommands();
    updateStats();
    updateButtons();
}

startButton.addEventListener("click", () => {
    resetGame();
    menu.classList.add("hidden");
    game.classList.remove("hidden");
});

settingsButton.addEventListener("click", () => {
    alert("Configurações: Em breve!");
});

exitButton.addEventListener("click", () => {
    alert("Obrigado por jogar CodeHero!");
});

backButton.addEventListener("click", () => {
    game.classList.add("hidden");
    menu.classList.remove("hidden");
});

commandButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (gameOver || currentCommand > 0) {
            return;
        }

        if (commands.length === MAX_COMMANDS) {
            commands = [];
            currentCommand = 0;

            renderCommands();

            gameMessage.textContent =
                "Sequência reiniciada. Escolha seus comandos novamente.";

            updateButtons();
            return;
        }

        const command = button.dataset.command;

        commands.push(command);

        renderCommands();

        gameMessage.textContent =
            `${commandNames[command]} adicionado à sequência.`;

        updateButtons();
    });
});

clearButton.addEventListener("click", () => {
    if (gameOver || currentCommand > 0) {
        return;
    }

    commands = [];

    renderCommands();

    gameMessage.textContent = "Sequência limpa. Escolha novos comandos.";

    updateButtons();
});

executeButton.addEventListener("click", executeTurn);

function executeTurn() {
    if (gameOver || commands.length === 0) {
        return;
    }

    if (currentCommand >= commands.length) {
        return;
    }

    if (currentCommand === 0) {
        round++;
        addLog(`Rodada ${round} iniciada.`);
    }

    const command = commands[currentCommand];

    currentCommand++;

    addLog(`Você executou ${commandNames[command]}.`);

    executePlayerAction(command);

    if (player.hp > 0 && enemy.hp > 0) {
        executeEnemyAction();
    }

    updateStats();
    renderCommands();
    checkGameOver();

    if (!gameOver && currentCommand >= commands.length) {
        commands = [];
        currentCommand = 0;

        renderCommands();

        gameMessage.textContent =
            "Sequência concluída! Monte um novo programa.";

        addLog("Sua sequência terminou. Escolha os próximos comandos.");
    }

    updateButtons();
}

function executePlayerAction(command) {
    const cost = commandCosts[command];

    if (player.stamina < cost) {
        addLog("Você não tem stamina suficiente. A ação falhou.");
        gameMessage.textContent = "Stamina insuficiente! O inimigo terá sua vez.";
        return;
    }

    player.stamina -= cost;

    switch (command) {
        case "atk":
            attackEnemy(1);
            break;

        case "strong":
            attackEnemy(3);
            break;

        case "def":
            player.guarding = true;
            player.dodging = false;
            addLog("Você preparou a defesa contra o próximo ataque.");
            break;

        case "dodge":
            player.dodging = true;
            player.guarding = false;
            addLog("Você se preparou para esquivar do próximo ataque.");
            break;

        case "sleep":
            recoverStamina(player);
            addLog("Você descansou e recuperou stamina.");
            break;
    }
}

function attackEnemy(damage) {
    if (enemy.guarding) {
        damage = Math.floor(damage / 2);
        enemy.guarding = false;

        addLog("A defesa do inimigo reduziu o dano!");
    }

    enemy.hp = Math.max(0, enemy.hp - damage);

    addLog(`Você causou ${damage} de dano ao inimigo.`);
}

function executeEnemyAction() {
    if (enemy.hp <= 0 || player.hp <= 0) {
        return;
    }

    let action;

    if (enemy.stamina < 1) {
        action = "sleep";
    } else {
        const availableActions = ["atk", "def", "sleep"];
        action = availableActions[
            Math.floor(Math.random() * availableActions.length)
        ];
    }

    switch (action) {
        case "atk":
            enemy.stamina -= 1;
            attackPlayer(1);
            break;

        case "def":
            enemy.stamina -= 1;
            enemy.guarding = true;
            addLog("O inimigo preparou sua defesa.");
            break;

        case "sleep":
            recoverStamina(enemy);
            addLog("O inimigo descansou e recuperou stamina.");
            break;
    }
}

function attackPlayer(damage) {
    if (player.dodging) {
        player.dodging = false;

        if (Math.random() < 0.5) {
            addLog("Você esquivou do ataque inimigo!");
            return;
        }

        addLog("A esquiva falhou!");
    }

    if (player.guarding) {
        damage = Math.floor(damage / 2);
        player.guarding = false;

        addLog("Sua defesa reduziu o dano recebido.");
    }

    player.hp = Math.max(0, player.hp - damage);

    addLog(`O inimigo causou ${damage} de dano em você.`);
}

function recoverStamina(fighter) {
    fighter.stamina = Math.min(
        MAX_STAMINA,
        fighter.stamina + 2
    );
}

function updateStats() {
    updateFighterStats("player", player);
    updateFighterStats("enemy", enemy);
}

function updateFighterStats(name, fighter) {
    const hpText = document.getElementById(`${name}HpText`);
    const hpBar = document.getElementById(`${name}HpBar`);

    const staminaText = document.getElementById(`${name}StaminaText`);
    const staminaBar = document.getElementById(`${name}StaminaBar`);

    hpText.textContent = `${fighter.hp}/${MAX_HP}`;
    hpBar.style.width = `${fighter.hp / MAX_HP * 100}%`;

    staminaText.textContent =
        `${fighter.stamina}/${MAX_STAMINA}`;

    staminaBar.style.width =
        `${fighter.stamina / MAX_STAMINA * 100}%`;
}

function renderCommands() {
    programSequence.innerHTML = "";

    commandCounter.textContent =
        `${commands.length}/${MAX_COMMANDS} comandos`;

    if (commands.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-sequence";
        emptyMessage.textContent = "Escolha seus comandos acima.";

        programSequence.appendChild(emptyMessage);
        return;
    }

    commands.forEach((command, index) => {
        const block = document.createElement("div");

        block.className = "sequence-block";
        block.dataset.command = command;

        if (index < currentCommand) {
            block.classList.add("executed");
        }

        const number = document.createElement("span");

        number.className = "sequence-number";
        number.textContent = index + 1;

        const name = document.createElement("span");

        name.textContent = commandNames[command];

        block.appendChild(number);
        block.appendChild(name);

        programSequence.appendChild(block);
    });
}

function updateButtons() {
    const selecting = currentCommand === 0;

    commandButtons.forEach((button) => {
        button.disabled =
            gameOver ||
            !selecting ||
            commands.length >= MAX_COMMANDS;
    });

    clearButton.disabled = gameOver || !selecting;

    executeButton.disabled =
        gameOver ||
        commands.length === 0 ||
        currentCommand >= commands.length;

    executeButton.textContent =
        currentCommand > 0 && currentCommand < commands.length
            ? "▶ Próxima ação"
            : "▶ Start";
}

function checkGameOver() {
    if (player.hp > 0 && enemy.hp > 0) {
        return;
    }

    gameOver = true;

    if (enemy.hp <= 0 && player.hp > 0) {
        gameMessage.textContent = "Vitória! Você derrotou o inimigo!";
        addLog("VITÓRIA! O herói venceu o combate.");
    } else if (player.hp <= 0 && enemy.hp > 0) {
        gameMessage.textContent = "Derrota! O inimigo venceu o combate.";
        addLog("DERROTA! Você ficou sem vida.");
    } else {
        gameMessage.textContent = "Empate! Ambos foram derrotados.";
        addLog("EMPATE! Os dois personagens chegaram a zero de vida.");
    }
}

function addLog(message) {
    const entry = document.createElement("p");

    entry.textContent = message;

    battleLog.prepend(entry);
}

resetGame();
