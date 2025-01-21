import { Request, Response } from 'express';
import Quiz from '../models/quizModels';
import StudentAnswer from '../models/studentModal';
import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const crypto = require('crypto');

export const combineKeyAndSalt = (key: string, salt: { key: string, salt: string }): string => {
    const combined = key + salt.salt;
    const hash = crypto.createHash('sha256');
    hash.update(combined);
    return hash.digest('hex');
}

// when student answer the question then along with the user_name and public_key save his answer along with qid

export const saveStudentAnswer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, private_key, user_name, qid, answer } = req.body;

        if (!user_name || !public_key || private_key || !qid || !(Array.isArray(answer) && answer.length > 0)) {
            return res.status(400).json({ error: "All fields must be present, and 'answer' must be a non-empty array" });
        }

        const savedQuiz = await Quiz.findById(new mongoose.Types.ObjectId(qid));
        if (!savedQuiz) {
            return res.status(400).json({ message: "Cannot find the Question" });
        }

        const numberOfOptions = savedQuiz?.options;
        if (!(Array.isArray(numberOfOptions) && numberOfOptions.length > 0)) {
            return res.status(400).json({ error: "Quiz options are not defined" });
        }

        const isValidAnswer = answer.every((ans: string) => {
            const ansIndex = parseInt(ans, 10);
            return !isNaN(ansIndex) && ansIndex >= 0 && ansIndex < numberOfOptions.length;
        });

        if (!isValidAnswer) {
            return res.status(400).json({
                error: `Answer contains invalid option(s). Valid options are between 0 and ${numberOfOptions.length - 1}.`
            });
        }

        const user_public_key = combineKeyAndSalt(user_name, public_key);
        let studentQueAns = await StudentAnswer.findOne({ user_public_key, qid });

        if (studentQueAns) {
            studentQueAns.answer = answer;
            await studentQueAns.save();
            return res.status(200).json({
                message: "Answer updated successfully", qid, answer
            });
        } else {
            studentQueAns = new StudentAnswer({ public_key, user_public_key, qid, answer });
            await studentQueAns.save();

            return res.status(200).json({
                message: "Successfully added the answer", qid, answer
            });
        }

    } catch (error) {
        console.error('Error saving student answer:', error);
        return res.status(500).json({ error: "An error occurred while saving the answer. Please try again" });
    }
};


export const uniqueStudentName = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, private_key, user_name } = req.body;

        if (!public_key || !user_name || !private_key) {
            return res.status(400).json({ message: "Public Key, Private Key, or User Name is not provided!" });
        }

        const checkUser = await StudentAnswer.findOne({ public_key, user_name });

        if (checkUser) {
            const privateKeyMatches = await bcrypt.compare(private_key, checkUser.private_key);
            if (!privateKeyMatches) {
                return res.status(400).json({
                    message: "This name is already present, so please choose a different name.",
                    valid: false,
                });
            }
        } else {
            return res.status(200).json({
                message: "The User Name is not present, so you can proceed with this name.",
                valid: true,
            });
        }

        return res.status(200).json({
            message: "User validated successfully. You can re-enter the test within the valid time.",
            valid: true,
        });
    } catch (error) {
        console.error('Error validating student name:', error);
        return res.status(500).json({
            error: "An error occurred while validating the user name. Please try again.",
        });
    }
};
