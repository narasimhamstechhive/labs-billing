import Department from '../models/Department.js';

// @desc Get all departments
// @route GET /api/departments
// @access Private
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isDeleted: false });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Create a department
// @route POST /api/departments
// @access Private (Admin)
export const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = await Department.create({ name, description });
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Update a department
// @route PUT /api/departments/:id
// @access Private (Admin)
export const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        department.name = req.body.name || department.name;
        department.description = req.body.description || department.description;

        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Delete a department (Soft delete)
// @route DELETE /api/departments/:id
// @access Private (Admin)
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ message: 'Department not found' });

        department.isDeleted = true;
        await department.save();
        res.json({ message: 'Department removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
