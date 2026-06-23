/// <reference types="node" />
declare module "sqlite-async" {
    import * as sqlite3 from "sqlite3";

    export interface RunResult {
        lastID: number;
        changes: number;
    }

    export type Params = any[] | Record<string, any>;

    export class Database {
        static readonly OPEN_READONLY: number;
        static readonly OPEN_READWRITE: number;
        static readonly OPEN_CREATE: number;
        static readonly SQLITE3_VERSION: string;

        filename?: string | null;
        db?: sqlite3.Database | null;

        static open(filename: string, mode?: number): Promise<Database>;

        open(filename: string, mode?: number): Promise<Database>;

        on(event: string, listener: (...args: any[]) => void): this;

        close(): Promise<Database>;
        close<T>(fn: (db: Database) => Promise<T>): Promise<T>;

        run(sql: string, params?: Params): Promise<RunResult>;
        run(sql: string, ...params: any[]): Promise<RunResult>;

        get<T = any>(sql: string, params?: Params): Promise<T | undefined>;
        get<T = any>(sql: string, ...params: any[]): Promise<T | undefined>;

        all<T = any>(sql: string, params?: Params): Promise<T[]>;
        all<T = any>(sql: string, ...params: any[]): Promise<T[]>;

        each<T = any>(
            sql: string,
            params: Params | undefined,
            callback: (row: T) => void
        ): Promise<number>;
        each<T = any>(
            sql: string,
            callback: (row: T) => void
        ): Promise<number>;

        exec(sql: string): Promise<this>;

        transaction<T>(fn: (db: Database) => Promise<T>): Promise<T>;

        prepare(sql: string, params?: Params): Promise<Statement>;
    }

    export class Statement {
        constructor(statement: sqlite3.Statement);

        bind(params?: Params): Promise<this>;
        bind(...params: any[]): Promise<this>;

        reset(): Promise<this>;

        finalize(): Promise<void>;

        run(params?: Params): Promise<RunResult>;
        run(...params: any[]): Promise<RunResult>;

        get<T = any>(params?: Params): Promise<T | undefined>;
        get<T = any>(...params: any[]): Promise<T | undefined>;

        all<T = any>(params?: Params): Promise<T[]>;
        all<T = any>(...params: any[]): Promise<T[]>;

        each<T = any>(
            params: Params | undefined,
            callback: (row: T) => void
        ): Promise<number>;
        each<T = any>(callback: (row: T) => void): Promise<number>;
    }
}