const express = require("express");
const router = express.Router();

// import controller
const {
  createTask,
  getAllTasks,
  getTask,
  getTasksByStatus,
  countTasksByStatus,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/task.controller");
const { auth } = require("../middlewares/auth.middleware");

// routes
router.post("/task", auth, createTask);
router.get("/tasks", auth, getAllTasks);
router.get("/task/:id", auth, getTask);
router.get("/tasks/:status", auth, getTasksByStatus);
router.get("/tasks-count", auth, countTasksByStatus);
router.put("/task-status/:id/:status", auth, updateTaskStatus);
router.put("/task/:id", auth, updateTask);
router.delete("/task/:id", auth, deleteTask);

module.exports = router;
