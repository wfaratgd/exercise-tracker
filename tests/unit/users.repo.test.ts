import { describe, it, expect, beforeEach } from '@jest/globals';
import { createTestDb } from '../setup/test-db.js';
import { createUsersRepo } from '@/modules/users/users.repo.js';

describe('users.repo (SQLite in-memory)', () => {
    let repo: ReturnType<typeof createUsersRepo>;

    beforeEach(async () => {
        const db = await createTestDb();
        repo = createUsersRepo(db);
    });

    it('creates and fetches a user', async () => {
        const user = await repo.createUser({
            username: 'Alice',
        });

        expect(user._id).toBe(1);
        expect(user.username).toBe('Alice');

        const fetched = await repo.getUserById(user._id);
        expect(fetched?.username).toBe('Alice');
    });

    it('returns all users', async () => {
        await repo.createUser({ username: 'A'});
        await repo.createUser({ username: 'B' });

        const users = await repo.getAllUsers();

        expect(users).toHaveLength(2);
        expect(users[0]?.username).toBe('A');
        expect(users[1]?.username).toBe('B');
    });

    it('enforces unique username constraint', async () => {
        await repo.createUser({ username: 'A' });

        await expect(
            repo.createUser({ username: 'A' })
        ).rejects.toThrow();
    });
});