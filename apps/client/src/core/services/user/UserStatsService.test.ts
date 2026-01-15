import { describe, it, expect, beforeEach } from 'vitest';
import { UserStatsService, INITIAL_STATS } from './UserStatsService';

describe('UserStatsService', () => {
    let service: UserStatsService;

    beforeEach(() => {
        service = new UserStatsService();
    });

    it('should calculate next level XP correctly', () => {
        expect(service.calculateNextLevelXp(1)).toBe(1000);
        expect(service.calculateNextLevelXp(2)).toBe(2000);
    });

    it('should add XP and stay on same level', () => {
        const { newStats, leveledUp } = service.addXp(INITIAL_STATS, 500);

        expect(newStats.level).toBe(1);
        expect(newStats.currentXp).toBe(500);
        expect(newStats.totalXp).toBe(500);
        expect(leveledUp).toBe(false);
    });

    it('should level up when XP threshold is met', () => {
        const { newStats, leveledUp } = service.addXp(INITIAL_STATS, 1000);

        expect(newStats.level).toBe(2);
        expect(newStats.currentXp).toBe(0);
        expect(newStats.totalXp).toBe(1000);
        // Level 2 requires 2000 XP
        expect(newStats.nextLevelXp).toBe(2000);
        expect(leveledUp).toBe(true);
    });

    it('should handle multi-level jumps', () => {
        // Lvl 1 -> 1000. Lvl 2 -> 2000. Total 3000 to reach Level 3.
        // If we add 3500 XP to initial.
        const { newStats, leveledUp } = service.addXp(INITIAL_STATS, 3500);

        // 3500 - 1000 (Lvl1 cap) = 2500 (XP into Lvl 2)
        // 2500 - 2000 (Lvl2 cap) = 500 (XP into Lvl 3)
        // Should be Level 3 with 500 XP.

        expect(newStats.level).toBe(3);
        expect(newStats.currentXp).toBe(500);
        expect(leveledUp).toBe(true);
    });
});
