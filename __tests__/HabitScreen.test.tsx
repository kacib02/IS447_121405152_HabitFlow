import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HabitsScreen from '../src/screens/HabitsScreen';

jest.mock('../src/utils/habits', () => ({
  initHabitTable: jest.fn().mockResolvedValue(undefined),
  getHabitsForActiveUser: jest.fn().mockResolvedValue([
    { id: 1, user_id: 1, category_id: 1, title: 'Drink Water', description: 'Stay hydrated', habit_type: 'count', unit: 'glasses', is_archived: 0, created_at: '2024-01-01', category_name: 'Health' },
    { id: 2, user_id: 1, category_id: 2, title: 'Morning Run', description: 'Run daily', habit_type: 'count', unit: 'minutes', is_archived: 0, created_at: '2024-01-01', category_name: 'Fitness' },
    { id: 3, user_id: 1, category_id: 3, title: 'Meditate', description: 'Daily meditation', habit_type: 'boolean', unit: 'completed', is_archived: 0, created_at: '2024-01-01', category_name: 'Mindfulness' },
  ]),
  createHabit: jest.fn().mockResolvedValue(undefined),
  updateHabit: jest.fn().mockResolvedValue(undefined),
  deleteHabit: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/utils/categories', () => ({
  initCategoryTable: jest.fn().mockResolvedValue(undefined),
  getCategoriesForActiveUser: jest.fn().mockResolvedValue([
    { id: 1, user_id: 1, name: 'Health', color: '#16a34a', created_at: '2024-01-01' },
    { id: 2, user_id: 1, name: 'Fitness', color: '#2563eb', created_at: '2024-01-01' },
    { id: 3, user_id: 1, name: 'Mindfulness', color: '#7c3aed', created_at: '2024-01-01' },
  ]),
}));

function getTexts(instance) {
  return instance.UNSAFE_queryAllByType('text').map((t) => {
    const c = t.props.children;
    if (Array.isArray(c)) return c.join('');
    return String(c ?? '');
  });
}

function getButtonTexts(instance) {
  return instance.UNSAFE_queryAllByType('button').map((b) => {
    try {
      return b.findAllByType('text').map((t) => {
        const c = t.props.children;
        if (Array.isArray(c)) return c.join('');
        return String(c ?? '');
      }).join('');
    } catch { return ''; }
  });
}

describe('HabitsScreen integration', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the screen title', async () => {
    const instance = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getTexts(instance).some((t) => t.includes('Habits'))).toBe(true);
    });
  });

  it('displays seeded habits after DB initialisation', async () => {
    const instance = render(<HabitsScreen />);
    await waitFor(() => {
      const texts = getTexts(instance);
      expect(texts.some((t) => t.includes('Drink Water'))).toBe(true);
      expect(texts.some((t) => t.includes('Morning Run'))).toBe(true);
      expect(texts.some((t) => t.includes('Meditate'))).toBe(true);
    });
  });

  it('shows the correct tracking type for each habit', async () => {
    const instance = render(<HabitsScreen />);
    await waitFor(() => {
      const texts = getTexts(instance);
      expect(texts.some((t) => t.includes('Yes / No'))).toBe(true);
      expect(texts.some((t) => t.includes('Number'))).toBe(true);
    });
  });

  it('shows an empty state when there are no habits', async () => {
    const { getHabitsForActiveUser } = require('../src/utils/habits');
    getHabitsForActiveUser.mockResolvedValueOnce([]);
    const instance = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getTexts(instance).some((t) => t.includes('No habits yet.'))).toBe(true);
    });
  });

  it('shows Edit and Delete buttons for each habit', async () => {
    const instance = render(<HabitsScreen />);
    await waitFor(() => {
      const btns = getButtonTexts(instance);
      expect(btns.filter((t) => t.trim() === 'Edit').length).toBe(3);
      expect(btns.filter((t) => t.trim() === 'Delete').length).toBe(3);
    });
  });
});