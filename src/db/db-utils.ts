import type { Database, RunResult } from "sqlite-async";

type SQLVerb = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

/**
 * A fluent, Drizzle-inspired query builder for sqlite-async.
 */
class QueryBuilder<T> {
    private _where: string[] = [];
    private _params: unknown[] = [];
    private _orderBy?: string;
    private _limit?: number;

    constructor(
        private db: Database,
        private verb: SQLVerb,
        private table: string,
        private columns: string = "*"
    ) {}

    /** Adds a WHERE clause with a parameter. */
    where(condition: string, value: unknown): this {
        this._where.push(condition);
        this._params.push(value);
        return this;
    }

    /** Adds an ORDER BY clause. Direction defaults to "ASC". */
    orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
        this._orderBy = `${column} ${direction}`;
        return this;
    }

    /** Adds a LIMIT clause. */
    limit(value: number): this {
        this._limit = value;
        return this;
    }

    /** Generates the final SQL string. */
    private buildSql(): string {
        let sql = "";

        if (this.verb === "SELECT") {
            sql = `SELECT ${this.columns} FROM ${this.table}`;
        } else if (this.verb === "DELETE") {
            sql = `DELETE FROM ${this.table}`;
        }

        if (this._where.length > 0) {
            sql += ` WHERE ${this._where.join(" AND ")}`;
        }

        if (this._orderBy) {
            sql += ` ORDER BY ${this._orderBy}`;
        }

        if (this._limit) {
            sql += ` LIMIT ${this._limit}`;
        }

        return sql;
    }

    /** Internal execution wrapper with your original error logging. */
    private async runSafe<R>(op: (sql: string, params: unknown[]) => Promise<R>): Promise<R> {
        const sql = this.buildSql();
        try {
            return await op(sql, this._params);
        } catch (error) {
            this.logDbError(error, sql, this._params);
            throw error;
        }
    }

    /** Executes a SELECT and returns all rows. */
    async all(): Promise<T[]> {
        return this.runSafe((sql, params) => this.db.all<T>(sql, params));
    }

    /** Executes a SELECT and returns the first row or null. */
    async get(): Promise<T | null> {
        return this.runSafe(async (sql, params) => {
            const row = await this.db.get<T>(sql, params);
            return row ?? null;
        });
    }

    /** Executes a SELECT and explicitly returns the first row or null.
     * Syntactic sugar mirroring standard modern ORM APIs.
     */
    async first(): Promise<T | null> {
        return this.get();
    }

    /** Executes a DELETE or UPDATE. */
    async execute(): Promise<RunResult> {
        return this.runSafe((sql, params) => this.db.run(sql, params));
    }

    private logDbError(error: unknown, sql: string, params: unknown[]) {
        const message = error instanceof Error ? error.message : "Unknown database error";
        console.error("❌ Database Error:", message);
        console.error("📜 Failed SQL:", sql);
        if (params.length > 0) console.error("📦 Params:", params);
    }
}

/**
 * Entry point for the DB utilities.
 */
export function createDbUtils(db: Database) {
    return {
        select: (columns = "*") => ({
            from: <T>(table: string) => new QueryBuilder<T>(db, "SELECT", table, columns),
        }),

        delete: () => ({
            from: (table: string) => new QueryBuilder<any>(db, "DELETE", table),
        }),

        insertInto: (table: string) => ({
            values: (record: Record<string, any>) => {
                const columns = Object.keys(record).join(", ");
                const placeholders = Object.keys(record).map(() => "?").join(", ");
                return db.run(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, Object.values(record));
            }
        }),

        raw: async (sql: string, params: unknown[] = []) => db.run(sql, params),
    };
}