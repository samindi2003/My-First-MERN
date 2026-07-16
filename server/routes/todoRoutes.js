const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");
const authMiddleware = require("../middleware/authMiddleware");


// CREATE TODO
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const newTodo = new Todo({
      user: req.user.id,
      title: title.trim(),
    });

    await newTodo.save();

    res.status(201).json({
      message: "Task added successfully",
      todo: newTodo,
    });

  } catch (error) {
    console.error("Create todo error:", error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});


// GET LOGGED-IN USER TODOS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(todos);

  } catch (error) {
    console.error("Get todos error:", error);

    res.status(500).json({
      message: "Failed to load tasks",
    });
  }
});


// UPDATE TODO
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, completed } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      todo.title = title.trim();
    }

    if (completed !== undefined) {
      todo.completed = completed;
    }

    await todo.save();

    res.status(200).json({
      message: "Task updated successfully",
      todo,
    });

  } catch (error) {
    console.error("Update todo error:", error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});


// DELETE TODO
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });

  } catch (error) {
    console.error("Delete todo error:", error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});


module.exports = router;