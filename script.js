// CONFIGURATION DE TES IMAGES
const choiceImages = {
    rock: "./images/rock.png",
    paper: "./images/paper.png",
    scissors: "./images/scissors.png"
};

// DOM Elements
const lobbyScreen = document.getElementById("lobbyScreen");
const multiLobbyScreen = document.getElementById("multiLobbyScreen");
const scoresContainer = document.getElementById("scoresContainer");
const battleZone = document.getElementById("battleZone");
const buttonChoice = document.getElementById("buttonChoice");
const victoryModal = document.getElementById("victoryModal");
const victoryTitle = document.getElementById("victoryTitle");
const victoryMessage = document.getElementById("victoryMessage");

const playerPseudoInput = document.getElementById("playerPseudo");
const userPseudoLabel = document.getElementById("userPseudoLabel");
const opponentPseudoLabel = document.getElementById("opponentPseudoLabel");

const scoreBoxes = document.querySelectorAll(".score-box h3");
const pointsDisplay = document.getElementById("points");
const creditDisplay = document.getElementById("credit");
const subtitle = document.querySelector(".subtitle");

const btnSolo = document.getElementById("btnSolo");
const btnMulti = document.getElementById("btnMulti");
const btnCopyLink = document.getElementById("btnCopyLink");
const playAgainButton = document.getElementById("playAgain");

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const contentChoiceUser = document.getElementById("userChoice");
const contentChoiceComputer = document.getElementById("computerChoice");
const contentResults = document.getElementById("results");
const possibleChoices = document.querySelectorAll(".choice-btn");

// Popup Déconnexion
const disconnectModal = document.getElementById("disconnectModal");
const btnDisconnectHome = document.getElementById("btnDisconnectHome");

let userChoice = null;
let computerChoice = null;
let points = 0;
let credit = 0;
let opponentPoints = 0;
let gameStarted = false;
let gameMode = "solo";
let currentRoomId = null;
let socket = null;
let matchFinished = false;

// Identifiant stable du joueur (reste le même après une reconnexion)
let playerId = sessionStorage.getItem("rps_pid");
if (!playerId) {
    playerId = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("rps_pid", playerId);
}

// Gestion du pseudo avec LocalStorage
const savedPseudo = localStorage.getItem("rps_pseudo");
if (savedPseudo) playerPseudoInput.value = savedPseudo;

function getPseudo() {
    let name = playerPseudoInput.value.trim();
    if (!name) name = "Joueur" + Math.floor(Math.random() * 100);
    localStorage.setItem("rps_pseudo", name);
    return name;
}

// Détection d'un code dans l'URL (?room=XXXX)
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get("room");
if (roomParam) {
    btnSolo.style.display = "none";
    btnMulti.textContent = "Rejoindre la partie";
}

// 1. MODE SOLO
btnSolo.addEventListener("click", () => {
    gameMode = "solo";
    const myName = getPseudo();
    userPseudoLabel.textContent = myName;
    opponentPseudoLabel.textContent = "Ordinateur";

    subtitle.classList.remove("hidden");
    subtitle.textContent = "Atteignez 7 points pour gagner !";
    scoreBoxes[0].textContent = "POINTS";
    scoreBoxes[1].textContent = "CRÉDIT";
    document.querySelector(".score-value").innerHTML = `<span id="points">0</span>/7`;

    lobbyScreen.classList.add("hidden");
    startRoundUI();
});

// Affichage de l'écran "adversaire parti"
function showOpponentLeft() {
    matchFinished = true;
    sessionStorage.removeItem("rps_room");
    gameStarted = false;

    scoresContainer.classList.add("hidden");
    battleZone.classList.add("hidden");
    buttonChoice.classList.add("hidden");
    contentResults.classList.add("hidden");
    if (victoryModal) victoryModal.classList.add("hidden");

    if (disconnectModal) {
        disconnectModal.classList.remove("hidden");
    } else {
        alert("L'adversaire s'est déconnecté.");
        window.location.href = window.location.pathname;
    }
}

// Prépare l'écran de match multijoueur
function setupMultiMatchUI(opponentPseudo) {
    opponentPseudoLabel.textContent = opponentPseudo;
    multiLobbyScreen.classList.add("hidden");

    subtitle.classList.remove("hidden");
    subtitle.textContent = "Premier à 3 points gagne le match !";
    scoreBoxes[0].textContent = "VOS POINTS";
    scoreBoxes[1].textContent = opponentPseudo.toUpperCase();
    document.querySelector(".score-value").innerHTML = `<span id="points">0</span>/3`;
    creditDisplay.textContent = "0/3";

    startRoundUI();
}

