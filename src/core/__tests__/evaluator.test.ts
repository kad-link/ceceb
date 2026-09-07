import { describe, expect, it } from 'vitest';
import { FIXED_ACTIVITIES } from '../constants';
import { evaluateParticipantActivities } from '../evaluator';

describe('evaluateParticipantActivities (Pure Logic Engine)', () => {
  describe('Built-in Records Oracle', () => {
    it('evaluates C01 (A01, A02, A03) -> 7 points, covers all categories, eligible', () => {
      const result = evaluateParticipantActivities(['A01', 'A02', 'A03']);
      expect(result.totalPoints).toBe(7);
      expect(result.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
      expect(result.isEligible).toBe(true);
      expect(result.failureReasons).toEqual([]);
    });

    it('evaluates C02 (A01, A03, A04) -> 6 points (exact boundary), covers all categories, eligible', () => {
      const result = evaluateParticipantActivities(['A01', 'A03', 'A04']);
      expect(result.totalPoints).toBe(6);
      expect(result.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
      expect(result.isEligible).toBe(true);
      expect(result.failureReasons).toEqual([]);
    });

    it('evaluates C03 (A01, A02, A04) -> 7 points, only MISSING_CATEGORY: SHARE', () => {
      const result = evaluateParticipantActivities(['A01', 'A02', 'A04']);
      expect(result.totalPoints).toBe(7);
      expect(result.coveredCategories).toEqual(['LEARN', 'BUILD']);
      expect(result.isEligible).toBe(false);
      expect(result.failureReasons).toEqual(['MISSING_CATEGORY: SHARE']);
    });

    it('evaluates C04 (A02, A03, A04) -> 7 points, only MISSING_CATEGORY: LEARN', () => {
      const result = evaluateParticipantActivities(['A02', 'A03', 'A04']);
      expect(result.totalPoints).toBe(7);
      expect(result.coveredCategories).toEqual(['BUILD', 'SHARE']);
      expect(result.isEligible).toBe(false);
      expect(result.failureReasons).toEqual(['MISSING_CATEGORY: LEARN']);
    });

    it('evaluates C05 (A01, A03) -> 4 points, MISSING_CATEGORY: BUILD and POINTS_BELOW_6', () => {
      const result = evaluateParticipantActivities(['A01', 'A03']);
      expect(result.totalPoints).toBe(4);
      expect(result.coveredCategories).toEqual(['LEARN', 'SHARE']);
      expect(result.isEligible).toBe(false);
      expect(result.failureReasons).toEqual(['MISSING_CATEGORY: BUILD', 'POINTS_BELOW_6']);
    });
  });

  describe('Edge Cases & Acceptance Criteria', () => {
    it('Acceptance test 3: Adding A04 to C05 (A01, A03, A04) makes participant eligible with 6 points', () => {
      const result = evaluateParticipantActivities(['A01', 'A03', 'A04']);
      expect(result.totalPoints).toBe(6);
      expect(result.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
      expect(result.isEligible).toBe(true);
      expect(result.failureReasons).toEqual([]);
    });

    it('Acceptance test 4: Empty activity list gives 0 points, no categories, and all 4 reasons in contracted order', () => {
      const result = evaluateParticipantActivities([]);
      expect(result.totalPoints).toBe(0);
      expect(result.coveredCategories).toEqual([]);
      expect(result.isEligible).toBe(false);
      expect(result.failureReasons).toEqual([
        'MISSING_CATEGORY: LEARN',
        'MISSING_CATEGORY: BUILD',
        'MISSING_CATEGORY: SHARE',
        'POINTS_BELOW_6',
      ]);
    });

    it('Normalizes activity IDs (case-insensitive and leading zeros: a1, A02, a03)', () => {
      const result = evaluateParticipantActivities(['a1', 'A02', 'a03']);
      expect(result.totalPoints).toBe(7);
      expect(result.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
      expect(result.isEligible).toBe(true);
      expect(result.failureReasons).toEqual([]);
    });

    it('Evaluates multiple activities from same category without falsely satisfying others (A02 + A04)', () => {
      const result = evaluateParticipantActivities(['A02', 'A04']); // BUILD(3) + BUILD(2) = 5
      expect(result.totalPoints).toBe(5);
      expect(result.coveredCategories).toEqual(['BUILD']);
      expect(result.isEligible).toBe(false);
      expect(result.failureReasons).toEqual([
        'MISSING_CATEGORY: LEARN',
        'MISSING_CATEGORY: SHARE',
        'POINTS_BELOW_6',
      ]);
    });

    it('never counts repeated activity points twice (contributes points at most once)', () => {
      // A01 is worth 2 points. Passing A01 multiple times must only yield 2 points, not 6
      const result = evaluateParticipantActivities(['A01', 'A01', 'a1']);
      expect(result.totalPoints).toBe(2);
      expect(result.coveredCategories).toEqual(['LEARN']);
      expect(result.isEligible).toBe(false);
    });
  });

  describe('Fixed Activity Table verification', () => {
    it('contains exactly 4 defined activities with expected categories and points', () => {
      expect(FIXED_ACTIVITIES).toHaveLength(4);
      expect(FIXED_ACTIVITIES).toEqual([
        { id: 'A01', canonicalId: 'A1', name: 'Emerging Tech Talk', category: 'LEARN', points: 2 },
        { id: 'A02', canonicalId: 'A2', name: 'Soldering Mini Lab', category: 'BUILD', points: 3 },
        { id: 'A03', canonicalId: 'A3', name: 'Project Pitch Circle', category: 'SHARE', points: 2 },
        { id: 'A04', canonicalId: 'A4', name: 'Open Source Clinic', category: 'BUILD', points: 2 },
      ]);
    });
  });
});
