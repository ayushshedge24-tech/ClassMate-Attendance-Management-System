const mongoose = require('mongoose');

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide program name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide program code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide department'],
      trim: true,
      default: 'Information Technology',
    },
    totalSemesters: {
      type: Number,
      required: [true, 'Please provide total semesters'],
      default: 6,
      min: 1,
      max: 10,
    },
    divisions: {
      type: [String],
      default: ['A', 'B', 'C', 'D'],
    },
    academicYears: {
      type: [String],
      default: ['2026-2027', '2025-2026', '2024-2025'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
