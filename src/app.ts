import express from 'express';
import cors from 'cors';
import path from 'path';
import usersRoutes from "./modules/users/users.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
app.get('/', (_, res) => {
    return res.sendFile(path.join(import.meta.dirname, '..', 'views', 'index.html'));
});

app.use('/api/users', usersRoutes);

export default app;