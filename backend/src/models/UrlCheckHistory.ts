import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for the URL check history document
export interface IUrlCheckHistory extends Document {
  userId: string;
  url: string;
  domain: string;
  verdict: 'SAFE' | 'DANGEROUS' | 'WARNING';
  virusTotalData: {
    malicious: number;
    phishing: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    total: number;
    permalink?: string;
  };
  googleSafeBrowsingData: {
    threatsFound: boolean;
    matches: any[];
  };
  results: any[];
  aiAnalysis: {
    verdict: 'SAFE' | 'DANGEROUS' | 'unavailable';
    reason: string;
  };
  checkedAt: Date;
  createdAt: Date;
}

const urlCheckHistorySchema = new Schema<IUrlCheckHistory>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ['SAFE', 'DANGEROUS', 'WARNING']
  },
  virusTotalData: {
    malicious: { type: Number, default: 0 },
    phishing: { type: Number, default: 0 },
    suspicious: { type: Number, default: 0 },
    harmless: { type: Number, default: 0 },
    undetected: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    permalink: { type: String }
  },
  googleSafeBrowsingData: {
    threatsFound: { type: Boolean, default: false },
    matches: { type: [Schema.Types.Mixed], default: [] }
  },
  results: [Schema.Types.Mixed],
  aiAnalysis: {
    verdict: { type: String, enum: ['SAFE', 'DANGEROUS', 'unavailable'], required: true },
    reason: { type: String, required: true }
  },
  checkedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // Disable __v field
});

// Create indexes for better query performance
urlCheckHistorySchema.index({ userId: 1, createdAt: -1 });
urlCheckHistorySchema.index({ url: 1, userId: 1 });
urlCheckHistorySchema.index({ domain: 1, userId: 1 });

const UrlCheckHistory = mongoose.model<IUrlCheckHistory>('UrlCheckHistory', urlCheckHistorySchema);

export default UrlCheckHistory;
