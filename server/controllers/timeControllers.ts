import { Request, Response } from 'express';
import TimeModel from '../models/timeModel';
import bcrypt from "bcrypt";
import Quiz from '../models/quizModels';
import StudentAnswer from '../models/studentModal';

// To get the start time and end time to any-one having public key 

export const getTimeRange = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key } = req.body
        if (!public_key) {
            return res.status(400).json({ message: "Public Key is not provided" })
        }
        const getTimer = await TimeModel.findOne({ public_key })
        if (!getTimer) {
            return res.status(400).json({ message: "Public is not valid" })
        }
        return res.status(200).json({
            public_key: getTimer.public_key,
            start_time: getTimer.start_time,
            end_time: getTimer.end_time,
            expire_time: getTimer.expire_time
        })
    } catch (error) {
        console.error('Error saving student answer:', error);
        return res.status(500).json({ error: "An error occurred while saving the answer. Please try again" });
    }
}

// To create or update the start-end time only for teachers having private key and public key to be unique

export const setTimeRange = async (req: Request, res: Response): Promise<any> => {
    try {
        const { public_key, private_key, start_time, end_time } = req.body;

        if (!public_key || !private_key || !start_time || !end_time) {
            return res.status(400).json({ message: "Public Key, Private Key, Start Time, and End Time are required!" });
        }

        const conflictingTimers = await TimeModel.find({ public_key });

        if (conflictingTimers.length > 0) {
            for (const timer of conflictingTimers) {
                const privateKeyMatches = await bcrypt.compare(private_key, timer.private_key);
                if (!privateKeyMatches) {
                    return res.status(400).json({
                        message: "The public key already exists with a different private key.",
                    });
                }
            }

            const existingTimer = conflictingTimers[0];
            existingTimer.start_time = start_time;
            existingTimer.end_time = end_time;
            await existingTimer.save();

            return res.status(200).json({ message: "Start time and end time have been updated!" });
        } else {
            const hashedPrivateKey = await bcrypt.hash(private_key, 10); // Hash the private key before saving
            const newTimer = new TimeModel({ public_key, private_key: hashedPrivateKey, start_time, end_time });
            await newTimer.save();

            return res.status(201).json({ message: "Start time and end time have been created!" });
        }
    } catch (error) {
        console.error("Error saving time range:", error);
        return res.status(500).json({ error: "An error occurred while processing the request. Please try again." });
    }
};


// To delete all data from Student Model and Quiz Model using Public Key if it expires in Time Model


export const deleteExpiredEntriesAndAssociatedData = async (req: Request, res: Response): Promise<any> => {
    try {
        const currentTime = new Date();

        const expiredEntries = await TimeModel.find({
            expire_time: { $lte: currentTime.toISOString() },
        });

        const expiredPublicKeys = expiredEntries.map((entry) => entry.public_key);

        const timeResult = await TimeModel.deleteMany({
            public_key: { $in: expiredPublicKeys },
        });

        const quizPublicKeys = await Quiz.find({
            public_key: { $in: expiredPublicKeys },
        }).distinct("public_key");

        const keysToRemove = expiredPublicKeys.filter(key => !quizPublicKeys.includes(key));

        const studentResult = await StudentAnswer.deleteMany({
            public_key: { $in: expiredPublicKeys },
        });

        const quizResult = await Quiz.deleteMany({
            public_key: { $in: expiredPublicKeys },
        });

        return res.status(200).json({
            message: "Expired entries and associated data have been deleted successfully.",
            timeEntriesDeleted: timeResult.deletedCount,
            studentAnswersDeleted: studentResult.deletedCount,
            quizzesDeleted: quizResult.deletedCount,
            additionalKeysRemoved: keysToRemove.length,
        });

    } catch (error) {
        console.error("Error deleting expired entries and associated data:", error);
        return res.status(500).json({
            error: "An error occurred while deleting expired entries and associated data. Please try again.",
        });
    }
};
