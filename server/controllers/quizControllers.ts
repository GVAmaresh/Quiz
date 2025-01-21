import { Request, Response, NextFunction } from 'express';
import Quiz, { decrypt, IQuiz } from "../models/quizModels";
import bcrypt from "bcrypt";
import mongoose from 'mongoose';


// Only Teacher can create and update the quiz

export const createQuiz = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, private_key, qid, question, options, correctAnswer } = req.body;

        if (!public_key || !private_key || !question || !options || !correctAnswer) {
            return res.status(400).json({ message: "All Fields are required" })
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: "Options must be an array with at least two items." })
        }
        if (!Array.isArray(correctAnswer) || correctAnswer.some((idx: number) => idx < 0 || idx >= options.length)) {
            return res.status(400).json({ message: "Correct answers must be valid indices within the options array." });
        }

        if (qid) {
            const savedQuiz = await Quiz.findById(qid)
            if (!savedQuiz) {
                return res.status(400).json({ message: "Question not found" })
            }
            savedQuiz.question = question
            savedQuiz.options = options
            savedQuiz.correctOption = correctAnswer
            savedQuiz.save()
            return res.status(200).json({ qid, message: "Quiz Updated Successfully" })
        }
        const quiz: IQuiz = new Quiz({
            public_key,
            private_key,
            question,
            options,
            correctOption: correctAnswer
        });
        const savedQuiz = await quiz.save()
        return res.status(201).json({ message: "Quiz created successfully.", qid: savedQuiz._id })
    } catch (error) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({ message: "Error saving the quiz." });
    }
};

interface IQuizRequestBody {
    public_key: string;
    private_key?: string;
    qid: string;
}


// If Teacher asks the Question(using qid, public id) then send quesition + option + answer 
// If Student asks the Question(using qid, public id) then send question + option

export const getQuestion = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, private_key, qid }: IQuizRequestBody = req.body
        if (!public_key || !qid) {
            return res.status(400).json({ message: "Public key or Question is not found" })
        }

        const savedQuiz = await Quiz.findOne({ _id: new mongoose.Types.ObjectId(qid) });
        if (!savedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (!(public_key == savedQuiz.public_key)) {
            return res.status(400).json({ "message": "Public key is wrong for this Question" })
        }

        if (private_key) {
            const privateKeyMatches = await bcrypt.compare(private_key, savedQuiz?.private_key);
            if (privateKeyMatches) {
                savedQuiz.correctOption = await Promise.all(
                    savedQuiz.correctOption.map((encryptedOption: string) => decrypt(encryptedOption))
                );
            } else {
                return res.status(401).json({ message: "Private key does not match" });
            }
        }
        return res.status(200).json({ message: "Sending Quiz Successfully", quiz: savedQuiz })
    } catch (error: any) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
}

// It is used to get All question id for student using public Id

export const getAllQId = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key } = req.body;
        if (!public_key) {
            return res.status(400).json({ message: "Public Key not Found!!" });
        }

        const qidList = await Quiz.find({ public_key }).select('_id');

        if (!qidList || qidList.length === 0) {
            return res.status(400).json({ message: "Public Key may not exist or it is wrong" });
        }

        const ids = qidList.map((quiz) => quiz._id);

        return res.status(200).json({ qids: ids, message: "List of Question Found Successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};


// Only Teacher can delete the Question using Private Key and Question ID

export const deleteQuestion = async (req: Request, res: Response): Promise<any> => {
    try {
        const { private_key, qid } = req.body;

        if (!!private_key || !qid) {
            return res.status(400).json({ message: "Public Key, Private Key, or Question ID is/are not found" });
        }
        const getQuiz = await Quiz.findById(new mongoose.Types.ObjectId(qid));
        if (!getQuiz) {
            return res.status(400).json({ message: "Quiz not found" });
        }
        const privateKeyMatches = await bcrypt.compare(private_key, getQuiz.private_key);
        if (!privateKeyMatches) {
            return res.status(401).json({ message: "Private Key is incorrect" });
        }
        const deletionResult = await getQuiz.deleteOne();
        if (deletionResult.deletedCount === 0) {
            return res.status(500).json({ message: "Failed to delete the quiz" });
        }

        return res.status(200).json({ message: "Quiz has been deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting quiz:", error); 
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

// It is used to check Unique Public Key

export const uniquePublicKey = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { public_key } = req.body;

        if (!public_key) {
            return res.status(400).json({ message: "Public Key is not provided!" });
        }

        const checkPublicKey = await Quiz.findOne({ public_key });
        if (checkPublicKey) {
            return res.status(400).json({
                message: "This Public Key is already present. Please choose another name.",
                valid: false,
            });
        }
        next();
    } catch (error) {
        console.error('Error checking public key:', error);
        return res.status(500).json({
            error: "An error occurred while validating the public key. Please try again.",
        });
    }
};
