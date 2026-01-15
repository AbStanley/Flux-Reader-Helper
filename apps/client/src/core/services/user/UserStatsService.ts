export interface UserStats {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    totalXp: number;
    streakDays: number;
    gamesPlayed: number;
}

export const INITIAL_STATS: UserStats = {
    level: 1,
    currentXp: 0,
    nextLevelXp: 1000,
    totalXp: 0,
    streakDays: 0,
    gamesPlayed: 0
};

export class UserStatsService {
    /**
     * Calculate XP required for the next level.
     * Formula: Base (1000) * Level
     */
    calculateNextLevelXp(level: number): number {
        return level * 1000;
    }

    /**
     * Add XP and calculate new level/stats
     */
    addXp(stats: UserStats, xpEarned: number): { newStats: UserStats; leveledUp: boolean } {
        let { level, currentXp, totalXp, nextLevelXp } = stats;

        currentXp += xpEarned;
        totalXp += xpEarned;
        let leveledUp = false;

        // Handle multiple level ups
        while (currentXp >= nextLevelXp) {
            currentXp -= nextLevelXp;
            level++;
            nextLevelXp = this.calculateNextLevelXp(level);
            leveledUp = true;
        }

        return {
            newStats: {
                ...stats,
                level,
                currentXp,
                nextLevelXp,
                totalXp
            },
            leveledUp
        };
    }
}

export const userStatsService = new UserStatsService();
