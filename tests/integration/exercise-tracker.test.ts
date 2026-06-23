import request from 'supertest';
import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';
import type {Exercise, User, UserExerciseLog} from "@/modules/users/users.types.js";
import {initDatabase} from "@/db/init.js";

const mockAddUser = jest.fn<(username: string) => Promise<User>>();
const mockListUsers = jest.fn<() => Promise<User[] | null>>();
const mockAddExercise =
    jest.fn<(userId: number, description: string, duration: number, dateString?: string) => Promise<Exercise>>();
const mockGetUserLogs =
    jest.fn<(userId: number, from: string, to: string, limit: number) => Promise<UserExerciseLog>>();

jest.unstable_mockModule('../../src/modules/users/users.service.js', () => ({
    addUser: mockAddUser,
    listUsers: mockListUsers,
    addExercise: mockAddExercise,
    getUserLogs: mockGetUserLogs,
}));

const { app } = await import('../../src/app.js');

describe('Exercise Tracker API Requirements', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    beforeAll(async () => {
        await initDatabase();
    });
    describe('Global Formatting Rules', () => {
        it('should return responses and errors in JSON format with appropriate header types', async () => {
            mockListUsers.mockResolvedValue([]);

            const res = await request(app).get('/api/users');

            expect(res.headers['content-type']).toMatch(/json/);
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user using URL-encoded form data and return fields { id, username }', async () => {
            const mockUser = { _id: 123, username: 'charlie' };
            mockAddUser.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/users')
                .type('form') // Simulates HTML Form submission requirement
                .send({ username: 'charlie' });

            expect(res.status).toBe(201);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toEqual({
                _id: 123,
                username: 'charlie'
            });
            expect(mockAddUser).toHaveBeenCalledWith('charlie');
        });
    });

    describe('GET /api/users', () => {
        it('should get an array containing all users with their usernames and ids', async () => {
            const mockUsers = [
                { _id: 1, username: 'alice' },
                { _id: 2, username: 'bob' }
            ];
            mockListUsers.mockResolvedValue(mockUsers);

            const res = await request(app).get('/api/users');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toEqual({ _id: 1, username: 'alice' });
        });

        it('should return a 404 error formatted in JSON if no users exist', async () => {
            mockListUsers.mockResolvedValue(null);

            const res = await request(app).get('/api/users');

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    describe('POST /api/users/:_id/exercises', () => {
        it('should successfully save an exercise and fall back to current date if omitted', async () => {
            const mockExerciseResponse = {
                _id: 123,
                userId: 99,
                exerciseId: 456,
                description: 'Running',
                duration: 30,
                date: new Date()
            };
            mockAddExercise.mockResolvedValue(mockExerciseResponse);

            const res = await request(app)
                .post('/api/users/99/exercises')
                .type('form')
                .send({
                    description: 'Running',
                    duration: '30'
                });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({...mockExerciseResponse, date: mockExerciseResponse.date.toISOString()});
            expect(mockAddExercise).toHaveBeenCalledWith(99, 'Running', 30, undefined);
        });

        it('should return a 400 status error with explanation when required parameters are missing', async () => {
            const res = await request(app)
                .post('/api/users/99/exercises')
                .type('form')
                .send({
                    description: 'Missing Duration'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toContain('required');
        });
    });

    describe('GET /api/users/:_id/logs', () => {
        const mockLogPayload = {
            _id: 7,
            username: 'fit_user',
            count: 15,
            logs: [
                { _id: 101, description: 'Lifting', duration: 45, date: new Date('2026-06-01') },
                { _id: 102, description: 'Yoga', duration: 20, date: new Date('2026-06-05') }
            ]
        };

        it('should retrieve a full exercise log containing logs array and absolute matches count', async () => {
            mockGetUserLogs.mockResolvedValue(mockLogPayload);

            const res = await request(app).get('/api/users/7/logs');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({...mockLogPayload, logs: mockLogPayload.logs.map(log => ({...log, date: log.date.toISOString()}))});
            expect(res.body.count).toBe(15);
        });

        it('should correctly forward optional query params (from, to, limit) to the service layer', async () => {
            mockGetUserLogs.mockResolvedValue(mockLogPayload);

            const res = await request(app)
                .get('/api/users/7/logs')
                .query({ from: '2026-01-01', to: '2026-06-30', limit: 2 });

            expect(res.status).toBe(200);
            expect(mockGetUserLogs).toHaveBeenCalledWith(7, '2026-01-01', '2026-06-30', 2);
        });
    });
});