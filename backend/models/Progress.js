import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  watchedDuration: {
    type: Number,
    default: 0
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }
});

const progressSchema = new mongoose.Schema({
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
  lessonsProgress: [lessonProgressSchema],
  completedLessons: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  percentageComplete: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

// Compound index for user-course lookups
progressSchema.index({ user: 1, course: 1 }, { unique: true });

// Calculate percentage before saving
progressSchema.pre('save', function(next) {
  if (this.totalLessons > 0) {
    this.percentageComplete = Math.round((this.completedLessons / this.totalLessons) * 100);
    this.isCompleted = this.percentageComplete === 100;
    if (this.isCompleted && !this.completedAt) {
      this.completedAt = new Date();
    }
  }
  next();
});

export default mongoose.model('Progress', progressSchema);
