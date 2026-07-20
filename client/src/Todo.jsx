import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Load all todos
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5001/api/todos",
        authHeader
      );

      setTodos(response.data);
    } catch (error) {
      console.error("Load todos error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load tasks."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchTodos();
  }, []);

  // Add a new todo
  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await axios.post(
        "http://localhost:5001/api/todos",
        {
          title: title.trim(),
          dueDate: dueDate
            ? dueDate.toISOString()
            : null,
        },
        authHeader
      );

      setTodos((previousTodos) => [
        response.data.todo,
        ...previousTodos,
      ]);

      setTitle("");
      setDueDate(null);
      setMessage("Task added successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Add todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add task."
      );
    }
  };

  // Complete or uncomplete a todo
  const handleToggleTodo = async (todo) => {
    try {
      setError("");
      setMessage("");

      const response = await axios.put(
        `http://localhost:5001/api/todos/${todo._id}`,
        {
          completed: !todo.completed,
        },
        authHeader
      );

      setTodos((previousTodos) =>
        previousTodos.map((item) =>
          item._id === todo._id
            ? response.data.todo
            : item
        )
      );
    } catch (error) {
      console.error("Toggle todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update task."
      );
    }
  };

  // Start editing a todo
  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    setEditingTitle(todo.title);
    setError("");
    setMessage("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  // Save edited todo
  const handleSaveEdit = async (todoId) => {
    if (!editingTitle.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await axios.put(
        `http://localhost:5001/api/todos/${todoId}`,
        {
          title: editingTitle.trim(),
        },
        authHeader
      );

      setTodos((previousTodos) =>
        previousTodos.map((item) =>
          item._id === todoId
            ? response.data.todo
            : item
        )
      );

      setEditingId(null);
      setEditingTitle("");
      setMessage("Task updated successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Edit todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to edit task."
      );
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (todoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      await axios.delete(
        `http://localhost:5001/api/todos/${todoId}`,
        authHeader
      );

      setTodos((previousTodos) =>
        previousTodos.filter(
          (todo) => todo._id !== todoId
        )
      );

      if (editingId === todoId) {
        setEditingId(null);
        setEditingTitle("");
      }

      setMessage("Task deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    }
  };

  // Check whether the task is overdue
  const isOverdue = (todo) => {
    return (
      todo.dueDate &&
      !todo.completed &&
      new Date(todo.dueDate) < new Date()
    );
  };
 const filteredTodos = todos.filter((todo) =>
  (todo.title || "")
    .toLowerCase()
    .includes(searchTerm.trim().toLowerCase())
);


  return (
    <div className="glass-page todo-glass-page">
      <div className="white-glass-card large todo-glass-card">

        {/* Header */}
        <div className="todo-header mb-4">
          <button
            type="button"
            className="btn btn-outline-primary todo-back-button"
            onClick={() => navigate("/dashboard")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Dashboard
          </button>

          <div className="text-center todo-title-section">
            <div className="glass-icon mb-3">
              <i className="bi bi-check2-square"></i>
            </div>

            <h2 className="fw-bold text-primary mb-2">
              My To-Do List
            </h2>

            <p className="glass-subtitle">
              Add and manage your daily tasks
            </p>
          </div>
        </div>

        {/* Success message */}
        {message && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill me-2"></i>
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {error}
          </div>
        )}
        {/* Search Tasks */}
<div className="glass-inner-card mb-4">
  <label className="form-label fw-semibold">
    Search Tasks
  </label>

  <div className="input-group">
    <span className="input-group-text">
      <i className="bi bi-search"></i>
    </span>

    <input
      type="text"
      className="form-control"
      placeholder="Search by task title..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    {searchTerm && (
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setSearchTerm("")}
        title="Clear search"
      >
        <i className="bi bi-x-lg"></i>
      </button>
    )}
  </div>
</div>

        {/* Add task form */}
        <form
          onSubmit={handleAddTodo}
          className="todo-form mb-4"
        >
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Task Title
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-list-task"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your task"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Due Date and Time
              </label>

              <DatePicker
                selected={dueDate}
                onChange={(date) =>
                  setDueDate(date)
                }
                showTimeSelect
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select date and time"
                minDate={new Date()}
                className="form-control"
                wrapperClassName="w-100"
                isClearable
              />
            </div>

            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-primary w-100"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>

            <p className="text-muted mt-3 mb-0">
              Loading tasks...
            </p>
          </div>
        )}

        {/* No tasks */}
        {!isLoading && todos.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-clipboard-check display-4 text-muted"></i>

            <h5 className="mt-3">
              No tasks added yet
            </h5>

            <p className="text-muted">
              Add your first task using the form above.
            </p>
          </div>
        )}
        {/* No Search Results */}
{!isLoading &&
  todos.length > 0 &&
  filteredTodos.length === 0 && (
    <div className="glass-inner-card text-center py-5">
      <i className="bi bi-search fs-1 text-muted"></i>

      <h5 className="mt-3">
        No matching tasks found
      </h5>

      <p className="text-muted mb-3">
        No tasks match "{searchTerm}".
      </p>

      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() => setSearchTerm("")}
      >
        Clear Search
      </button>
    </div>
  )}

        {/* Todo list */}
        {!isLoading && filteredTodos.length > 0 && (
  <div className="todo-list">
    {filteredTodos.map((todo) => (
    
    
              <div
                key={todo._id}
                className={`card shadow-sm mb-3 ${
                  isOverdue(todo)
                    ? "border-danger"
                    : ""
                }`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center gap-3">

                    <div className="d-flex align-items-center flex-grow-1 gap-3">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        checked={Boolean(todo.completed)}
                        onChange={() =>
                          handleToggleTodo(todo)
                        }
                      />

                      <div className="flex-grow-1">
                        {editingId === todo._id ? (
                          <input
                            type="text"
                            className="form-control"
                            value={editingTitle}
                            onChange={(e) =>
                              setEditingTitle(
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit(
                                  todo._id
                                );
                              }

                              if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <>
                            <h6
                              className={`mb-1 ${
                                todo.completed
                                  ? "text-decoration-line-through text-muted"
                                  : ""
                              }`}
                            >
                              {todo.title}
                            </h6>

                            {todo.dueDate && (
                              <div>
                                <small
                                  className={
                                    isOverdue(todo)
                                      ? "text-danger fw-semibold"
                                      : "text-muted"
                                  }
                                >
                                  <i className="bi bi-calendar-event me-1"></i>

                                  {new Date(
                                    todo.dueDate
                                  ).toLocaleString()}

                                  {isOverdue(todo) && (
                                    <span className="ms-2">
                                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                      Overdue
                                    </span>
                                  )}
                                </small>
                              </div>
                            )}

                            {todo.completed && (
                              <small className="text-success">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Completed
                              </small>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {editingId === todo._id ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleSaveEdit(
                                todo._id
                              )
                            }
                            title="Save"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={
                              handleCancelEdit
                            }
                            title="Cancel"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            handleStartEdit(todo)
                          }
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          handleDeleteTodo(
                            todo._id
                          )
                        }
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Todo;