import mongoose, { Document, Schema, Model } from "mongoose";

import bcrypt from "bcrypt";

const SALT_ROUNDS= process.env.SALT_ROUNDS || 10

export interface IStudentAnswer extends Document {
    public_key: string
    user_name: string
    private_key: string;
    qid: string;
    answer: string[];
}

const StudentAnswerSchema: Schema<IStudentAnswer> = new Schema({
    public_key: { type: String, required: true },
    user_name: { type: String, required: true },
    private_key: { type: String, required: true, unique:true },
    qid: { type: String, required: true },
    answer: {
        type: [String],
        required: true,
        validate: {
            validator: function (ans: string[]) {
                return ans.every(index => parseInt(index) >= 0);
            },
            message: "Correct option indices must be valid and within range of options."
        }
    }
});

StudentAnswerSchema.pre("save", async function (next) {
    try {
        if (this.isModified("private_key")) {
            this.private_key = await bcrypt.hash(this.private_key, SALT_ROUNDS);
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

const StudentAnswer: Model<IStudentAnswer> = mongoose.model<IStudentAnswer>("StudentAnswer", StudentAnswerSchema);
export default StudentAnswer;
