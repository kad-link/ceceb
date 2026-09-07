import { describe, expect, it } from 'vitest';
import { evaluateBoard } from '../boardEvaluator';
import { BUILT_IN_PARTICIPANTS } from '../constants';
import {
  addParticipantToRoster,
  addTokenToParticipant,
  getDefaultParticipants,
  removeParticipantFromRoster,
  removeTokenFromParticipant,
  setParticipantTokens,
  updateParticipantInRoster,
} from '../rosterState';
import type { Participant } from '../types';
import { validateParticipants } from '../validator';

describe('Step 2: Participant Roster State & Validation Layer', () => {
  describe('Roster State Operations', () => {
    it('initializes with a deep copy of built-in participants', () => {
      const roster = getDefaultParticipants();
      expect(roster).toHaveLength(5);
      expect(roster[0].id).toBe('C01');
      // Mutating copy does not mutate BUILT_IN_PARTICIPANTS
      roster[0].activityIds.push('A04');
      expect(BUILT_IN_PARTICIPANTS[0].activityIds).toHaveLength(3);
    });

    it('adds a new participant with auto-incremented ID', () => {
      const roster = getDefaultParticipants();
      const updated = addParticipantToRoster(roster, { name: 'Farhan' });
      expect(updated).toHaveLength(6);
      expect(updated[5].id).toBe('C06');
      expect(updated[5].name).toBe('Farhan');
      expect(updated[5].activityIds).toEqual([]);
    });

    it('updates a participant name and ID', () => {
      const roster = getDefaultParticipants();
      const updated = updateParticipantInRoster(roster, 0, { name: 'Asha Sharma' });
      expect(updated[0].name).toBe('Asha Sharma');
      expect(updated[0].id).toBe('C01');
    });

    it('removes a participant by index', () => {
      const roster = getDefaultParticipants();
      const updated = removeParticipantFromRoster(roster, 1); // remove Bilal
      expect(updated).toHaveLength(4);
      expect(updated.map((p) => p.id)).toEqual(['C01', 'C03', 'C04', 'C05']);
    });

    it('adds and removes activity tokens for a participant', () => {
      let roster = getDefaultParticipants();
      // Add A04 to C05 (index 4)
      roster = addTokenToParticipant(roster, 4, 'A04');
      expect(roster[4].activityIds).toEqual(['A01', 'A03', 'A04']);

      // Remove token at index 1 ('A03')
      roster = removeTokenFromParticipant(roster, 4, 1);
      expect(roster[4].activityIds).toEqual(['A01', 'A04']);
    });

    it('replaces all activity tokens for a participant', () => {
      let roster = getDefaultParticipants();
      roster = setParticipantTokens(roster, 0, ['A02', 'A04']);
      expect(roster[0].activityIds).toEqual(['A02', 'A04']);
    });
  });

  describe('Validation Layer: Rule Checks', () => {
    it('flags empty participant ID as INVALID_PARTICIPANT', () => {
      const roster: Participant[] = [{ id: '   ', name: 'Asha', activityIds: ['A01'] }];
      const errors = validateParticipants(roster);
      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('INVALID_PARTICIPANT');
    });

    it('flags invalid participant ID format (e.g. non C<number>) as INVALID_PARTICIPANT', () => {
      const roster: Participant[] = [{ id: 'X99', name: 'Asha', activityIds: ['A01'] }];
      const errors = validateParticipants(roster);
      expect(errors[0].errorType).toBe('INVALID_PARTICIPANT');
      expect(errors[0].description).toContain('must follow C<number> format');
    });

    it('flags empty participant name as INVALID_PARTICIPANT with exact format', () => {
      const roster: Participant[] = [{ id: 'C01', name: '   ', activityIds: ['A01'] }];
      const errors = validateParticipants(roster);
      expect(errors[0].errorType).toBe('INVALID_PARTICIPANT');
      expect(errors[0].description).toBe('C01 has no valid name');
    });

    it('flags duplicate participant IDs across the table', () => {
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01'] },
        { id: 'c01', name: 'Another Asha', activityIds: ['A02'] },
      ];
      const errors = validateParticipants(roster);
      const dupErrors = errors.filter((e) => e.errorType === 'DUPLICATE_PARTICIPANT_ID');
      expect(dupErrors.length).toBe(2);
    });

    it('flags unknown activity IDs not in the fixed catalog as UNKNOWN_ACTIVITY', () => {
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A99', 'B02'] },
      ];
      const errors = validateParticipants(roster);
      const unknownErrors = errors.filter((e) => e.errorType === 'UNKNOWN_ACTIVITY');
      expect(unknownErrors).toHaveLength(2);
      expect(unknownErrors[0].activityId).toBe('A99');
      expect(unknownErrors[1].activityId).toBe('B02');
    });

    it('flags duplicate activities for the same participant as DUPLICATE_PARTICIPATION', () => {
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A02', 'A01'] },
      ];
      const errors = validateParticipants(roster);
      const dupErrors = errors.filter((e) => e.errorType === 'DUPLICATE_PARTICIPATION');
      expect(dupErrors).toHaveLength(1);
      expect(dupErrors[0].participantId).toBe('C01');
      expect(dupErrors[0].activityId).toBe('A01');
    });

    it('produces exact structured messages for all four bad input scenarios', () => {
      // 1. Empty participant ID
      const emptyIdErrors = validateParticipants([{ id: '', name: 'Asha', activityIds: ['A01'] }]);
      expect(emptyIdErrors[0].formattedMessage).toBe(
        '[INVALID_PARTICIPANT] Participant: Row 1 | Activity: N/A | Participant ID is missing or empty'
      );

      // 2. Two participants sharing the same ID
      const dupIdErrors = validateParticipants([
        { id: 'C01', name: 'Asha', activityIds: ['A01'] },
        { id: 'C01', name: 'Bilal', activityIds: ['A02'] },
      ]);
      expect(dupIdErrors[0].formattedMessage).toBe(
        '[DUPLICATE_PARTICIPANT_ID] Participant: C01 | Activity: N/A | Participant ID "C01" is used by multiple participants'
      );

      // 3. Activity ID that does not exist in catalog
      const unknownActErrors = validateParticipants([
        { id: 'C01', name: 'Asha', activityIds: ['A99'] },
      ]);
      expect(unknownActErrors[0].formattedMessage).toBe(
        '[UNKNOWN_ACTIVITY] Participant: C01 | Activity: A99 | Activity "A99" does not exist in the fixed activity catalog'
      );

      // 4. Participant with same activity listed twice
      const dupActErrors = validateParticipants([
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A01'] },
      ]);
      expect(dupActErrors[0].formattedMessage).toBe(
        '[DUPLICATE_PARTICIPATION] Participant: C01 | Activity: A01 | Participant C01 has duplicate participation for activity A01'
      );
    });
  });

  describe('Validation Layer: Collect All Errors & Block Partial Evaluation', () => {
    it('collects all errors across all participants without stopping early', () => {
      const roster: Participant[] = [
        { id: 'C01', name: '', activityIds: ['A01'] }, // 1. blank name
        { id: 'C02', name: 'Bilal', activityIds: ['A01', 'A01'] }, // 2. duplicate participation
        { id: 'C03', name: 'Chen', activityIds: ['A99'] }, // 3. unknown activity
        { id: 'C02', name: 'Duplicate Bilal', activityIds: ['A02'] }, // 4. duplicate participant ID
      ];

      const errors = validateParticipants(roster);
      // All 4 distinct error types must be collected across the table
      const types = new Set(errors.map((e) => e.errorType));
      expect(types.has('INVALID_PARTICIPANT')).toBe(true);
      expect(types.has('DUPLICATE_PARTICIPATION')).toBe(true);
      expect(types.has('UNKNOWN_ACTIVITY')).toBe(true);
      expect(types.has('DUPLICATE_PARTICIPANT_ID')).toBe(true);
    });

    it('blocks the entire evaluation if even a single row has an error — NO partial results', () => {
      // 4 perfectly valid participants + 1 broken participant
      const roster: Participant[] = [
        { id: 'C01', name: 'Asha', activityIds: ['A01', 'A02', 'A03'] }, // valid eligible
        { id: 'C02', name: 'Bilal', activityIds: ['A01', 'A03', 'A04'] }, // valid eligible
        { id: 'C03', name: 'Chen', activityIds: ['A01', 'A02', 'A04'] }, // valid ineligible
        { id: 'C04', name: 'Divya', activityIds: ['A02', 'A03', 'A04'] }, // valid ineligible
        { id: 'C05', name: '', activityIds: ['A01'] }, // BROKEN: blank name
      ];

      const result = evaluateBoard(roster);

      // Must NOT be valid
      expect(result.isValid).toBe(false);
      // Must contain the error
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].errorType).toBe('INVALID_PARTICIPANT');

      // CRITICAL: Evaluations must be EMPTY — no partial results for C01-C04
      expect(result.evaluations).toEqual([]);

      // CRITICAL: Summary counts must be zeroed out
      expect(result.summaryCounts).toEqual({
        total: 0,
        eligible: 0,
        ineligible: 0,
      });
    });

    it('blocks the entire evaluation if a valid participant introduces a duplicate activity', () => {
      // Built-in participants with C01 corrupted by duplicate A01
      const roster = getDefaultParticipants();
      roster[0].activityIds.push('A01');

      const result = evaluateBoard(roster);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorType).toBe('DUPLICATE_PARTICIPATION');
      expect(result.evaluations).toEqual([]);
      expect(result.summaryCounts).toEqual({ total: 0, eligible: 0, ineligible: 0 });
    });
  });
});
