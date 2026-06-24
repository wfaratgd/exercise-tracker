import { Database } from "sqlite-async";
import { createDbUtils } from "@/db/db-utils.js";
import type {User} from "@/modules/users/users.types.js"; // Adjust path as needed

export function createUsersRepo(db: Database) {
    const utils = createDbUtils(db);

    return {
        async createUser(data: { username: string }): Promise<User> {
            const result = await utils.insertInto("users").values(data);

            return {
                _id: result.lastID,
                username: data.username,
            };
        },

        async getAllUsers(): Promise<User[]> {
            return utils.select()
                .from<User>("users")
                .all();
        },

        async getUserById(id: number): Promise<User | null> {
            return utils.select()
                .from<User>("users")
                .where("id = ?", id)
                .get();
        },

        async createExercise(userId: number, data: { description: string; duration: number; date: string }): Promise<any> {
            return utils.insertInto("exercises").values({
                user_id: userId,
                description: data.description,
                duration: data.duration,
                date: data.date
            });
        },

        async getExercisesByUserId(
            userId: number,
            options?: {
                from: string | undefined;
                to: string | undefined;
                limit: number | undefined;
            }
        ): Promise<any[]> {
            let query = utils.select().from("exercises").where("user_id = ?", userId);

            if (options?.from) {
                query = query.where("date >= ?", options.from);
            }
            if (options?.to) {
                query = query.where("date <= ?", options.to);
            }

            query = query.orderBy("date", "ASC");

            if (options?.limit) {
                query = query.limit(options.limit);
            }


            return query.all();
        },

        async getExerciseCountByUserId(userId: number): Promise<number> {
            const result = await utils
                .select("COUNT(*) as count")
                .from<{ count: number }>("exercises")
                .where("user_id = ?", userId)
                .first();

            return result?.count || 0;
        }
    };
}