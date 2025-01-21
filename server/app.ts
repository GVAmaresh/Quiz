import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';
import studentRouter from "./routes/studentRoutes"
import validateRouter from "./routes/validateRoutes"
import TimeRouter from "./routes/timeRoutes"

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/quiz', quizRoutes);
app.use('/api/student', studentRouter);
app.use("/api/validate", validateRouter)
app.use("/api/time", TimeRouter)

app.use("/api/help", (req, res) => {
    res.json({"message": "Working Fine"}); 
});


export default app;
