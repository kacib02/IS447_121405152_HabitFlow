import { seedDatabase } from '../src/db/seed';

jest.mock('expo-sqlite', () => {
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getAllAsync: jest.fn(),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    __mockDb: mockDb,
  };
});

const getMockDb = () => require('expo-sqlite').__mockDb;

describe('seedDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips seeding if categories already exist', async () => {
    getMockDb().getAllAsync.mockResolvedValueOnce([{ id: 1 }]);
    await seedDatabase();
    expect(getMockDb().runAsync).not.toHaveBeenCalled();
  });

  it('inserts a demo user when no categories exist', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    const firstCall = getMockDb().runAsync.mock.calls[0];
    expect(firstCall[0]).toContain('INSERT OR IGNORE INTO users');
    expect(firstCall[1]).toContain('demo@habitflow.com');
  });

  it('inserts all 4 categories', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    const categoryInserts = getMockDb().runAsync.mock.calls.filter(
      (call) => call[0].includes('INSERT INTO categories')
    );
    expect(categoryInserts.length).toBe(4);
    const names = categoryInserts.map((call) => call[1][1]);
    expect(names).toContain('Health');
    expect(names).toContain('Fitness');
    expect(names).toContain('Mindfulness');
    expect(names).toContain('Learning');
  });

  it('inserts all 5 habits', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    const habitInserts = getMockDb().runAsync.mock.calls.filter(
      (call) => call[0].includes('INSERT INTO habits')
    );
    expect(habitInserts.length).toBe(5);
  });

  it('inserts habit logs', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    const logInserts = getMockDb().runAsync.mock.calls.filter(
      (call) => call[0].includes('INSERT INTO habit_logs')
    );
    expect(logInserts.length).toBeGreaterThan(0);
  });

  it('inserts 5 targets', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    const targetInserts = getMockDb().runAsync.mock.calls.filter(
      (call) => call[0].includes('INSERT INTO targets')
    );
    expect(targetInserts.length).toBe(5);
  });

  it('does not insert duplicate data when called twice', async () => {
    getMockDb().getAllAsync
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Health' }, { id: 2, name: 'Fitness' },
        { id: 3, name: 'Mindfulness' }, { id: 4, name: 'Learning' },
      ])
      .mockResolvedValueOnce([
        { id: 1, title: 'Drink Water', category_id: 1 },
        { id: 2, title: 'Morning Run', category_id: 2 },
        { id: 3, title: 'Meditate', category_id: 3 },
        { id: 4, title: 'Read', category_id: 4 },
        { id: 5, title: 'Gym Session', category_id: 2 },
      ]);
    await seedDatabase();
    jest.clearAllMocks();
    getMockDb().getAllAsync.mockResolvedValueOnce([{ id: 1 }]);
    await seedDatabase();
    expect(getMockDb().runAsync).not.toHaveBeenCalled();
  });
});
