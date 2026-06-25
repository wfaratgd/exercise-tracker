import type { User } from "./users.types.js";
import {createUsersRepo} from "@/modules/users/users.repo.js";
import { instance } from "@/db/db.js";
const repo = createUsersRepo(instance);
export async function listUsers(): Promise<User[]> {
    return repo.getAllUsers();
}

export async function addUser(username: string): Promise<User> {
    return repo.createUser({ username });
}

export async function addExercise(
    userId: number,
    description: string,
    duration: number,
    dateString?: string
) {
    const user = await repo.getUserById(userId);
    if (!user) throw new Error("User not found");

    const date = dateString ? new Date(dateString) : new Date();
    await repo.createExercise(userId, {
        description,
        duration,
        date: date.toISOString().split('T')[0]!
    });
    return {
        _id: user._id,
        username: user.username,
        description,
        duration,
        date: date.toDateString()
    };
}

export async function getUserLogs(
        userId: number,
        from?: string,
        to?: string,
        limit?: number
    ): Promise<any> {
        const user = await repo.getUserById(userId);
        if (!user) throw new Error("User not found");

        const [dbExercises, totalCount] = await Promise.all([
            repo.getExercisesByUserId(userId, { from, to, limit }),
            repo.getExerciseCountByUserId(userId, {from, to})
        ]);

        const logs = dbExercises.map(ex => ({
            description: ex.description,
            duration: ex.duration,
            date: new Date(ex.date).toDateString()
        }));

        return {
            _id: user._id,
            username: user.username,
            count: totalCount,
            log: logs
        };
}