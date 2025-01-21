import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"

const SALT_ROUNDS= process.env.SALT_ROUNDS || 10
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key'; 
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
    const iv = crypto.randomBytes(IV_LENGTH); 
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedData = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export interface IQuiz extends Document {
    public_key: string;
    private_key: string;
    question: string;
    options: string[];
    correctOption: string[];
    verifyCorrectOption: (submittedCorrectOption: number[]) => Promise<boolean>;
}

const quizSchema: Schema<IQuiz> = new Schema({
    public_key: {
        type: String,
        required: true,
        unique: true
    },
    private_key: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (options: string[]) => options.length > 1,
            message: "There must be at least two options."
        }
    },
    correctOption: {
        type: [String],
        required: true,
        validate: {
            validator: function (correctOption: string[]) {
                return correctOption.every(index => parseInt(index) >= 0 && parseInt(index) < this.options.length);
            },
            message: "Correct option indices must be valid and within range of options."
        }
    }
});

quizSchema.pre("save", async function (next) {
    try {
        if (this.isModified("private_key")) {
            this.private_key = await bcrypt.hash(this.private_key, SALT_ROUNDS);
        }
        if (this.isModified("correctOption")) {
            this.correctOption = await Promise.all(
                this.correctOption.map(async (number) => {
                    const hashedNumber = encrypt(number.toString())
                    return hashedNumber;
                })
            );
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

quizSchema.methods.verifyCorrectOption = async function (
    submittedCorrectOption: number[]
): Promise<boolean> {
    const correctOptionHashes = await Promise.all(
        submittedCorrectOption.map(async (number) => {
            const hashedNumber = await bcrypt.hash(number.toString(), SALT_ROUNDS);
            return hashedNumber;
        })
    );

    return Promise.all(
        correctOptionHashes.map(async (submittedHash, index) => {
            return await bcrypt.compare(submittedHash, this.correctOption[index]);
        })
    ).then(results => results.every(result => result === true));
};

const Quiz: Model<IQuiz> = mongoose.model<IQuiz>("Quiz", quizSchema);

export default Quiz;
