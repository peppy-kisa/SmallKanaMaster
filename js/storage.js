class GameStorage {
    constructor() {
        this.storageKey = 'smallKanaMaster';
        this.defaultData = {
            totalCorrect: 0,
            currentRank: 'ビギナー',
            stamps: [],
            characterLevel: 1,
            lastPlayDate: null,
            rankBadge: '🌱'
        };
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                return { ...this.defaultData, ...data };
            }
        } catch (error) {
            console.error('Failed to load game data:', error);
        }
        return { ...this.defaultData };
    }

    saveGameData(data) {
        try {
            const dataToSave = { ...this.loadGameData(), ...data };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }

    updateTotalCorrect(correctCount) {
        const currentData = this.loadGameData();
        const newTotal = currentData.totalCorrect + correctCount;
        const newRankInfo = this.calculateRank(newTotal);
        
        const updatedData = {
            totalCorrect: newTotal,
            currentRank: newRankInfo.rank,
            rankBadge: newRankInfo.badge,
            characterLevel: this.calculateCharacterLevel(newTotal),
            lastPlayDate: new Date().toISOString().split('T')[0]
        };

        if (correctCount === 5) {
            updatedData.stamps = [...(currentData.stamps || []), {
                type: 'perfect',
                date: new Date().toISOString(),
                emoji: '⭐'
            }];
        }

        this.saveGameData(updatedData);
        
        return {
            ...updatedData,
            wasRankUp: newRankInfo.rank !== currentData.currentRank,
            previousRank: currentData.currentRank
        };
    }

    calculateRank(totalCorrect) {
        const ranks = [
            { min: 0, max: 10, rank: 'ビギナー', badge: '🌱' },
            { min: 11, max: 30, rank: 'ブロンズ', badge: '🥉' },
            { min: 31, max: 60, rank: 'シルバー', badge: '🥈' },
            { min: 61, max: 100, rank: 'ゴールド', badge: '🥇' },
            { min: 101, max: Infinity, rank: 'マスター', badge: '👑' }
        ];

        for (const rankInfo of ranks) {
            if (totalCorrect >= rankInfo.min && totalCorrect <= rankInfo.max) {
                return { rank: rankInfo.rank, badge: rankInfo.badge };
            }
        }
        
        return ranks[0];
    }

    calculateCharacterLevel(totalCorrect) {
        if (totalCorrect >= 100) return 5; // 🏆
        if (totalCorrect >= 60) return 4;  // 🐓
        if (totalCorrect >= 30) return 3;  // 🐔
        if (totalCorrect >= 10) return 2;  // 🐤
        return 1; // 🥚
    }

    getCharacterEmoji(level) {
        const characters = {
            1: '🥚',
            2: '🐤', 
            3: '🐔',
            4: '🐓',
            5: '🏆'
        };
        return characters[level] || characters[1];
    }

    getProgressToNextRank() {
        const currentData = this.loadGameData();
        const totalCorrect = currentData.totalCorrect;
        
        const thresholds = [11, 31, 61, 101];
        
        for (const threshold of thresholds) {
            if (totalCorrect < threshold) {
                return threshold - totalCorrect;
            }
        }
        
        return 0;
    }

    resetData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to reset data:', error);
            return false;
        }
    }
}

const gameStorage = new GameStorage();