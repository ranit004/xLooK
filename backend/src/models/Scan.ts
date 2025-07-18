import mongoose, { Document, Schema } from 'mongoose';
import { CombinedSecurityAnalysis } from '../services/riskAnalyzer';
import { URLCheckResult } from '../controllers/urlController';

// TypeScript interface for the Scan document
export interface IScan extends Document {
  url: string;
  result: {
    success: boolean;
    results: URLCheckResult[];
    securityAnalysis: CombinedSecurityAnalysis;
    checkedAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const scanSchema = new Schema<IScan>({
  url: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true // Create index for faster queries
  },
  result: {
    success: {
      type: Boolean,
      required: true
    },
    results: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      status: { 
        type: String, 
        enum: ['safe', 'warning', 'danger'], 
        required: true 
      },
      details: String,
      value: String,
      category: {
        type: String,
        enum: ['security', 'info', 'technical']
      }
    }],
    securityAnalysis: {
      riskAnalysis: {
        overallRisk: {
          type: String,
          enum: ['safe', 'unsafe', 'warning'],
          required: true
        },
        riskScore: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        reasons: [String],
        confidence: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        summary: {
          type: String,
          required: true
        }
      },
      virusTotal: Schema.Types.Mixed,
      safeBrowsing: Schema.Types.Mixed,
      whois: Schema.Types.Mixed,
      ssl: Schema.Types.Mixed,
      redirects: Schema.Types.Mixed,
      geolocation: Schema.Types.Mixed,
      checkedAt: {
        type: String,
        required: true
      }
    },
    checkedAt: {
      type: String,
      required: true
    },
    ipAddress: String,
    userAgent: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false // Disable __v field
});

// Create indexes for better query performance
scanSchema.index({ url: 1, createdAt: -1 });
scanSchema.index({ 'result.securityAnalysis.riskAnalysis.overallRisk': 1 });
scanSchema.index({ createdAt: -1 });

// Add methods to the schema
scanSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

// Static method to find recent scans for a URL
scanSchema.statics.findRecentScans = function(url: string, limit: number = 10) {
  return this.find({ url })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

// Static method to get scan statistics
scanSchema.statics.getScanStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$result.securityAnalysis.riskAnalysis.overallRisk',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        riskLevel: '$_id',
        count: 1
      }
    }
  ]);
};

const Scan = mongoose.model<IScan>('Scan', scanSchema);

export default Scan;
