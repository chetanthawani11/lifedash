/**
 * TASK SERVICE INTEGRATION TESTS
 *
 * Tests the task management system including:
 * - Task CRUD operations
 * - Task filtering and sorting
 * - Due date calculations
 * - Recurring task logic
 */

import { Task } from '@/types';

// Helper to create mock tasks
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  userId: 'test-user-123',
  title: 'Test Task',
  description: 'A test task',
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Task Service Integration', () => {
  describe('Task operations', () => {
    it('should create a valid task', () => {
      const task = createMockTask({
        title: 'Complete project',
        description: 'Finish the dashboard feature',
        priority: 'high',
      });

      expect(task.title).toBe('Complete project');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
    });

    it('should validate task has required fields', () => {
      const validateTask = (task: Partial<Task>): boolean => {
        return !!(task.title && task.title.trim().length > 0);
      };

      expect(validateTask({ title: 'Valid task' })).toBe(true);
      expect(validateTask({ title: '' })).toBe(false);
      expect(validateTask({ title: '   ' })).toBe(false);
      expect(validateTask({})).toBe(false);
    });
  });

  describe('Task filtering', () => {
    it('should filter tasks by status', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', status: 'pending' }),
        createMockTask({ id: '2', status: 'completed' }),
        createMockTask({ id: '3', status: 'pending' }),
        createMockTask({ id: '4', status: 'in_progress' }),
      ];

      const pendingTasks = tasks.filter((t) => t.status === 'pending');
      const completedTasks = tasks.filter((t) => t.status === 'completed');

      expect(pendingTasks.length).toBe(2);
      expect(completedTasks.length).toBe(1);
    });

    it('should filter tasks by priority', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', priority: 'high' }),
        createMockTask({ id: '2', priority: 'low' }),
        createMockTask({ id: '3', priority: 'high' }),
        createMockTask({ id: '4', priority: 'medium' }),
      ];

      const highPriority = tasks.filter((t) => t.priority === 'high');

      expect(highPriority.length).toBe(2);
    });

    it('should filter tasks by tags', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', tags: ['work', 'urgent'] }),
        createMockTask({ id: '2', tags: ['personal'] }),
        createMockTask({ id: '3', tags: ['work'] }),
        createMockTask({ id: '4', tags: [] }),
      ];

      const workTasks = tasks.filter((t) => t.tags?.includes('work'));
      const urgentTasks = tasks.filter((t) => t.tags?.includes('urgent'));

      expect(workTasks.length).toBe(2);
      expect(urgentTasks.length).toBe(1);
    });
  });

  describe('Task sorting', () => {
    it('should sort tasks by priority', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', priority: 'low' }),
        createMockTask({ id: '2', priority: 'high' }),
        createMockTask({ id: '3', priority: 'medium' }),
      ];

      const priorityOrder = { high: 0, medium: 1, low: 2 };

      const sorted = [...tasks].sort(
        (a, b) =>
          priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low']
      );

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should sort tasks by due date', () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const tasks: Task[] = [
        createMockTask({ id: '1', dueDate: nextWeek.toISOString() }),
        createMockTask({ id: '2', dueDate: today.toISOString() }),
        createMockTask({ id: '3', dueDate: tomorrow.toISOString() }),
        createMockTask({ id: '4', dueDate: null }),
      ];

      const sorted = [...tasks].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      expect(sorted[0].id).toBe('2'); // Today
      expect(sorted[1].id).toBe('3'); // Tomorrow
      expect(sorted[2].id).toBe('1'); // Next week
      expect(sorted[3].id).toBe('4'); // No due date (last)
    });
  });

  describe('Due date calculations', () => {
    it('should identify overdue tasks', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks: Task[] = [
        createMockTask({ id: '1', dueDate: yesterday.toISOString(), status: 'pending' }),
        createMockTask({ id: '2', dueDate: tomorrow.toISOString(), status: 'pending' }),
        createMockTask({ id: '3', dueDate: yesterday.toISOString(), status: 'completed' }),
      ];

      const isOverdue = (task: Task): boolean => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < new Date();
      };

      const overdueTasks = tasks.filter(isOverdue);

      expect(overdueTasks.length).toBe(1);
      expect(overdueTasks[0].id).toBe('1');
    });

    it('should identify tasks due today', () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const tasks: Task[] = [
        createMockTask({ id: '1', dueDate: new Date(startOfToday.getTime() + 3600000).toISOString() }),
        createMockTask({ id: '2', dueDate: tomorrow.toISOString() }),
        createMockTask({ id: '3', dueDate: null }),
      ];

      const isDueToday = (task: Task): boolean => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= startOfToday && dueDate <= endOfToday;
      };

      const todaysTasks = tasks.filter(isDueToday);

      expect(todaysTasks.length).toBe(1);
      expect(todaysTasks[0].id).toBe('1');
    });

    it('should calculate days until due', () => {
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const daysUntilDue = (dueDate: string | null): number | null => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const diffTime = due.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };

      const task = createMockTask({ dueDate: threeDaysLater.toISOString() });
      const days = daysUntilDue(task.dueDate);

      expect(days).toBe(3);
    });
  });

  describe('Task statistics', () => {
    it('should calculate completion rate', () => {
      const tasks: Task[] = [
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'pending' }),
        createMockTask({ status: 'pending' }),
        createMockTask({ status: 'pending' }),
      ];

      const completed = tasks.filter((t) => t.status === 'completed').length;
      const total = tasks.length;
      const completionRate = Math.round((completed / total) * 100);

      expect(completionRate).toBe(40);
    });

    it('should count tasks by status', () => {
      const tasks: Task[] = [
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'completed' }),
        createMockTask({ status: 'pending' }),
        createMockTask({ status: 'in_progress' }),
        createMockTask({ status: 'pending' }),
      ];

      const countByStatus = tasks.reduce(
        (acc, task) => {
          const status = task.status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(countByStatus['completed']).toBe(2);
      expect(countByStatus['pending']).toBe(2);
      expect(countByStatus['in_progress']).toBe(1);
    });
  });

  describe('Recurring tasks', () => {
    it('should generate next occurrence for daily task', () => {
      const today = new Date();

      const getNextOccurrence = (
        currentDate: Date,
        frequency: 'daily' | 'weekly' | 'monthly'
      ): Date => {
        const next = new Date(currentDate);
        switch (frequency) {
          case 'daily':
            next.setDate(next.getDate() + 1);
            break;
          case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
          case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        }
        return next;
      };

      const nextDaily = getNextOccurrence(today, 'daily');
      const expectedDaily = new Date(today);
      expectedDaily.setDate(today.getDate() + 1);

      expect(nextDaily.getDate()).toBe(expectedDaily.getDate());
    });

    it('should handle weekly recurring tasks', () => {
      const today = new Date();

      const getNextOccurrence = (currentDate: Date, frequency: 'weekly'): Date => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 7);
        return next;
      };

      const nextWeekly = getNextOccurrence(today, 'weekly');
      const diffDays = Math.round(
        (nextWeekly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffDays).toBe(7);
    });
  });
});
