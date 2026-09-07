import type { Activity, Category, Participant } from './types';

export const REQUIRED_CATEGORIES: Category[] = ['LEARN', 'BUILD', 'SHARE'];

export const MIN_POINTS_FOR_ELIGIBILITY = 6;

export const FIXED_ACTIVITIES: readonly Activity[] = [
  {
    id: 'A01',
    canonicalId: 'A1',
    name: 'Emerging Tech Talk',
    category: 'LEARN',
    points: 2,
  },
  {
    id: 'A02',
    canonicalId: 'A2',
    name: 'Soldering Mini Lab',
    category: 'BUILD',
    points: 3,
  },
  {
    id: 'A03',
    canonicalId: 'A3',
    name: 'Project Pitch Circle',
    category: 'SHARE',
    points: 2,
  },
  {
    id: 'A04',
    canonicalId: 'A4',
    name: 'Open Source Clinic',
    category: 'BUILD',
    points: 2,
  },
];

export const BUILT_IN_PARTICIPANTS: readonly Participant[] = [
  { id: 'C01', name: 'Asha', activityIds: ['A01', 'A02', 'A03'] },
  { id: 'C02', name: 'Bilal', activityIds: ['A01', 'A03', 'A04'] },
  { id: 'C03', name: 'Chen', activityIds: ['A01', 'A02', 'A04'] },
  { id: 'C04', name: 'Divya', activityIds: ['A02', 'A03', 'A04'] },
  { id: 'C05', name: 'Eshan', activityIds: ['A01', 'A03'] },
];
