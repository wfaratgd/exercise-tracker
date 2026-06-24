import type { Request, Response } from 'express';
import * as service from './users.service.js';

export async function getUsers(_req: Request, res: Response) {
    try {
        const users = await service.listUsers();

        if (!users) {
            return res.status(404).json({ error: "User data not found" });
        }

        return res.json(users);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
export async function createUserController(req: Request, res: Response) {
    try {
        const username = req.body?.username || req.body?.name;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const newUser = await service.addUser(username.trim());
        return res.status(201).json(newUser);

    } catch (err: any) {
        let clientMessage = err.message || 'An error occurred';

        if (clientMessage.includes('UNIQUE constraint failed')) {
            clientMessage = "Username already exists";
        }

        if (
            err.message?.includes('UNIQUE constraint') ||
            err.message?.toLowerCase().includes('already exists')
        ) {
            return res.status(400).json({ error: clientMessage });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function addExerciseController(req: Request, res: Response) {
    try {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        if (!description || !duration) {
            return res.status(400).json({ error: "Description and duration are required" });
        }
        if (duration <= 0) {
            return res.status(400).json({ error: "Duration must be a positive number" });
        }
        const exerciseRecord = await service.addExercise(
            Number(_id),
            description.trim(),
            Number(duration),
            date ? String(date) : undefined
        );

        return res.status(201).json(exerciseRecord);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}

export async function getUserLogsController(req: Request, res: Response) {
    try {
        const { _id } = req.params;
        const { from, to, limit } = req.query;

        const logs = await service.getUserLogs(
            Number(_id),
            from ? String(from) : undefined,
            to ? String(to) : undefined,
            limit ? Number(limit) : undefined
        );

        return res.json(logs);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
}