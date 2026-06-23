import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { Database } from 'sqlite-async';
import { createDbUtils } from '@/db/db-utils.js';

describe('createDbUtils Fluent Builder', () => {
    const mockDb = {
        run: jest.fn(),
        get: jest.fn(),
        all: jest.fn(),
    } as unknown as jest.Mocked<Database>;

    const utils = createDbUtils(mockDb);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('select().from()', () => {
        it('builds a simple select and calls db.all', async () => {
            const mockRows = [{ id: 1, username: 'Alice' }];
            mockDb.all.mockResolvedValueOnce(mockRows);

            const result = await utils.select().from('users').all();

            expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM users', []);
            expect(result).toEqual(mockRows);
        });
    });

    describe('Error Handling & Logging', () => {
        it('logs and rethrows errors during execution', async () => {
            const error = new Error('Table not found');
            mockDb.all.mockRejectedValueOnce(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await expect(utils.select().from('ghost_table').all())
                .rejects.toThrow('Table not found');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('❌ Database Error:'),
                error.message
            );

            consoleSpy.mockRestore();
        });
    });
});