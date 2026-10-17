const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Please provide subject code (e.g., IT301)'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Please provide subject name (e.g., Database Management System)'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    semester: {
      type: Number,
      required: [true, 'Please provide semester'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
    department: {
      type: String,
      trim: true,
      default: 'Information Technology',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index on semester for fast filtering
subjectSchema.index({ semester: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
