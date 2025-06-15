class KanaGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.gameResults = [];
        this.totalQuestions = 5;
        this.currentLevel = 1;
        this.isAnswering = false;
        this.isMasterTest = false;
        this.masterTestQuestions = [];
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
            this.showCorrectEffect();
        } else {
            this.playSound('incorrect');
            this.showIncorrectEffect();
        }

        this.gameResults.push({
            question: question,
            selectedAnswer: selectedAnswer,
            isCorrect: isCorrect
        });

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }, 2500);
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

    showCorrectEffect() {
        this.createFloatingText('せいかい！', '#4CAF50', '🎉');
        this.createSparkles();
        this.animateScore('+1');
    }

    showIncorrectEffect() {
        this.createFloatingText('ざんねん...', '#F44336', '😅');
        this.shakeScreen();
    }

    createFloatingText(text, color, emoji) {
        const floatingText = document.createElement('div');
        floatingText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2.5rem;
            font-weight: bold;
            color: ${color};
            z-index: 1000;
            pointer-events: none;
            text-align: center;
            animation: floatUp 2s ease-out forwards;
        `;
        floatingText.innerHTML = `${emoji}<br>${text}`;
        document.body.appendChild(floatingText);

        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 2000);
    }

    createSparkles() {
        const sparkleCount = 8;
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.style.cssText = `
                    position: fixed;
                    width: 6px;
                    height: 6px;
                    background: #FFD700;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 999;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${Math.random() * window.innerHeight}px;
                    animation: sparkle 1s ease-out forwards;
                `;
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 80);
        }
    }

    showPerfectEffect() {
        this.createGentleConfetti();
        this.createFloatingText('パーフェクト！', '#FFD700', '🌟');
    }

    createGentleConfetti() {
        const colors = ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'];
        const confettiCount = 12;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 999;
                    left: ${50 + (Math.random() - 0.5) * 60}%;
                    top: 20%;
                    animation: gentleFall 3s ease-out forwards;
                `;
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 150);
        }
    }

    animateScore(scoreText) {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) return;

        const scoreAnimation = document.createElement('div');
        scoreAnimation.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 2rem;
            font-weight: bold;
            color: #4CAF50;
            z-index: 1000;
            pointer-events: none;
            animation: scoreFloat 2s ease-out forwards;
        `;
        scoreAnimation.textContent = scoreText;
        gameScreen.appendChild(scoreAnimation);

        setTimeout(() => {
            if (scoreAnimation.parentNode) {
                scoreAnimation.parentNode.removeChild(scoreAnimation);
            }
        }, 2000);
    }

    shakeScreen() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                gameScreen.style.animation = '';
            }, 500);
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
            this.showPerfectEffect();
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

    async loadMasterTestQuestions() {
        try {
            console.log('Loading master test questions from all levels');
            const allQuestions = [];
            
            for (let level = 1; level <= 3; level++) {
                const response = await fetch(`data/questions-level${level}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                allQuestions.push(...data.questions);
            }
            
            this.masterTestQuestions = this.shuffleArray(allQuestions).slice(0, 20);
            console.log(`Loaded ${this.masterTestQuestions.length} master test questions`);
            return true;
        } catch (error) {
            console.error('Failed to load master test questions:', error);
            return false;
        }
    }

    startMasterTest() {
        this.isMasterTest = true;
        this.questions = [...this.masterTestQuestions];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.gameResults = [];
        this.isAnswering = false;
        this.totalQuestions = 20;
        this.displayMasterTestQuestion();
    }

    displayMasterTestQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.completeMasterTest();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const questionWordElement = document.getElementById('master-question-word');
        const currentQuestionElement = document.getElementById('master-current');
        const progressFill = document.getElementById('master-progress-fill');
        const hintDisplay = document.getElementById('master-hint-display');
        const optionsContainer = document.getElementById('master-options-container');

        questionWordElement.textContent = question.display;
        currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        
        const progressPercent = ((this.currentQuestionIndex + 1) / 30) * 100;
        progressFill.style.width = `${progressPercent}%`;

        hintDisplay.classList.add('hidden');

        this.displayMasterTestOptions(question);
        this.isAnswering = true;
    }

    displayMasterTestOptions(question) {
        const optionsContainer = document.getElementById('master-options-container');
        optionsContainer.innerHTML = '';

        const shuffledOptions = this.shuffleArray(question.options);

        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.addEventListener('click', () => this.selectMasterTestAnswer(option, question.correctAnswer));
            optionsContainer.appendChild(button);
        });
    }

    selectMasterTestAnswer(selectedAnswer, correctAnswer) {
        if (!this.isAnswering) return;
        
        this.isAnswering = false;
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedAnswer === correctAnswer;
        
        const optionButtons = document.querySelectorAll('#master-options-container .option-button');
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
            this.showCorrectEffect();
        } else {
            this.playSound('incorrect');
            this.showIncorrectEffect();
            this.failMasterTest();
            return;
        }

        this.gameResults.push({
            question: question,
            selectedAnswer: selectedAnswer,
            isCorrect: isCorrect
        });

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.displayMasterTestQuestion();
        }, 2500);
    }

    failMasterTest() {
        const question = this.questions[this.currentQuestionIndex];
        this.createFloatingText('マスターテスト しっぱい...', '#F44336', '😢');
        
        setTimeout(() => {
            this.createFloatingText('さいしょから やりなおし！', '#FF9800', '💪');
            setTimeout(() => {
                this.startMasterTest();
            }, 2000);
        }, 2000);
    }

    completeMasterTest() {
        console.log('Master test completed successfully!');
        gameStorage.incrementMasterTestCount();
        this.createMasterTestCelebration();
        
        setTimeout(() => {
            this.switchScreen('master-complete-screen');
            this.createCrownRain();
        }, 1000);
    }

    createMasterTestCelebration() {
        // 画面全体に超派手なエフェクト
        this.createFloatingText('マスター 達成！！', '#FFD700', '🏆');
        
        // 連続花火エフェクト
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createFirework();
            }, i * 300);
        }
        
        // 虹色紙吹雪
        this.createRainbowConfetti();
        
        // 王冠シャワー
        setTimeout(() => {
            this.createCrownShower();
        }, 500);
    }

    createFirework() {
        const colors = ['#FF1493', '#00BFFF', '#FFD700', '#FF6347', '#98FB98', '#DDA0DD'];
        const firework = document.createElement('div');
        firework.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * window.innerWidth}px;
            top: ${Math.random() * window.innerHeight * 0.6}px;
        `;
        
        // 花火の爆発エフェクト
        for (let i = 0; i < 20; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                animation: fireworkSpark 1.5s ease-out forwards;
                transform-origin: center;
                transform: rotate(${i * 18}deg);
            `;
            firework.appendChild(spark);
        }
        
        document.body.appendChild(firework);
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 1500);
    }

    createRainbowConfetti() {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 12px;
                    height: 12px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    pointer-events: none;
                    z-index: 999;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -20px;
                    animation: rainbowFall 4s linear forwards;
                `;
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 4000);
            }, i * 100);
        }
    }

    createCrownShower() {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const crown = document.createElement('div');
                crown.style.cssText = `
                    position: fixed;
                    font-size: 2rem;
                    pointer-events: none;
                    z-index: 998;
                    left: ${Math.random() * window.innerWidth}px;
                    top: -50px;
                    animation: crownShower 3s ease-out forwards;
                `;
                crown.textContent = '👑';
                document.body.appendChild(crown);
                
                setTimeout(() => {
                    if (crown.parentNode) {
                        crown.parentNode.removeChild(crown);
                    }
                }, 3000);
            }, i * 200);
        }
    }

    createCrownRain() {
        const crownRain = document.querySelector('.crown-rain');
        if (!crownRain) return;
        
        for (let i = 0; i < 25; i++) {
            setTimeout(() => {
                const crown = document.createElement('div');
                crown.style.cssText = `
                    position: absolute;
                    font-size: 1.5rem;
                    left: ${Math.random() * 100}%;
                    top: -10%;
                    animation: crownDrop 5s linear infinite;
                    animation-delay: ${Math.random() * 2}s;
                `;
                crown.textContent = '👑';
                crownRain.appendChild(crown);
            }, i * 150);
        }
    }

    showMasterTestHint() {
        const question = this.questions[this.currentQuestionIndex];
        const hintDisplay = document.getElementById('master-hint-display');
        const hintText = document.getElementById('master-hint-text');
        
        hintText.textContent = question.hint;
        hintDisplay.classList.remove('hidden');
    }

    playMasterTestAudio() {
        const question = this.questions[this.currentQuestionIndex];
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(question.word);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
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
        
        this.updateCrownDisplay();
    }

    updateCrownDisplay() {
        const gameData = gameStorage.loadGameData();
        const crownDisplay = document.getElementById('crown-display');
        const masterTestCount = gameData.masterTestCount || 0;
        
        crownDisplay.innerHTML = '';
        
        for (let i = 0; i < masterTestCount; i++) {
            const crown = document.createElement('span');
            crown.className = 'crown-item';
            crown.textContent = '👑';
            crown.style.setProperty('--delay', `${i * 0.2}s`);
            crownDisplay.appendChild(crown);
        }
    }

    retry() {
        this.switchScreen('game-screen');
        this.startGame();
    }
}

const kanaGame = new KanaGame();