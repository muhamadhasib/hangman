const words = {
    animals: ['elephant', 'giraffe', 'penguin', 'kangaroo', 'dolphin', 'lion', 'tiger', 'zebra', 'rhino', 'hippo'],
    movies: ['inception', 'avatar', 'titanic', 'matrix', 'gladiator', 'jaws', 'alien', 'rocky', 'casablanca'],
    countries: ['australia', 'brazil', 'canada', 'denmark', 'egypt', 'france', 'germany', 'hungary', 'india', 'japan'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white']
};

let currentWord, currentCategory, guessedLetters, remainingGuesses, timerInterval, wins = 0, losses = 0, hints = 3;

const wordElement = document.getElementById('word');
const categoryElement = document.getElementById('category');
const hangmanElement = document.getElementById('hangman');
const keyboardElement = document.getElementById('keyboard');
const timerElement = document.getElementById('timer');
const categoryBtn = document.getElementById('categoryBtn');
const restartBtn = document.getElementById('restartBtn');
const categoryModal = document.getElementById('categoryModal');
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const hintBtn = document.getElementById('hintBtn');
const helpBtn = document.getElementById('helpBtn');
const instructionsModal = document.getElementById('instructionsModal');
const closeInstructionsBtn = document.getElementById('closeInstructions');

function initGame(category = 'random') {
    currentCategory = category === 'random' ? getRandomCategory() : category;
    currentWord = getRandomWord(currentCategory);
    guessedLetters = new Set();
    remainingGuesses = 6;
    clearInterval(timerInterval);
    startTimer();
    updateWord();
    updateHangman();
    createKeyboard();
    categoryElement.textContent = `Category: ${currentCategory}`;
    categoryModal.style.display = 'none';
    hints = 3;
    updateHintButton();
    fadeInElements();
    updateScoreboard();
}

function getRandomCategory() {
    const categories = Object.keys(words);
    return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomWord(category) {
    return words[category][Math.floor(Math.random() * words[category].length)].toUpperCase();
}

function updateWord() {
    wordElement.innerHTML = currentWord
        .split('')
        .map(letter => `<span class="${guessedLetters.has(letter) ? 'guessed' : 'unguessed'}">${guessedLetters.has(letter) ? letter : '_'}</span>`)
        .join('');
}

function updateHangman() {
    const hangmanParts = [
        'M40,200 L160,200', // Base
        'M100,200 L100,20', // Pole
        'M100,20 L140,20', // Top
        'M140,20 L140,40', // Noose
        'M140,40 C150,50 130,60 140,70', // Head
        'M140,70 L140,120', // Body
        'M140,80 L120,100', // Left arm
        'M140,80 L160,100', // Right arm
        'M140,120 L120,140', // Left leg
        'M140,120 L160,140' // Right leg
    ];

    hangmanElement.innerHTML = hangmanParts
        .slice(0, 10 - remainingGuesses)
        .map(d => `<path d="${d}" />`)
        .join('');
}

function createKeyboard() {
    keyboardElement.innerHTML = '';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.addEventListener('click', () => handleGuess(letter));
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleGuess(letter);
        });
        keyboardElement.appendChild(button);
    });
}

function handleGuess(letter) {
    if (guessedLetters.has(letter) || remainingGuesses === 0) return;

    guessedLetters.add(letter);

    if (currentWord.includes(letter)) {
        updateWord();
        playSound('correct');
        animateElement(letter, 'pop-in');
        if (!wordElement.textContent.includes('_')) {
            endGame(true);
        }
    } else {
        remainingGuesses--;
        updateHangman();
        playSound('incorrect');
        animateElement(letter, 'shake');
        if (remainingGuesses === 0) {
            endGame(false);
        }
    }
    updateKeyboard();
}

function animateElement(letter, animationClass) {
    const elements = document.querySelectorAll(`#word span, #keyboard button`);
    elements.forEach(el => {
        if (el.textContent === letter) {
            el.classList.add(animationClass);
            setTimeout(() => el.classList.remove(animationClass), 300);
        }
    });
}

function updateHintButton() {
    hintBtn.textContent = `HINT (${hints} LEFT)`;
    hintBtn.disabled = hints === 0;
}

