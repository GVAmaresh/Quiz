import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10

interface ITimeSchema {
    public_key: string
    private_key: string
    start_time: string
    end_time: string
    expire_time: string
}
const timeSchema: Schema<ITimeSchema> = new Schema({
    public_key: { type: String, required: true, unique:true },
    private_key: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    expire_time: {type: String}
})

timeSchema.pre("save", async function (next) {
    try {
        if (this.isModified("private_key")) {
            this.private_key = await bcrypt.hash(this.private_key, SALT_ROUNDS);
        }
        if (this.isModified("end_time")) {
            const endTime = new Date(this.end_time);
            const expireTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); 
            this.expire_time = expireTime.toISOString(); 
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

const TimeModel: Model<ITimeSchema> = mongoose.model<ITimeSchema>("Time", timeSchema)
export default TimeModel