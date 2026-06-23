import { Router } from 'express';
import {
    getUsers,
    createUserController,
    addExerciseController,
    getUserLogsController
} from './users.controller.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUserController);

router.post('/:_id/exercises', addExerciseController);
router.get('/:_id/logs', getUserLogsController);

export default router;