// 2. MODE MULTIJOUEUR
btnMulti.addEventListener("click", () => {
    gameMode = "multi";
    const myName = getPseudo();
    userPseudoLabel.textContent = myName;

    lobbyScreen.classList.add("hidden");
    multiLobbyScreen.classList.remove("hidden");

    const waitingMsg = document.getElementById("waitingMessage");
    waitingMsg.textContent = " Connexion au serveur patientez ...";

    // Détection de l'URL du serveur
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const SOCKET_URL = isLocal 
        ? "http://localhost:3000" 
        : "https://rps-server-ikzi.onrender.com";

    // Le code de salle survit à un rechargement de la page
    currentRoomId = roomParam
        || sessionStorage.getItem("rps_room")
        || Math.random().toString(36).substring(2, 7).toUpperCase();
    sessionStorage.setItem("rps_room", currentRoomId);
    roomCodeDisplay.textContent = currentRoomId;

    // Connexion optimisée avec transports websocket et polling
    socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"]
    });

    // "connect" se redéclenche à chaque reconnexion : on rejoint la salle à chaque fois
    socket.on("connect", () => {
        if (matchFinished) return;
        if (!gameStarted) waitingMsg.textContent = "⏳ En attente de ton adversaire...";
        socket.emit("joinRoom", { roomId: currentRoomId, pseudo: myName, playerId });
    });

    socket.on("connect_error", () => {
        if (!gameStarted) waitingMsg.textContent = "⏳ Réveil du serveur  en cours... Patiente 20-30 secondes.";
    });

    socket.on("roomFull", () => {
        waitingMsg.textContent = "❌ Cette salle est déjà pleine.";
    });

    // Si on revient dans une salle qui n'existe plus alors que le match avait commencé
    socket.on("waitingForOpponent", () => {
        if (gameStarted) showOpponentLeft();
    });

    btnCopyLink.addEventListener("click", () => {
        const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
        navigator.clipboard.writeText(inviteUrl);
        btnCopyLink.textContent = " Lien copié !";
        setTimeout(() => btnCopyLink.textContent = " Copier le lien d'invitation", 2000);
    });

    socket.on("gameStart", ({ opponentPseudo }) => {
        setupMultiMatchUI(opponentPseudo);
        contentResults.textContent = `Match lancé contre ${opponentPseudo} !`;
    });

    socket.on("opponentMadeChoice", () => {
        contentChoiceComputer.innerHTML = "⏳";
        contentResults.textContent = `${opponentPseudoLabel.textContent} a fait son choix !`;
    });

    socket.on("opponentAway", () => {
        contentResults.textContent = `${opponentPseudoLabel.textContent} est parti un instant, on l'attend...`;
        contentResults.className = "result-text";
    });

    socket.on("opponentBack", () => {
        contentResults.textContent = `${opponentPseudoLabel.textContent} est de retour ! Faites votre choix.`;
        contentResults.className = "result-text";
    });

    // Retour dans un match déjà commencé : on restaure les scores
    socket.on("resync", ({ opponentPseudo, yourScore, oppScore }) => {
        setupMultiMatchUI(opponentPseudo);
        points = yourScore;
        opponentPoints = oppScore;
        document.getElementById("points").textContent = points;
        creditDisplay.textContent = `${opponentPoints}/3`;
        buttonChoice.style.pointerEvents = "auto";
        contentResults.textContent = "Reconnecté ! Faites votre choix.";
    });

    socket.on("roundResult", ({ yourChoice, oppChoice, result, yourScore, oppScore, isGameOver }) => {
        renderImage(contentChoiceComputer, oppChoice);
        buttonChoice.style.pointerEvents = "auto";

        points = yourScore;
        opponentPoints = oppScore;
        document.getElementById("points").textContent = points;
        creditDisplay.textContent = `${opponentPoints}/3`;

        if (result === "win") {
            contentResults.textContent = "Point pour vous ! 🎉";
            contentResults.className = "result-text win";
        } else if (result === "lose") {
            contentResults.textContent = `Point pour ${opponentPseudoLabel.textContent} ! 😢`;
            contentResults.className = "result-text lose";
        } else {
            contentResults.textContent = "Égalité ! 🤝";
            contentResults.className = "result-text";
        }

        if (!isGameOver) {
            setTimeout(() => {
                contentChoiceUser.classList.remove("active");
                contentChoiceComputer.classList.remove("active");
                contentChoiceUser.innerHTML = "?";
                contentChoiceComputer.innerHTML = "?";
            }, 1200);
        }
    });

    // Fin du match Multijoueur
    socket.on("matchEnd", ({ won }) => {
        matchFinished = true;
        sessionStorage.removeItem("rps_room");

        setTimeout(() => {
            if (won) {
                if (victoryTitle) victoryTitle.textContent = "🏆 Victoire !";
                victoryMessage.textContent = `Bravo ! Vous avez battu ${opponentPseudoLabel.textContent} 3 à ${opponentPoints} !`;
            } else {
                if (victoryTitle) victoryTitle.textContent = "😢 Défaite...";
                victoryMessage.textContent = `Dommage... ${opponentPseudoLabel.textContent} l'emporte 3 à ${points}. Revanche ?`;
            }
            showVictoryModal();
        }, 1200);
    });

    // Popup personnalisée en cas de déconnexion (plus d'alert bloquant)
    socket.on("opponentLeft", () => {
        showOpponentLeft();
    });
});