function endGame(isWin) {
    clearInterval(timerInterval);
    const result = isWin ? 'won' : 'lost';
    const message = isWin ? 'Congratulations!' : `Game Over. The word was: ${currentWord}`;
    
    // Update the word display to show the full word
    wordElement.innerHTML = currentWord
        .split('')
        .map(letter => `<span class="guessed">${letter}</span>`)
        .join('');
    
    // Disable all keyboard buttons
    const keyboardButtons = keyboardElement.querySelectorAll('button');
    keyboardButtons.forEach(button => {
        button.disabled = true;
    });
    
    // Create and display the result message as an overlay
    const overlayElement = document.createElement('div');
    overlayElement.className = 'game-result-overlay';
    overlayElement.innerHTML = `
        <div class="game-result-modal">
            <h2>${message}</h2>
            <p>You ${result} the game!</p>
            <button class="retro-btn" onclick="playAgain()">Play Again</button>
        </div>
    `;
    
    document.body.appendChild(overlayElement);
    
    // Update the scoreboard
    if (isWin) {
        wins++;
        playSound('win');
    } else {
        losses++;
        playSound('lose');
    }
    updateScoreboard();
}

function playAgain() {
    // Remove the game result overlay
    const overlayElement = document.querySelector('.game-result-overlay');
    if (overlayElement) {
        overlayElement.remove();
    }
    
    // Start a new game
    initGame();
}

function updateScoreboard() {
    winsElement.textContent = wins;
    lossesElement.textContent = losses;
}

function startTimer() {
    let timeLeft = 60;
    updateTimer(timeLeft);
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function updateTimer(timeLeft) {
    timerElement.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 10) {
        timerElement.classList.add('time-low');
    } else {
        timerElement.classList.remove('time-low');
    }
}

const soundUrls = {
    correct: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
    incorrect: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
    win: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3',
    lose: 'https://assets.mixkit.co/sfx/preview/mixkit-game-over-trombone-1940.mp3',
    hint: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-glitter-shot-2353.mp3'
};

function playSound(soundType) {
    const audio = new Audio(soundUrls[soundType]);
    audio.play().catch(error => console.error('Error playing sound:', error));
}

function showModal(title, message, buttonText) {
    const modal = document.createElement('div');
    modal.className = 'modal fade-in';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="retro-btn">${buttonText}</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(modal);
        initGame();
    });
}

function getHint() {
    if (hints > 0) {
        const unguessedLetters = currentWord.split('').filter(letter => !guessedLetters.has(letter));
        if (unguessedLetters.length > 0) {
            const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
            handleGuess(randomLetter);
            playSound('hint');
            hints--;
            updateHintButton();
            animateElement(randomLetter, 'pop-in');
        } else {
            showMessage("No more letters to reveal!");
        }
    } else {
        showMessage("No hints left!");
    }
}

function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = 'message fade-in';
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 2000);
}

function fadeInElements() {
    const elements = document.querySelectorAll('.game-container, .modal-content');
    elements.forEach(el => el.classList.add('fade-in'));
}

function updateKeyboard() {
    const keyboardButtons = keyboardElement.querySelectorAll('button');
    keyboardButtons.forEach(button => {
        const letter = button.textContent;
        if (guessedLetters.has(letter)) {
            button.disabled = true;
            button.classList.add(currentWord.includes(letter) ? 'correct-guess' : 'incorrect-guess');
        }
    });
}

categoryBtn.addEventListener('click', openCategoryModal);
categoryBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    openCategoryModal();
});

restartBtn.addEventListener('click', restartGame);
restartBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    restartGame();
});

categoryModal.addEventListener('click', handleCategorySelection);
categoryModal.addEventListener('touchstart', (e) => {
    if (e.target.dataset.category) {
        e.preventDefault();
        handleCategorySelection(e);
    }
});

hintBtn.addEventListener('click', getHint);
hintBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    getHint();
});

helpBtn.addEventListener('click', openInstructionsModal);
helpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    openInstructionsModal();
});

closeInstructionsBtn.addEventListener('click', closeInstructionsModal);
closeInstructionsBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    closeInstructionsModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key.match(/^[a-z]$/i)) {
        handleGuess(e.key.toUpperCase());
    }
});

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.backgroundColor = '#fff';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animation = `twinkle ${Math.random() * 4 + 2}s infinite`;
        starsContainer.appendChild(star);
    }
}

window.addEventListener('load', () => {
    createStars();
    initGame();
});

function openCategoryModal() {
    categoryModal.style.display = 'block';
    fadeInElements();
}

function restartGame() {
    initGame(currentCategory);
}

function handleCategorySelection(e) {
    if (e.target.dataset.category) {
        initGame(e.target.dataset.category);
    }
}

function openInstructionsModal() {
    instructionsModal.style.display = 'block';
    fadeInElements();
}

function closeInstructionsModal() {
    instructionsModal.style.display = 'none';
}

// Add touch event listeners for the document
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            // Swipe left
        } else {
            // Swipe right
        }
    } else {
        if (yDiff > 0) {
            // Swipe up
        } else {
            // Swipe down
        }
    }

    xDown = null;
    yDown = null;
}