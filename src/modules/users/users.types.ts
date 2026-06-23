export type User = {
    _id: number;
    username: string;
}

export type CreateUserInput = Pick<User, 'username'>;

export type Exercise = {
    _id: number;
    description: string;
    duration: number;
    date?: Date;
}

export type CreatedExerciseResponse = Omit<Exercise,'_id'> & { userId: number; exerciseId: number };

export type UserExerciseLog = User & {
    logs: Exercise[];
    count: number;
}