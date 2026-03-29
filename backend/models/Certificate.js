import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass'],
    default: 'Pass'
  },
  verificationUrl: String,
  pdfUrl: String
}, {
  timestamps: true
});

// Generate unique certificate ID before saving
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const hash = crypto.createHash('sha256')
      .update(this.user.toString() + this.course.toString() + Date.now())
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();
    this.certificateId = `CERT-${hash}`;
  }
  next();
});

// Compound index for user-course lookups
certificateSchema.index({ user: 1, course: 1 }, { unique: true });
// Note: certificateId already has unique: true in schema, no need for separate index

export default mongoose.model('Certificate', certificateSchema);
