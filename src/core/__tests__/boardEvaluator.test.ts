import { describe, expect, it } from 'vitest';
import { evaluateBoard } from '../boardEvaluator';
import { BUILT_IN_PARTICIPANTS } from '../constants';
import type { Participant } from '../types';
import { validateParticipants } from '../validator';

describe('Board Evaluator and Validator Full Flow', () => {
  describe('Acceptance Criterion 1: Built-in Records Oracle', () => {
    it('loads and evaluates the built-in records in one action with exact totals and counts', () => {
      const result = evaluateBoard(BUILT_IN_PARTICIPANTS);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summaryCounts).toEqual({
        total: 5,
        eligible: 2,
        ineligible: 3,
      });

      // Check ordered results: Eligible first (C01, C02), then Ineligible (C03, C04, C05)
      expect(result.evaluations.map((e) => e.participantId)).toEqual([
        'C01',
        'C02',
        'C03',
        'C04',
        'C05',
      ]);

      // Check totals: 7, 6, 7, 7, 4
      const pointsById = Object.fromEntries(
        result.evaluations.map((e) => [e.participantId, e.totalPoints])
      );
      expect(pointsById).toEqual({
        C01: 7,
        C02: 6,
        C03: 7,
        C04: 7,
        C05: 4,
      });

      // Check eligibility flags
      const eligibilityById = Object.fromEntries(
        result.evaluations.map((e) => [e.participantId, e.isEligible])
      );
      expect(eligibilityById).toEqual({
        C01: true,
        C02: true,
        C03: false,
        C04: false,
        C05: false,
      });
    });
  });

  describe('Acceptance Criterion 2: Failure Reason Specificity', () => {
    it('shows exact failure reasons for C03, C04, and C05', () => {
      const result = evaluateBoard(BUILT_IN_PARTICIPANTS);
      const reasonsById = Object.fromEntries(
        result.evaluations.map((e) => [e.participantId, e.failureReasons])
      );

      expect(reasonsById['C03']).toEqual(['MISSING_CATEGORY: SHARE']);
      expect(reasonsById['C04']).toEqual(['MISSING_CATEGORY: LEARN']);
      expect(reasonsById['C05']).toEqual([
        'MISSING_CATEGORY: BUILD',
        'POINTS_BELOW_6',
      ]);
    });
  });

  describe('Acceptance Criterion 3: Modifying C05 with A04', () => {
    it('evaluates C05 with A04 to 6 points, all categories, and updates counts to 3 eligible, 2 ineligible', () => {
      const modified: Participant[] = BUILT_IN_PARTICIPANTS.map((p) =>
        p.id === 'C05' ? { ...p, activityIds: ['A01', 'A03', 'A04'] } : p
      );

      const result = evaluateBoard(modified);
      expect(result.isValid).toBe(true);
      expect(result.summaryCounts).toEqual({
        total: 5,
        eligible: 3,
        ineligible: 2,
      });

      // Eligible first: C01, C02, C05, then C03, C04
      expect(result.evaluations.map((e) => e.participantId)).toEqual([
        'C01',
        'C02',
        'C05',
        'C03',
        'C04',
      ]);
    });
  });

  describe('Acceptance Criterion 4: Clearing C01 Completed Activities', () => {
    it('gives 0 points and all 4 failure reasons for empty activities, with 1 eligible and 4 ineligible', () => {
      const modified: Participant[] = BUILT_IN_PARTICIPANTS.map((p) =>
        p.id === 'C01' ? { ...p, activityIds: [] } : p
      );

      const result = evaluateBoard(modified);
      expect(result.isValid).toBe(true);
      expect(result.summaryCounts).toEqual({
        total: 5,
        eligible: 1,
        ineligible: 4,
      });

      // C02 is the only eligible participant and must appear first
      expect(result.evaluations[0].participantId).toBe('C02');

      const c01Eval = result.evaluations.find((e) => e.participantId === 'C01')!;
      expect(c01Eval.totalPoints).toBe(0);
      expect(c01Eval.coveredCategories).toEqual([]);
      expect(c01Eval.failureReasons).toEqual([
        'MISSING_CATEGORY: LEARN',
        'MISSING_CATEGORY: BUILD',
        'MISSING_CATEGORY: SHARE',
        'POINTS_BELOW_6',
      ]);
    });
  });

  describe('Acceptance Criterion 5: Duplicate Participation Reporting', () => {
    it('reports DUPLICATE_PARTICIPATION naming C01 and A01 and clears stale result rows and counts', () => {
      const modified: Participant[] = BUILT_IN_PARTICIPANTS.map((p) =>
        p.id === 'C01'
          ? { ...p, activityIds: ['A01', 'A02', 'A03', 'A01'] }
          : p
      );

      const result = evaluateBoard(modified);
      expect(result.isValid).toBe(false);
      expect(result.evaluations).toHaveLength(0);
      expect(result.summaryCounts).toEqual({ total: 0, eligible: 0, ineligible: 0 });

      const dupError = result.errors.find(
        (e) => e.errorType === 'DUPLICATE_PARTICIPATION'
      );
      expect(dupError).toBeDefined();
      expect(dupError?.participantId).toBe('C01');
      expect(dupError?.activityId).toBe('A01');
      expect(dupError?.formattedMessage).toContain(
        '[DUPLICATE_PARTICIPATION] Participant: C01 | Activity: A01'
      );
    });

    it('catches duplicate participation across case and zero variations (e.g. A01 and a1)', () => {
      const modified: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'a1'] },
      ];
      const errors = validateParticipants(modified);
      expect(errors.some((e) => e.errorType === 'DUPLICATE_PARTICIPATION')).toBe(true);
    });
  });

  describe('Validation Rules & Decisions', () => {
    it('reports INVALID_PARTICIPANT with "{participant_id} has no valid name" when name is blank (Decision 4)', () => {
      const participants: Participant[] = [
        { id: 'C01', name: '   ', activityIds: ['A01'] },
      ];
      const errors = validateParticipants(participants);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('INVALID_PARTICIPANT');
      expect(errors[0].description).toBe('C01 has no valid name');
      expect(errors[0].formattedMessage).toBe(
        '[INVALID_PARTICIPANT] Participant: C01 | Activity: N/A | C01 has no valid name'
      );
    });

    it('detects DUPLICATE_PARTICIPANT_ID when IDs match exactly after trimming whitespace', () => {
      const participants: Participant[] = [
        { id: 'C05', name: 'Alice', activityIds: ['A01'] },
        { id: '  C05  ', name: 'Bob', activityIds: ['A02'] },
      ];
      const errors = validateParticipants(participants);
      const dupErrors = errors.filter((e) => e.errorType === 'DUPLICATE_PARTICIPANT_ID');
      expect(dupErrors.length).toBeGreaterThan(0);
    });

    it('continues validation across the entire table without early termination (Decision 2)', () => {
      const participants: Participant[] = [
        { id: 'C01', name: '', activityIds: ['A99'] }, // blank name + unknown activity
        { id: 'C02', name: 'Bilal', activityIds: ['A01', 'A01'] }, // duplicate activity
      ];
      const errors = validateParticipants(participants);
      // Multiple errors must be present from both participants
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });

    it('orders multiple errors for the same participant alphabetically by error type (Decision 3)', () => {
      // DUPLICATE_PARTICIPATION and UNKNOWN_ACTIVITY on same participant
      const participants: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A01', 'A99'] },
      ];
      const errors = validateParticipants(participants);

      // "DUPLICATE_PARTICIPATION" comes alphabetically before "UNKNOWN_ACTIVITY"
      expect(errors[0].errorType).toBe('DUPLICATE_PARTICIPATION');
      expect(errors[1].errorType).toBe('UNKNOWN_ACTIVITY');
    });
  });
});