// Choix de l'arme
possibleChoices.forEach(choice => {
    choice.addEventListener("click", (e) => {
        if (!gameStarted) return;
        userChoice = e.currentTarget.id;

        renderImage(contentChoiceUser, userChoice);
        contentChoiceUser.classList.add("active");

        if (gameMode === "solo") {
            playRoundSolo();
        } else {
            buttonChoice.style.pointerEvents = "none";
            contentResults.textContent = "En attente de l'adversaire...";
            socket.emit("makeChoice", { roomId: currentRoomId, choice: userChoice });
        }
    });
});

function renderImage(container, choiceKey) {
    container.innerHTML = `<img src="${choiceImages[choiceKey]}" alt="${choiceKey}">`;
}

function startRoundUI() {
    gameStarted = true;
    points = 0;
    credit = 0;
    opponentPoints = 0;

    scoresContainer.classList.remove("hidden");
    battleZone.classList.remove("hidden");
    buttonChoice.classList.remove("hidden");
    contentResults.classList.remove("hidden");

    contentChoiceUser.innerHTML = "?";
    contentChoiceComputer.innerHTML = "?";
    contentResults.textContent = "Faites votre choix !";
    contentResults.className = "result-text";
}

// Logique SOLO
function playRoundSolo() {
    const choices = ["rock", "paper", "scissors"];
    computerChoice = choices[Math.floor(Math.random() * choices.length)];

    renderImage(contentChoiceComputer, computerChoice);
    contentChoiceComputer.classList.add("active");

    if (userChoice === computerChoice) {
        contentResults.textContent = "Égalité ! 🤝";
        contentResults.className = "result-text";
    } else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "scissors" && computerChoice === "paper") ||
        (userChoice === "paper" && computerChoice === "rock")
    ) {
        if (credit < 0) credit++;
        else points++;
        contentResults.textContent = "Vous gagnez ! 🎉";
        contentResults.className = "result-text win";
    } else {
        if (points > 0) points--;
        else credit--;
        contentResults.textContent = "Vous perdez ! 😢";
        contentResults.className = "result-text lose";
    }

    document.getElementById("points").textContent = points;
    creditDisplay.textContent = credit;

    if (points >= 7) {
        if (victoryTitle) victoryTitle.textContent = "🏆 Victoire !";
        victoryMessage.textContent = "Félicitations, vous avez atteint 7 points consécutifs !";
        showVictoryModal();
    } else if (credit <= -7) {
        if (victoryTitle) victoryTitle.textContent = "💀 Défaite...";
        victoryMessage.textContent = "Game Over ! Votre crédit est tombé à -7. Vous avez perdu !";
        showVictoryModal();
    } else {
        setTimeout(() => {
            contentChoiceUser.classList.remove("active");
            contentChoiceComputer.classList.remove("active");
            contentChoiceUser.innerHTML = "?";
            contentChoiceComputer.innerHTML = "?";
        }, 1000);
    }
}

function showVictoryModal() {
    victoryModal.classList.remove("hidden");
    scoresContainer.classList.add("hidden");
    battleZone.classList.add("hidden");
    buttonChoice.classList.add("hidden");
    contentResults.classList.add("hidden");
    subtitle.classList.add("hidden");
    gameStarted = false;
}

playAgainButton.addEventListener("click", () => {
    sessionStorage.removeItem("rps_room");
    window.location.href = window.location.pathname;
});

if (btnDisconnectHome) {
    btnDisconnectHome.addEventListener("click", () => {
        sessionStorage.removeItem("rps_room");
        window.location.href = window.location.pathname;
    });
}