import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

/**
 * Mock the service layer
 * → we are testing routing + HTTP behavior only
 */
const mockListUsers = jest.fn();
const mockAddUser = jest.fn();

jest.unstable_mockModule('../../src/modules/users/users.service.js', () => ({
    listUsers: mockListUsers,
    addUser: mockAddUser,
}));

const { app } = await import('../../src/app.js');

describe('Users routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET /users returns user list', async () => {
        const users = [{ _id: 1, username: 'John' }];
        mockListUsers.mockReturnValue(users);

        const res = await request(app).get('/api/users');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(users);
    });

    it('POST /users creates a user', async () => {
        const newUser = { id: 2, username: 'Jane', email: 'jane@test.com' };
        mockAddUser.mockReturnValue(newUser);

        const res = await request(app)
            .post('/api/users')
            .send({ username: 'Jane', email: 'jane@test.com' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(newUser);
    });

    it('POST /users returns 400 on service error', async () => {
        mockAddUser.mockImplementation(() => {
            throw new Error('Email already exists');
        });

        const res = await request(app)
            .post('/api/users')
            .send({ username: 'Jane', email: 'dup@test.com' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Email already exists');
    });
});
