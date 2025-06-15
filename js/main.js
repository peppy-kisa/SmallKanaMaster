document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
});

function initializeApp() {
    console.log('Initializing app...');
    kanaGame.updateTopScreen();
    
    const loadPromises = [
        kanaGame.loadQuestions(1),
        kanaGame.loadMasterTestQuestions()
    ];
    
    Promise.all(loadPromises).then(results => {
        const [questionsLoaded, masterTestLoaded] = results;
        if (!questionsLoaded) {
            console.error('Failed to load questions during initialization');
            showErrorMessage('問題データの読み込みに失敗しました。');
        } else if (!masterTestLoaded) {
            console.error('Failed to load master test questions');
            showErrorMessage('マスターテストデータの読み込みに失敗しました。');
        } else {
            console.log('App initialized successfully');
        }
    }).catch(error => {
        console.error('Initialization error:', error);
        showErrorMessage('アプリの初期化に失敗しました。');
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 1rem;
        max-width: 90%;
        text-align: center;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function attachEventListeners() {
    const startButton = document.getElementById('start-button');
    const masterTestButton = document.getElementById('master-test-button');
    const hintButton = document.getElementById('hint-button');
    const audioButton = document.getElementById('audio-button');
    const retryButton = document.getElementById('retry-button');
    const homeButton = document.getElementById('home-button');
    const rankupOkButton = document.getElementById('rankup-ok');
    const characterElement = document.getElementById('character');
    
    // マスターテスト関連
    const masterHintButton = document.getElementById('master-hint-button');
    const masterAudioButton = document.getElementById('master-audio-button');
    const masterCompleteOkButton = document.getElementById('master-complete-ok');

    if (startButton) {
        startButton.addEventListener('click', startNewGame);
    }

    if (masterTestButton) {
        masterTestButton.addEventListener('click', startMasterTest);
    }

    if (hintButton) {
        hintButton.addEventListener('click', () => {
            kanaGame.showHint();
        });
    }

    if (masterHintButton) {
        masterHintButton.addEventListener('click', () => {
            kanaGame.showMasterTestHint();
        });
    }

    if (audioButton) {
        audioButton.addEventListener('click', () => {
            kanaGame.playQuestionAudio();
        });
    }

    if (masterAudioButton) {
        masterAudioButton.addEventListener('click', () => {
            kanaGame.playMasterTestAudio();
        });
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            kanaGame.retry();
        });
    }

    if (homeButton) {
        homeButton.addEventListener('click', () => {
            kanaGame.returnToTop();
        });
    }

    if (rankupOkButton) {
        rankupOkButton.addEventListener('click', () => {
            kanaGame.showResultScreen();
        });
    }

    if (masterCompleteOkButton) {
        masterCompleteOkButton.addEventListener('click', () => {
            kanaGame.returnToTop();
        });
    }

    if (characterElement) {
        characterElement.addEventListener('click', () => {
            playCharacterAnimation();
        });
    }

    document.addEventListener('keydown', handleKeyboardInput);
}

function startNewGame() {
    const gameData = gameStorage.loadGameData();
    let level = 1;
    
    if (gameData.totalCorrect >= 60) {
        level = 3;
    } else if (gameData.totalCorrect >= 20) {
        level = 2;
    }

    kanaGame.loadQuestions(level).then(success => {
        if (success) {
            kanaGame.isMasterTest = false;
            kanaGame.switchScreen('game-screen');
            kanaGame.startGame();
        } else {
            alert('ゲームの開始に失敗しました。');
        }
    });
}

function startMasterTest() {
    if (kanaGame.masterTestQuestions.length === 0) {
        alert('マスターテストデータが読み込まれていません。');
        return;
    }
    
    const confirmed = confirm('マスターテストを開始しますか？\n30問連続正解が必要で、間違えたら最初からやり直しです。');
    if (confirmed) {
        kanaGame.switchScreen('master-test-screen');
        kanaGame.startMasterTest();
    }
}

function playCharacterAnimation() {
    const character = document.getElementById('character');
    if (character) {
        character.style.animation = 'none';
        character.offsetHeight;
        character.style.animation = 'bounce 0.6s ease';
        
        setTimeout(() => {
            character.style.animation = 'bounce 2s infinite';
        }, 600);
    }
}

function handleKeyboardInput(event) {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;

    const screenId = currentScreen.id;

    switch (screenId) {
        case 'top-screen':
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                startNewGame();
            }
            break;

        case 'game-screen':
            if (event.key === 'h' || event.key === 'H') {
                event.preventDefault();
                kanaGame.showHint();
            } else if (event.key === 's' || event.key === 'S') {
                event.preventDefault();
                kanaGame.playQuestionAudio();
            } else if (['1', '2', '3', '4'].includes(event.key)) {
                event.preventDefault();
                const optionButtons = document.querySelectorAll('.option-button');
                const index = parseInt(event.key) - 1;
                if (optionButtons[index] && !optionButtons[index].classList.contains('disabled')) {
                    optionButtons[index].click();
                }
            }
            break;

        case 'result-screen':
            if (event.key === 'r' || event.key === 'R') {
                event.preventDefault();
                kanaGame.retry();
            } else if (event.key === 'h' || event.key === 'H') {
                event.preventDefault();
                kanaGame.returnToTop();
            }
            break;

        case 'rankup-screen':
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                kanaGame.showResultScreen();
            }
            break;
    }
}

function showLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 1000;
        text-align: center;
        font-size: 1.2rem;
        color: #333;
    `;
    spinner.innerHTML = '読み込み中...<br>🌀';
    document.body.appendChild(spinner);
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

window.addEventListener('beforeunload', function() {
    const gameData = gameStorage.loadGameData();
    gameStorage.saveGameData({
        ...gameData,
        lastPlayDate: new Date().toISOString().split('T')[0]
    });
});

// Service Worker registration removed for now

function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: confetti-fall 3s linear forwards;
            animation-delay: ${Math.random() * 3}s;
        `;
        confettiContainer.appendChild(confetti);
    }
    
    document.body.appendChild(confettiContainer);
    setTimeout(() => confettiContainer.remove(), 6000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

window.createConfetti = createConfetti;