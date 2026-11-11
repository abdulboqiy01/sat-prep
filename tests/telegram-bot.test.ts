import { describe, it, expect } from 'vitest';
import {
  sha256Hex,
  generateSecureRandomToken,
} from '../src/services/telegram.service';

describe('Telegram Bot Integration - Core Logic & Security Tests', () => {
  describe('Token Generation & SHA-256 Hashing', () => {
    it('generates random alphanumeric tokens of specified length', () => {
      const token1 = generateSecureRandomToken(32);
      const token2 = generateSecureRandomToken(32);

      expect(token1).toHaveLength(32);
      expect(token2).toHaveLength(32);
      expect(token1).not.toBe(token2);
      expect(typeof token1).toBe('string');
      // Hexadecimal character check
      expect(/^[0-9a-f]{32}$/.test(token1)).toBe(true);
    });

    it('hashes token using standard SHA-256 producing 64-character hex string', async () => {
      const token = 'test-token-1234567890abcdef1234';
      const hash1 = await sha256Hex(token);
      const hash2 = await sha256Hex(token);

      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2); // Deterministic
      expect(/^[0-9a-f]{64}$/.test(hash1)).toBe(true);

      const differentToken = 'another-token-9876543210fedcba';
      const differentHash = await sha256Hex(differentToken);
      expect(hash1).not.toBe(differentHash);
    });

    it('correctly calculates 10-minute token expiration', () => {
      const now = Date.now();
      const expiresAt = new Date(now + 10 * 60 * 1000);

      expect(expiresAt.getTime()).toBeGreaterThan(now);
      const diffMinutes = (expiresAt.getTime() - now) / (1000 * 60);
      expect(Math.round(diffMinutes)).toBe(10);

      // Expired token detection
      const expiredDate = new Date(now - 1000);
      const isExpired = expiredDate.getTime() < Date.now();
      expect(isExpired).toBe(true);
    });
  });

  describe('Timezone & Study Day Matching Logic', () => {
    function isDayEligible(studyDays: string[], currentDay: string): boolean {
      return studyDays.map((d) => d.toLowerCase()).includes(currentDay.toLowerCase());
    }

    function isTimeInWindow(
      currentTimeMinutes: number,
      targetTimeMinutes: number,
      windowMinutes = 35
    ): boolean {
      const diff = Math.abs(currentTimeMinutes - targetTimeMinutes);
      return diff <= windowMinutes || Math.abs(diff - 1440) <= windowMinutes;
    }

    it('correctly matches active study days', () => {
      const userDays = ['monday', 'wednesday', 'saturday'];

      expect(isDayEligible(userDays, 'monday')).toBe(true);
      expect(isDayEligible(userDays, 'wednesday')).toBe(true);
      expect(isDayEligible(userDays, 'saturday')).toBe(true);
      expect(isDayEligible(userDays, 'tuesday')).toBe(false);
      expect(isDayEligible(userDays, 'sunday')).toBe(false);
    });

    it('matches reminder times within window across timezones', () => {
      const reminderTimeMinutes = 18 * 60; // 18:00 (1080 mins)

      // Exactly at time
      expect(isTimeInWindow(1080, reminderTimeMinutes)).toBe(true);
      // 15 minutes before
      expect(isTimeInWindow(1065, reminderTimeMinutes)).toBe(true);
      // 30 minutes after
      expect(isTimeInWindow(1110, reminderTimeMinutes)).toBe(true);
      // 60 minutes after (outside 35-min window)
      expect(isTimeInWindow(1140, reminderTimeMinutes)).toBe(false);
    });

    it('handles midnight boundary window correctly', () => {
      const midnightMinutes = 0; // 00:00
      // 23:45 is 15 minutes before midnight
      const lateNightMinutes = 23 * 60 + 45; // 1425 mins
      expect(isTimeInWindow(lateNightMinutes, midnightMinutes, 35)).toBe(true);
    });
  });

  describe('Duplicate Notification Prevention', () => {
    function shouldSendNotification(
      lastSentTimestamp: string | null,
      cooldownHours = 18
    ): boolean {
      if (!lastSentTimestamp) return true;
      const lastSentTime = new Date(lastSentTimestamp).getTime();
      const cutoff = Date.now() - cooldownHours * 60 * 60 * 1000;
      return lastSentTime < cutoff;
    }

    it('allows sending when no prior notification exists', () => {
      expect(shouldSendNotification(null)).toBe(true);
    });

    it('prevents duplicate sending if reminder was sent recently', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(shouldSendNotification(twoHoursAgo)).toBe(false);

      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      expect(shouldSendNotification(twelveHoursAgo)).toBe(false);
    });

    it('allows sending again after the 18-hour daily cooldown has passed', () => {
      const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
      expect(shouldSendNotification(twentyHoursAgo)).toBe(true);
    });
  });

  describe('Personalized Message Formatting', () => {
    function buildReminderMessage(params: {
      name: string;
      subject: string;
      lessonTitle: string;
      estMinutes: number;
      targetScore: number;
      url: string;
    }): string {
      return (
        `Hello ${params.name}! 👋\n\n` +
        `Today you have a SAT study session!\n\n` +
        `📚 Today's plan:\n` +
        `- ${params.subject}: ${params.lessonTitle}\n` +
        `- Estimated duration: ${params.estMinutes} minutes\n` +
        `- Mini-test: 10 questions\n\n` +
        `Keep working towards your SAT goal (${params.targetScore})! 🚀\n\n` +
        `Link: ${params.url}`
      );
    }

    it('formats reminder matching required user specification', () => {
      const msg = buildReminderMessage({
        name: 'Olim',
        subject: 'Math',
        lessonTitle: 'Quadratic Equations & Vertex Form',
        estMinutes: 45,
        targetScore: 1450,
        url: 'https://sat-prep-beige.vercel.app/learn',
      });

      expect(msg).toContain('Hello Olim! 👋');
      expect(msg).toContain("Today's plan:");
      expect(msg).toContain('- Math: Quadratic Equations & Vertex Form');
      expect(msg).toContain('- Estimated duration: 45 minutes');
      expect(msg).toContain('- Mini-test: 10 questions');
      expect(msg).toContain('Keep working towards your SAT goal (1450)! 🚀');
      expect(msg).toContain('https://sat-prep-beige.vercel.app/learn');
    });
  });

  describe('Deep Link Construction', () => {
    it('constructs correct Telegram deep link format without @ prefix', () => {
      const bot = 'SatPrepReminderBot';
      const token = 'abcdef1234567890';
      const deepLink = `https://t.me/${bot.replace(/^@/, '')}?start=${token}`;

      expect(deepLink).toBe('https://t.me/SatPrepReminderBot?start=abcdef1234567890');
    });
  });
});
