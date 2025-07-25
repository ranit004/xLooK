import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    hashedPassword: string;
    name: string;
    plan: 'free' | 'premium' | 'pro';
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map