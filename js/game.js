class KanaGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.gameResults = [];
        this.totalQuestions = 5;
        this.currentLevel = 1;
        this.isAnswering = false;
    }

    async loadQuestions(level = 1) {
        try {
            console.log(`Loading questions for level ${level}`);
            const response = await fetch(`data/questions-level${level}.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`Loaded ${data.questions.length} questions`);
            
            this.questions = this.shuffleArray(data.questions).slice(0, this.totalQuestions);
            this.currentLevel = level;
            return true;
        } catch (error) {
            console.error('Failed to load questions:', error);
            console.error('Error details:', error.message);
            return false;
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startGame() {
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.gameResults = [];
        this.isAnswering = false;
        this.displayQuestion();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const questionWordElement = document.getElementById('question-word');
        const currentQuestionElement = document.getElementById('current-question');
        const progressBar = document.getElementById('progress-bar');
        const hintDisplay = document.getElementById('hint-display');
        const optionsContainer = document.getElementById('options-container');

        questionWordElement.textContent = question.display;
        currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        
        const progressPercent = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        progressBar.style.width = `${progressPercent}%`;

        hintDisplay.classList.add('hidden');

        this.displayOptions(question);
        this.isAnswering = true;
    }

    displayOptions(question) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        const shuffledOptions = this.shuffleArray(question.options);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(option, question.correctAnswer));
            optionsContainer.appendChild(button);
        });
    }

    selectAnswer(selectedAnswer, correctAnswer) {
        if (!this.isAnswering) return;
        
        this.isAnswering = false;
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedAnswer === correctAnswer;
        
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.classList.add('disabled');
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedAnswer && !isCorrect) {
                button.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.correctAnswers++;
            this.playSound('correct');
        } else {
            this.playSound('incorrect');
        }

        this.gameResults.push({
            question: question,
            selectedAnswer: selectedAnswer,
            isCorrect: isCorrect
        });

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }, 2000);
    }

    showHint() {
        const question = this.questions[this.currentQuestionIndex];
        const hintDisplay = document.getElementById('hint-display');
        const hintText = document.getElementById('hint-text');
        
        hintText.textContent = question.hint;
        hintDisplay.classList.remove('hidden');
    }

    playQuestionAudio() {
        const question = this.questions[this.currentQuestionIndex];
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(question.word);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }

    playSound(type) {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => {
                console.log('Audio play failed:', e);
            });
        }
    }

    endGame() {
        const gameData = gameStorage.updateTotalCorrect(this.correctAnswers);
        
        if (this.correctAnswers === this.totalQuestions) {
            this.playSound('perfect');
        }

        if (gameData.wasRankUp) {
            setTimeout(() => {
                this.showRankUpScreen(gameData.currentRank, gameData.rankBadge);
            }, 1000);
        } else {
            this.showResultScreen();
        }
    }

    showResultScreen() {
        const resultScreen = document.getElementById('result-screen');
        const correctCountElement = document.getElementById('correct-count');
        const totalCountElement = document.getElementById('total-count');
        const perfectBonus = document.getElementById('perfect-bonus');
        const resultsList = document.getElementById('results-list');

        correctCountElement.textContent = this.correctAnswers;
        totalCountElement.textContent = this.totalQuestions;

        if (this.correctAnswers === this.totalQuestions) {
            perfectBonus.classList.remove('hidden');
        } else {
            perfectBonus.classList.add('hidden');
        }

        resultsList.innerHTML = '';
        this.gameResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const wordElement = document.createElement('span');
            wordElement.className = 'result-word';
            wordElement.textContent = result.question.word;
            
            const statusElement = document.createElement('span');
            statusElement.className = 'result-status';
            statusElement.textContent = result.isCorrect ? '⭕' : '❌';
            
            resultItem.appendChild(wordElement);
            resultItem.appendChild(statusElement);
            resultsList.appendChild(resultItem);
        });

        this.switchScreen('result-screen');
    }

    showRankUpScreen(newRank, newBadge) {
        const rankupScreen = document.getElementById('rankup-screen');
        const newRankName = document.getElementById('new-rank-name');
        const newRankBadge = document.getElementById('new-rank-badge');

        newRankName.textContent = newRank;
        newRankBadge.textContent = newBadge;

        this.playSound('rankup');
        this.switchScreen('rankup-screen');
    }

    switchScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    returnToTop() {
        this.switchScreen('top-screen');
        this.updateTopScreen();
    }

    updateTopScreen() {
        const gameData = gameStorage.loadGameData();
        
        const currentRankElement = document.getElementById('current-rank');
        const progressToNextElement = document.getElementById('progress-to-next');
        const totalCorrectElement = document.getElementById('total-correct');
        const characterElement = document.getElementById('character');

        currentRankElement.textContent = `${gameData.currentRank} ${gameData.rankBadge}`;
        
        const progressToNext = gameStorage.getProgressToNextRank();
        if (progressToNext > 0) {
            progressToNextElement.textContent = `あと ${progressToNext}もん`;
        } else {
            progressToNextElement.textContent = 'さいこうランク！';
        }
        
        totalCorrectElement.textContent = `${gameData.totalCorrect}もん`;
        
        const characterEmoji = gameStorage.getCharacterEmoji(gameData.characterLevel);
        characterElement.textContent = characterEmoji;
        characterElement.className = `character level-${gameData.characterLevel}`;
    }

    retry() {
        this.switchScreen('game-screen');
        this.startGame();
    }
}

const kanaGame = new KanaGame();