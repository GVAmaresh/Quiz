import { NextFunction, Request, Response } from 'express';
import Quiz, { IQuiz } from '../models/quizModels';
import StudentAnswer from '../models/studentModal';
import mongoose from 'mongoose';
import { combineKeyAndSalt } from './studentController';

// Get the all student who are writing under that public key or under that question id

export const getAllStudent = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, qid } = req.body
        if (!public_key && !qid) {
            return res.status(400).json({ message: "Provide Either Public Key or Question ID" })
        }

        if (public_key) {
            const savedAnswer = StudentAnswer.find({ public_key }).select('_id');

            if (!(Array.isArray(savedAnswer) && savedAnswer.length >= 1)) {
                return res.status(400).json({ message: "Public Key maybe Wrong or Not Existed" })
            }

            const studentIds = savedAnswer.map(ans => ans._id)
            return res.status(200).json({ studentId: studentIds, message: "List of Students Found Successfully" })
        }
        else if (qid) {
            const savedAnswer = StudentAnswer.findById(new mongoose.Types.ObjectId(qid)).select('_id');

            if (!(Array.isArray(savedAnswer) && savedAnswer.length >= 1)) {
                return res.status(400).json({ message: "Question Id maybe Wrong or Not Existed" })
            }

            const studentIds = savedAnswer.map(ans => ans._id)
            return res.status(200).json({ studentId: studentIds, message: "List of Students Found Successfully" })
        }
    } catch (error) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({ message: "Error saving the quiz." });
    }
}

// Validate the marks of the Student with Student Id and Public Id and Private Id (of the teacher)

export const validateAnswer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { user_name, public_key } = req.body;

        if (!public_key || !user_name) {
            return res.status(400).json({
                message: "Public Key or User Name is/are not provided.",
            });
        }

        const user_public_key = combineKeyAndSalt(public_key, user_name);
        const studentAnswers = await StudentAnswer.find({ user_public_key });

        if (!studentAnswers.length) {
            return res.status(404).json({
                message: "No answers found for the given user.",
            });
        }

        const savedQuizzes = await Quiz.find({ public_key });

        if (!savedQuizzes.length) {
            return res.status(404).json({
                message: "No quizzes found for the given public key.",
            });
        }

        const quizMap = savedQuizzes.reduce((map, quiz) => {
            map[quiz._id as string] = quiz;
            return map;
        }, {} as Record<string, any>);

        const result = studentAnswers.map((answer) => {
            const quiz = quizMap[answer.qid];

            if (!quiz) {
                return {
                    qid: answer.qid,
                    marks: 0,
                    correctAnswer: null,
                };
            }

            const correctAnswers = quiz.correctOption.sort().join(",");
            const studentAnswers = answer.answer.sort().join(",");

            const marks = correctAnswers === studentAnswers ? 1 : 0;

            return {
                qid: answer.qid,
                marks,
                correctAnswer: quiz.correctOption,
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error validating answers:", error);
        return res.status(500).json({
            message: "An error occurred while validating answers.",
        });
    }
};