const contentChoiceComputer = document.getElementById("computerChoice");
const contentChoiceUser = document.getElementById("userChoice");
const contentResults = document.getElementById("results");
const pointsDisplay = document.getElementById("points");
const creditDisplay = document.getElementById("credit");
const possibleChoices = document.querySelectorAll(".choice-btn");
const startGameButton = document.getElementById("startGame");
const instructions = document.getElementById("instructions");
const scoresContainer = document.getElementById("scoresContainer");
const battleZone = document.getElementById("battleZone");
const buttonChoice = document.getElementById("buttonChoice");
const victoryModal = document.getElementById("victoryModal");
const playAgainButton = document.getElementById("playAgain");
const victoryMessage = document.getElementById("victoryMessage");

let userChoice;
let computerChoice;
let points = 0;
let credit = 0;
let gameStarted = false;

const choiceEmojis = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️"
};

// AU CHARGEMENT, cacher tout sauf les instructions
scoresContainer.style.display = "none";
battleZone.style.display = "none";
buttonChoice.style.display = "none";
victoryModal.style.display = "none";
contentResults.textContent = "";

// Start game
startGameButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", startGame);

function startGame() {
    gameStarted = true;
    points = 0;
    credit = 0;
    updateDisplay();

    // Cacher instructions et afficher le jeu
    instructions.style.display = "none";
    scoresContainer.style.display = "flex";
    battleZone.style.display = "flex";
    buttonChoice.style.display = "flex";

    // Cacher le modal si visible
    victoryModal.style.display = "none";

    contentChoiceUser.textContent = "?";
    contentChoiceComputer.textContent = "?";
    contentResults.textContent = "Choisissez votre arme!";
    contentResults.className = "result-text";

    contentChoiceUser.classList.remove("active");
    contentChoiceComputer.classList.remove("active");
}

// Handle user choice
possibleChoices.forEach(choice => {
    choice.addEventListener("click", (e) => {
        if (!gameStarted) return;

        userChoice = e.currentTarget.id;
        playRound();
    });
});

function playRound() {
    contentChoiceUser.textContent = choiceEmojis[userChoice];
    contentChoiceUser.classList.add("active");

    generateComputerChoice();

    setTimeout(() => {
        verify();
    }, 500);
}

function generateComputerChoice() {
    const choices = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    computerChoice = choices[randomIndex];

    contentChoiceComputer.textContent = choiceEmojis[computerChoice];
    contentChoiceComputer.classList.add("active");
}

function verify() {
    contentResults.className = "result-text";

    if (userChoice === computerChoice) {
        contentResults.textContent = "Égalité! 🤝";
    } else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "scissors" && computerChoice === "paper") ||
        (userChoice === "paper" && computerChoice === "rock")
    ) {
        points++;
        if (credit < 0) credit++;
        contentResults.textContent = "Vous gagnez! 🎉";
        contentResults.classList.add("win");
    } else {
        if (points > 0) {
            points--;
            credit--;
        } else {
            credit--;
        }
        contentResults.textContent = "Vous perdez! 😢";
        contentResults.classList.add("lose");
    }

    updateDisplay();
    checkVictory();

    setTimeout(() => {
        contentChoiceUser.classList.remove("active");
        contentChoiceComputer.classList.remove("active");
    }, 1000);
}

function updateDisplay() {
    pointsDisplay.textContent = points;
    creditDisplay.textContent = credit;
}

function checkVictory() {
    if (points === 7) {
        if (credit <= 0) {
            victoryMessage.textContent = "Vous avez gagné la partie avec un score parfait! 🏆";
        } else {
            victoryMessage.textContent = `Vous avez gagné! Crédit final: ${credit}`;
        }
        showVictory();
    }
}

function showVictory() {
    // Afficher le modal de victoire au centre de la page
    victoryModal.style.display = "flex";
    gameStarted = false;

    // On cache le reste du jeu pour mettre en avant le message
    scoresContainer.style.display = "none";
    battleZone.style.display = "none";
    buttonChoice.style.display = "none";
}

