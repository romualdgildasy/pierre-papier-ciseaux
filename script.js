// const contentChoiceOrdinator = document.getElementById(Ordinator_Choice);
// const contentChoiceUsers = document.getElementById(User_Choice);
// const contentResults = document.getElementById(results);

// const possibleChoice = document.querySelectorAll('button');

// let userChoice 
// let results
// let ordinateurChoice

// possibleChoice.forEach(possibleChoice => possibleChoice.addEventListener('click', (e)=>{
//     userChoice = e.target.id;

//     contentChoiceUsers.innerHTML = `<img src= "${userChoice}.png">`

//     generate_choice_ordi()
//     verification()
// }))


// function generate_choice_ordi (){
//     random = Math.floor(Math.random()*3) +1 //generate number between 1 and 3
//     if(random === 1){
//         ordinateurChoice = "Stone"
//     }
//     if(random === 2){
//         ordinateurChoice = "Paper"
//     }
//     if(random === 3){
//         ordinateurChoice = "Chisel"
//     }
//     contentChoiceOrdinator.innerHTML = `<img src="${ordinateurChoice}.png"`
// }
 

// function verification(){
//     // Equality
//     if(userChoice == ordinateurChoice){
//         results = "Egalité!"
//     }

//    //Users Lost
//     if (userChoice == "Stone" && ordinateurChoice == "Paper") {
//         results = "Perdu!"
//     }

//     if (userChoice == "Paper" && ordinateurChoice == "Chisel") {
//         results = "Perdu!"
//     }
//     if (userChoice == "Chisel" && ordinateurChoice == "Stone") {
//         results = "Perdu!"
//     }

//     // Users Win
//     if (userChoice == "Stone" && ordinateurChoice == "Chisel") {
//         results = "Gangné!"
//     }

//     if (userChoice == "Chisel" && ordinateurChoice == "Paper") {
//         results = "Gangné!"
//     }

//     if (userChoice == "Paper" && ordinateurChoice == "Stone") {
//         results = "Gangné!"
//     }

//     contentResults.innerHTML = results;
// }

const contentChoiceOrdinator = document.getElementById("Ordinator_Choice");
const contentChoiceUsers = document.getElementById("User_Choice");
const contentResults = document.getElementById("results");

const possibleChoices = document.querySelectorAll("button");

let userChoice;
let results;
let ordinateurChoice;

possibleChoices.forEach(choice => choice.addEventListener("click", (e) => {
    userChoice = e.target.id; // Récupérer le choix de l'utilisateur

    // Affichage de l'image correspondant au choix de l'utilisateur
    contentChoiceUsers.innerHTML = `<img src="images/${userChoice}.png" alt="${userChoice}">`;

    // Génération du choix de l'ordinateur
    generate_choice_ordi();
    
    // Vérification du gagnant
    verification();
}));

// Générer le choix de l'ordinateur aléatoirement
function generate_choice_ordi() {
    const choices = ["rock", "paper", "scissors"];
    const randomIndex = Math.floor(Math.random() * choices.length);
    ordinateurChoice = choices[randomIndex];

    // Affichage de l'image correspondant au choix de l'ordinateur
    contentChoiceOrdinator.innerHTML = `<img src="images/${ordinateurChoice}.png" alt="${ordinateurChoice}">`;
}

// Vérifier qui a gagné
function verification() {
    if (userChoice === ordinateurChoice) {
        results = "Égalité !";
    } else if (
        (userChoice === "rock" && ordinateurChoice === "scissors") ||
        (userChoice === "scissors" && ordinateurChoice === "paper") ||
        (userChoice === "paper" && ordinateurChoice === "rock")
    ) {
        results = " Your Win ! 🎉";
    } else {
        results = "Your Lost !";
    }

    contentResults.innerHTML = results;
}
