import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// TypeScript interface for the User document
export interface IUser extends Document {
  email: string;
  hashedPassword: string;
  name: string;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // Disable __v field
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  try {
    const saltRounds = 12;
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.hashedPassword);
};

// Add methods to the schema
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  delete obj.hashedPassword; // Never expose password hash
  return obj;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email }).exec();
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
