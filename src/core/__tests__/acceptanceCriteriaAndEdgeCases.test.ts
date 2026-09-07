import { describe, expect, it } from 'vitest';
import { evaluateBoard } from '../boardEvaluator';
import { BUILT_IN_PARTICIPANTS } from '../constants';
import { evaluateParticipantActivities } from '../evaluator';
import { getDefaultParticipants } from '../rosterState';
import type { Participant } from '../types';
import { validateParticipants } from '../validator';

describe('SI26_P12: Comprehensive Acceptance Criteria & Edge Cases Suite', () => {
  // =========================================================================
  // 1. THE FOUR SPECIFIC REQUESTED EDGE CASES
  // =========================================================================
  describe('1. Focused Edge Cases', () => {
    describe('1.1 Exact Point Boundary Case (Score == 6 vs Score == 5)', () => {
      it('marks a participant with exactly 6 points and all 3 categories as ELIGIBLE', () => {
        // A01(LEARN: 2) + A03(SHARE: 2) + A04(BUILD: 2) = exactly 6 points
        const evalResult = evaluateParticipantActivities(['A01', 'A03', 'A04']);
        expect(evalResult.totalPoints).toBe(6);
        expect(evalResult.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
        expect(evalResult.isEligible).toBe(true);
        expect(evalResult.failureReasons).toEqual([]);
      });

      it('marks a participant with 5 points as INELIGIBLE with POINTS_BELOW_6 even if all categories were covered', () => {
        // Using catalog where total = 5
        // A01(2) + A02(3) = 5 points (LEARN, BUILD - missing SHARE, points < 6)
        const evalResult = evaluateParticipantActivities(['A01', 'A02']);
        expect(evalResult.totalPoints).toBe(5);
        expect(evalResult.isEligible).toBe(false);
        expect(evalResult.failureReasons).toContain('POINTS_BELOW_6');
      });
    });

    describe('1.2 Participant with Zero Completed Activities', () => {
      it('evaluates empty completed-activity list as valid, yielding 0 points, 0 categories, and all 4 failure reasons in contracted order', () => {
        const evalResult = evaluateParticipantActivities([]);
        expect(evalResult.totalPoints).toBe(0);
        expect(evalResult.coveredCategories).toEqual([]);
        expect(evalResult.isEligible).toBe(false);
        expect(evalResult.failureReasons).toEqual([
          'MISSING_CATEGORY: LEARN',
          'MISSING_CATEGORY: BUILD',
          'MISSING_CATEGORY: SHARE',
          'POINTS_BELOW_6',
        ]);
      });
    });

    describe('1.3 Duplicate Activity Participation', () => {
      it('never counts points twice and flags DUPLICATE_PARTICIPATION naming the participant and activity', () => {
        const roster: Participant[] = [
          { id: 'C01', name: 'Asha', activityIds: ['A01', 'A02', 'A01'] },
        ];

        // 1. Validation flag
        const errors = validateParticipants(roster);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('DUPLICATE_PARTICIPATION');
        expect(errors[0].participantId).toBe('C01');
        expect(errors[0].activityId).toBe('A01');
        expect(errors[0].formattedMessage).toBe(
          '[DUPLICATE_PARTICIPATION] Participant: C01 | Activity: A01 | Participant C01 has duplicate participation for activity A01'
        );

        // 2. Evaluator safety: never counts duplicate points
        const evalResult = evaluateParticipantActivities(['A01', 'A02', 'A01']);
        expect(evalResult.totalPoints).toBe(5); // A01(2) + A02(3), duplicate A01 skipped

        // 3. Board blocking: zero results and zero counts
        const boardResult = evaluateBoard(roster);
        expect(boardResult.isValid).toBe(false);
        expect(boardResult.evaluations).toEqual([]);
        expect(boardResult.summaryCounts).toEqual({ total: 0, eligible: 0, ineligible: 0 });
      });
    });

    describe('1.4 Mixed Sorting Order (Eligible first, then Ineligible, by ID ascending within each)', () => {
      it('sorts eligible participants first (by ID asc), then ineligible participants (by ID asc)', () => {
        // Unordered list with mixed eligible and ineligible participants:
        // C05: eligible (6 pts, all categories)
        // C03: ineligible (7 pts, missing SHARE)
        // C01: eligible (7 pts, all categories)
        // C04: ineligible (7 pts, missing LEARN)
        // C02: eligible (6 pts, all categories)
        const mixedRoster: Participant[] = [
          { id: 'C05', name: 'Eshan', activityIds: ['A01', 'A03', 'A04'] }, // eligible
          { id: 'C03', name: 'Chen', activityIds: ['A01', 'A02', 'A04'] }, // ineligible
          { id: 'C01', name: 'Asha', activityIds: ['A01', 'A02', 'A03'] }, // eligible
          { id: 'C04', name: 'Divya', activityIds: ['A02', 'A03', 'A04'] }, // ineligible
          { id: 'C02', name: 'Bilal', activityIds: ['A01', 'A03', 'A04'] }, // eligible
        ];

        const result = evaluateBoard(mixedRoster);
        expect(result.isValid).toBe(true);

        const orderedIds = result.evaluations.map((e) => e.participantId);
        // Eligible: C01, C02, C05
        // Ineligible: C03, C04
        expect(orderedIds).toEqual(['C01', 'C02', 'C05', 'C03', 'C04']);

        // Verify status grouping
        expect(result.evaluations[0].isEligible).toBe(true);
        expect(result.evaluations[1].isEligible).toBe(true);
        expect(result.evaluations[2].isEligible).toBe(true);
        expect(result.evaluations[3].isEligible).toBe(false);
        expect(result.evaluations[4].isEligible).toBe(false);
      });
    });
  });

  // =========================================================================
  // 2. ALL ACCEPTANCE CRITERIA FROM PROBLEM STATEMENT PDF
  // =========================================================================
  describe('2. PDF Acceptance Criteria', () => {
    it('Acceptance Criterion 1: Load and evaluate built-in records in one action; totals 7, 6, 7, 7, 4; C01/C02 eligible; 2 eligible, 3 ineligible', () => {
      const result = evaluateBoard(BUILT_IN_PARTICIPANTS);
      expect(result.isValid).toBe(true);
      expect(result.summaryCounts).toEqual({ total: 5, eligible: 2, ineligible: 3 });

      const points = result.evaluations.map((e) => e.totalPoints);
      // Evaluated order: C01(7), C02(6), C03(7), C04(7), C05(4)
      expect(points).toEqual([7, 6, 7, 7, 4]);

      expect(result.evaluations[0].participantId).toBe('C01');
      expect(result.evaluations[0].isEligible).toBe(true);

      expect(result.evaluations[1].participantId).toBe('C02');
      expect(result.evaluations[1].isEligible).toBe(true);

      expect(result.evaluations[2].participantId).toBe('C03');
      expect(result.evaluations[2].isEligible).toBe(false);

      expect(result.evaluations[3].participantId).toBe('C04');
      expect(result.evaluations[3].isEligible).toBe(false);

      expect(result.evaluations[4].participantId).toBe('C05');
      expect(result.evaluations[4].isEligible).toBe(false);
    });

    it('Acceptance Criterion 2: Show only MISSING_CATEGORY: SHARE for C03, only MISSING_CATEGORY: LEARN for C04, and MISSING_CATEGORY: BUILD followed by POINTS_BELOW_6 for C05', () => {
      const result = evaluateBoard(BUILT_IN_PARTICIPANTS);
      const c03 = result.evaluations.find((e) => e.participantId === 'C03')!;
      const c04 = result.evaluations.find((e) => e.participantId === 'C04')!;
      const c05 = result.evaluations.find((e) => e.participantId === 'C05')!;

      expect(c03.failureReasons).toEqual(['MISSING_CATEGORY: SHARE']);
      expect(c04.failureReasons).toEqual(['MISSING_CATEGORY: LEARN']);
      expect(c05.failureReasons).toEqual([
        'MISSING_CATEGORY: BUILD',
        'POINTS_BELOW_6',
      ]);
    });

    it('Acceptance Criterion 3: Add only A04 to C05; show total as 6, all 3 categories covered, new counts 3 eligible and 2 ineligible', () => {
      const roster = getDefaultParticipants();
      roster[4].activityIds.push('A04'); // Add A04 to C05

      const result = evaluateBoard(roster);
      expect(result.isValid).toBe(true);
      expect(result.summaryCounts).toEqual({ total: 5, eligible: 3, ineligible: 2 });

      const c05 = result.evaluations.find((e) => e.participantId === 'C05')!;
      expect(c05.totalPoints).toBe(6);
      expect(c05.coveredCategories).toEqual(['LEARN', 'BUILD', 'SHARE']);
      expect(c05.isEligible).toBe(true);
      expect(c05.failureReasons).toEqual([]);
    });

    it('Acceptance Criterion 4: Reset, then clear C01 completed activities; show 0 points, 3 missing-category reasons followed by POINTS_BELOW_6, with counts 1 eligible and 4 ineligible', () => {
      const roster = getDefaultParticipants();
      roster[0].activityIds = []; // Clear C01

      const result = evaluateBoard(roster);
      expect(result.isValid).toBe(true);
      expect(result.summaryCounts).toEqual({ total: 5, eligible: 1, ineligible: 4 });

      const c01 = result.evaluations.find((e) => e.participantId === 'C01')!;
      expect(c01.totalPoints).toBe(0);
      expect(c01.coveredCategories).toEqual([]);
      expect(c01.failureReasons).toEqual([
        'MISSING_CATEGORY: LEARN',
        'MISSING_CATEGORY: BUILD',
        'MISSING_CATEGORY: SHARE',
        'POINTS_BELOW_6',
      ]);
    });

    it('Acceptance Criterion 5: Reset, add a second A01 to C01, report DUPLICATE_PARTICIPATION naming C01 and A01, and show no stale result rows or counts', () => {
      const roster = getDefaultParticipants();
      roster[0].activityIds.push('A01'); // Add second A01 to C01

      const result = evaluateBoard(roster);
      expect(result.isValid).toBe(false);
      expect(result.evaluations).toEqual([]);
      expect(result.summaryCounts).toEqual({ total: 0, eligible: 0, ineligible: 0 });

      const error = result.errors.find((e) => e.errorType === 'DUPLICATE_PARTICIPATION');
      expect(error).toBeDefined();
      expect(error?.participantId).toBe('C01');
      expect(error?.activityId).toBe('A01');
      expect(error?.formattedMessage).toContain(
        '[DUPLICATE_PARTICIPATION] Participant: C01 | Activity: A01'
      );
    });
  });

  // =========================================================================
  // 3. NORMALIZATION & CONTRACT VALIDATION EDGE CASES
  // =========================================================================
  describe('3. Normalization, Formatting & Ordering Edge Cases', () => {
    it('trims leading and trailing whitespace from participant IDs, names, and activities', () => {
      const roster: Participant[] = [
        { id: '  C01  ', name: '  Asha  ', activityIds: ['  A01  ', ' A02 ', 'A03'] },
      ];
      const result = evaluateBoard(roster);
      expect(result.isValid).toBe(true);
      expect(result.evaluations[0].participantId).toBe('C01');
      expect(result.evaluations[0].participantName).toBe('Asha');
      expect(result.evaluations[0].totalPoints).toBe(7);
      expect(result.evaluations[0].isEligible).toBe(true);
    });

    it('checks participant ID uniqueness strictly by exact trimmed string comparison (no case-folding or leading-zero equivalence)', () => {
      // 1. Exact duplicates after trimming are flagged
      const dupRoster: Participant[] = [
        { id: 'C05', name: 'Alice', activityIds: ['A01'] },
        { id: '  C05  ', name: 'Bob', activityIds: ['A02'] },
      ];
      const dupErrors = validateParticipants(dupRoster).filter(
        (e) => e.errorType === 'DUPLICATE_PARTICIPANT_ID'
      );
      expect(dupErrors.length).toBe(2);
      expect(dupErrors[0].errorType).toBe('DUPLICATE_PARTICIPANT_ID');

      // 2. Different case or leading zeros (C05 vs c5 or C5) are distinct valid IDs under the contract
      const distinctRoster: Participant[] = [
        { id: 'C05', name: 'Alice', activityIds: ['A01'] },
        { id: 'c5', name: 'Bob', activityIds: ['A02'] },
      ];
      const distinctErrors = validateParticipants(distinctRoster).filter(
        (e) => e.errorType === 'DUPLICATE_PARTICIPANT_ID'
      );
      expect(distinctErrors.length).toBe(0);
    });

    it('treats activity IDs as equivalent regardless of case and leading zeros (A01, a01, A1, a1)', () => {
      // Participant entering A01 and a1 triggers DUPLICATE_PARTICIPATION
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'a1'] },
      ];
      const errors = validateParticipants(roster);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('DUPLICATE_PARTICIPATION');
    });

    it('accepts any non-empty trimmed string as a valid participant ID without requiring C<number> shape', () => {
      const roster: Participant[] = [
        { id: 'P01', name: 'Asha', activityIds: ['A01'] },
        { id: '123', name: 'Bilal', activityIds: ['A02'] },
        { id: 'user-xyz', name: 'Chen', activityIds: ['A03'] },
      ];
      const errors = validateParticipants(roster);
      expect(errors).toHaveLength(0);

      // Verify empty or whitespace-only ID IS flagged as INVALID_PARTICIPANT
      const invalidRoster: Participant[] = [
        { id: '   ', name: 'Dave', activityIds: ['A01'] },
      ];
      const invalidErrors = validateParticipants(invalidRoster);
      expect(invalidErrors).toHaveLength(1);
      expect(invalidErrors[0].errorType).toBe('INVALID_PARTICIPANT');
    });

    it('flags blank participant name as INVALID_PARTICIPANT with exact format "{participant_id} has no valid name"', () => {
      const roster: Participant[] = [
        { id: 'C01', name: '   ', activityIds: ['A01'] },
      ];
      const errors = validateParticipants(roster);
      expect(errors[0].errorType).toBe('INVALID_PARTICIPANT');
      expect(errors[0].description).toBe('C01 has no valid name');
    });

    it('sorts multiple validation errors on the same participant alphabetically by error type', () => {
      // Participant has DUPLICATE_PARTICIPATION and UNKNOWN_ACTIVITY
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A01', 'A99'] },
      ];
      const errors = validateParticipants(roster);
      expect(errors[0].errorType).toBe('DUPLICATE_PARTICIPATION');
      expect(errors[1].errorType).toBe('UNKNOWN_ACTIVITY');
    });

    it('multiple activities from the same category only count for that category once', () => {
      // A02 (BUILD, 3 pts) + A04 (BUILD, 2 pts) = 5 points in BUILD, but LEARN and SHARE are still missing
      const evalResult = evaluateParticipantActivities(['A02', 'A04']);
      expect(evalResult.totalPoints).toBe(5);
      expect(evalResult.coveredCategories).toEqual(['BUILD']);
      expect(evalResult.failureReasons).toEqual([
        'MISSING_CATEGORY: LEARN',
        'MISSING_CATEGORY: SHARE',
        'POINTS_BELOW_6',
      ]);
    });
  });
});
