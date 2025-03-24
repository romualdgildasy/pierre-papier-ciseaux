
// const contentChoiceOrdinator = document.getElementById("Ordinator_Choice");
// const contentChoiceUsers = document.getElementById("User_Choice");
// const contentResults = document.getElementById("results");

// const possibleChoices = document.querySelectorAll("button");

// let userChoice;
// let results;
// let ordinateurChoice;

// possibleChoices.forEach(choice => choice.addEventListener("click", (e) => {
//     userChoice = e.target.id; // Récupérer le choix de l'utilisateur

//     // Affichage de l'image correspondant au choix de l'utilisateur
//     contentChoiceUsers.innerHTML = `<img src="images/${userChoice}.png" alt="${userChoice}">`;

//     // Génération du choix de l'ordinateur
//     generate_choice_ordi();
    
//     // Vérification du gagnant
//     verification();
// }));

// // Générer le choix de l'ordinateur aléatoirement
// function generate_choice_ordi() {
//     const choices = ["rock", "paper", "scissors"];
//     const randomIndex = Math.floor(Math.random() * choices.length);
//     ordinateurChoice = choices[randomIndex];

//     // Affichage de l'image correspondant au choix de l'ordinateur
//     contentChoiceOrdinator.innerHTML = `<img src="images/${ordinateurChoice}.png" alt="${ordinateurChoice}">`;
// }

// // Vérifier qui a gagné
// function verification() {
//     if (userChoice === ordinateurChoice) {
//         results = "Égalité !";
//     } else if (
//         (userChoice === "rock" && ordinateurChoice === "scissors") ||
//         (userChoice === "scissors" && ordinateurChoice === "paper") ||
//         (userChoice === "paper" && ordinateurChoice === "rock")
//     ) {
//         results = " Your Win ! 🎉";
//     } else {
//         results = "Your Lost !";
//     }

//     contentResults.innerHTML = results;
// }


const contentChoiceOrdinator = document.getElementById("Ordinator_Choice");
const contentChoiceUsers = document.getElementById("User_Choice");
const contentResults = document.getElementById("results");
const pointsDisplay = document.getElementById("points");
const creditDisplay = document.getElementById("credit");
const possibleChoices = document.querySelectorAll(".choice-btn");
const startGameButton = document.getElementById("startGame");
const instructions = document.getElementById("instructions");

let userChoice;
let ordinateurChoice;
let points = 0;
let credit = 0;
let gameStarted = false;

// Function to start the game
startGameButton.addEventListener("click", () => {
    gameStarted = true;
    instructions.style.display = "none";
});

possibleChoices.forEach(choice => choice.addEventListener("click", (e) => {
    if (!gameStarted) return;

    userChoice = e.target.id; // Get the user's choice
    contentChoiceUsers.innerHTML = `<img src="images/${userChoice}.png" alt="${userChoice}">`;

    generate_choice_ordi();
    verification();
}));

// Generate the computer's choice randomly
function generate_choice_ordi() {
    const choices = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    ordinateurChoice = choices[randomIndex];
    contentChoiceOrdinator.innerHTML = `<img src="images/${ordinateurChoice}.png" alt="${ordinateurChoice}">`;
}

// Check who won
function verification() {
    if (userChoice === ordinateurChoice) {
        contentResults.textContent = "It's a tie!";
    } else if (
        (userChoice === "rock" && ordinateurChoice === "scissors") ||
        (userChoice === "scissors" && ordinateurChoice === "paper") ||
        (userChoice === "paper" && ordinateurChoice === "rock")
    ) {
        points++;
        if (credit < 0) credit = 0;
        contentResults.textContent = "You win! 🎉";
    } else {
        if (points > 0) {
            points--;
            credit--;
        } else {
            credit--;
        }
        contentResults.textContent = "You lose!";
    }

    pointsDisplay.textContent = points;
    creditDisplay.textContent = credit;

    if (points === 7 && credit === 0) {
        contentResults.textContent = "Congratulations, you won the game! 🏆";
        resetGame();
    }
}

// Reset the game
function resetGame() {
    points = 0;
    credit = 0;
    pointsDisplay.textContent = points;
    creditDisplay.textContent = credit;
    gameStarted = false;
    instructions.style.display = "block";
}
