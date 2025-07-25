"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
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
    plan: {
        type: String,
        enum: ['free', 'premium', 'pro'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.pre('save', async function (next) {
    if (!this.isModified('hashedPassword'))
        return next();
    try {
        const saltRounds = 12;
        this.hashedPassword = await bcrypt_1.default.hash(this.hashedPassword, saltRounds);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (password) {
    return bcrypt_1.default.compare(password, this.hashedPassword);
};
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    delete obj.hashedPassword;
    return obj;
};
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email }).exec();
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map