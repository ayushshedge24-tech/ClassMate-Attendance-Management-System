const Program = require('../models/Program');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const Student = require('../models/Student');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public or Authenticated
const getPrograms = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const programs = await Program.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single program by ID
// @route   GET /api/programs/:id
// @access  Public or Authenticated
const getProgramById = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new college program
// @route   POST /api/programs
// @access  Private (Admin only)
const createProgram = async (req, res, next) => {
  try {
    const { name, code, department, totalSemesters, divisions, academicYears, description, status } = req.body;

    if (!name || !code || !department) {
      return res.status(400).json({
        success: false,
        message: 'Program name, code, and department are required',
      });
    }

    const existing = await Program.findOne({ $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Program with this name or code already exists',
      });
    }

    const program = await Program.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department: department.trim(),
      totalSemesters: totalSemesters ? Number(totalSemesters) : 6,
      divisions: Array.isArray(divisions) && divisions.length > 0 ? divisions : ['A', 'B', 'C', 'D'],
      academicYears: Array.isArray(academicYears) && academicYears.length > 0 ? academicYears : ['2026-2027', '2025-2026'],
      description: description ? description.trim() : '',
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'College program created successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Admin only)
const updateProgram = async (req, res, next) => {
  try {
    let program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    const { name, code, department, totalSemesters, divisions, academicYears, description, status } = req.body;

    if (name) program.name = name.trim();
    if (code) program.code = code.trim().toUpperCase();
    if (department) program.department = department.trim();
    if (totalSemesters) program.totalSemesters = Number(totalSemesters);
    if (divisions) program.divisions = divisions;
    if (academicYears) program.academicYears = academicYears;
    if (description !== undefined) program.description = description.trim();
    if (status) program.status = status;

    await program.save();

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Admin only)
const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    await program.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/programs/departments/all
// @access  Authenticated
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('hod', 'name email phone').sort({ name: 1 });

    const results = await Promise.all(
      departments.map(async (d) => {
        const programCount = await Program.countDocuments({ department: d.name });
        const subjectCount = await Subject.countDocuments({ department: d.name });
        const studentCount = await Student.countDocuments({
          $or: [{ department: d.name }, { course: new RegExp(d.name, 'i') }],
        });

        return {
          ...d.toObject(),
          programCount,
          subjectCount,
          studentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/programs/departments
// @access  Private (Admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, hod } = req.body;
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required',
      });
    }

    const existing = await Department.findOne({ $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists',
      });
    }

    const dept = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      hod: hod || null,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: dept,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  getDepartments,
  createDepartment,
};
