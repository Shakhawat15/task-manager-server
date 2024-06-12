const taskModel = require("../models/task.model");
const apiResponse = require("../utils/apiResponse");

// Create a new task
exports.createTask = (req, res) => {
  try {
    const { title, description, status } = req.body;
    const email = req.user.email;
    const task = new taskModel({
      title,
      description,
      email,
      status,
    });

    task.save();

    return apiResponse.successResponse(res, "Task created successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel.find();
    return apiResponse.successResponseWithData(res, "All tasks", tasks);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return apiResponse.notFoundResponse(res, "Task not found");
    }
    return apiResponse.successResponseWithData(res, "Task", task);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// List tasks by status
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const email = req.user.email;
    const tasks = await taskModel.find({ status, email });
    return apiResponse.successResponseWithData(res, "Tasks", tasks);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Count tasks by status
exports.countTasksByStatus = async (req, res) => {
  try {
    const email = req.user.email;
    const tasks = await taskModel.aggregate([
      { $match: { email } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    return apiResponse.successResponseWithData(res, "Tasks", tasks);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Update task status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id, status } = req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return apiResponse.notFoundResponse(res, "Task not found");
    }
    task.status = status;
    task.save();
    return apiResponse.successResponse(res, "Task status updated successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const task = await taskModel.findById(id);
    if (!task) {
      return apiResponse.notFoundResponse(res, "Task not found");
    }
    task.title = title;
    task.description = description;
    task.status = status;
    task.save();
    return apiResponse.successResponse(res, "Task updated successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findById(id);
    if (!task) {
      return apiResponse.notFoundResponse(res, "Task not found");
    }
    task.delete();
    return apiResponse.successResponse(res, "Task deleted successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
