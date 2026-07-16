import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
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

  // LOAD TODOS
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

      setError("Failed to load tasks");
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

  // ADD TODO
  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await axios.post(
        "http://localhost:5001/api/todos",
        {
          title,
        },
        authHeader
      );

      setTodos([response.data.todo, ...todos]);
      setTitle("");
      setMessage("Task added successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Add todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to add task"
      );
    }
  };

  // COMPLETE OR UNCOMPLETE TODO
  const handleToggleTodo = async (todo) => {
    try {
      setError("");

      const response = await axios.put(
        `http://localhost:5001/api/todos/${todo._id}`,
        {
          completed: !todo.completed,
        },
        authHeader
      );

      setTodos(
        todos.map((item) =>
          item._id === todo._id
            ? response.data.todo
            : item
        )
      );
    } catch (error) {
      console.error("Toggle todo error:", error);

      setError("Failed to update task");
    }
  };

  // START EDITING
  const handleStartEdit = (todo) => {
    setEditingId(todo._id);
    setEditingTitle(todo.title);
  };

  // SAVE EDITED TODO
  const handleSaveEdit = async (todoId) => {
    if (!editingTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setError("");

      const response = await axios.put(
        `http://localhost:5001/api/todos/${todoId}`,
        {
          title: editingTitle,
        },
        authHeader
      );

      setTodos(
        todos.map((item) =>
          item._id === todoId
            ? response.data.todo
            : item
        )
      );

      setEditingId(null);
      setEditingTitle("");
      setMessage("Task updated successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Edit todo error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to edit task"
      );
    }
  };

  // DELETE TODO
  const handleDeleteTodo = async (todoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await axios.delete(
        `http://localhost:5001/api/todos/${todoId}`,
        authHeader
      );

      setTodos(
        todos.filter((todo) => todo._id !== todoId)
      );

      setMessage("Task deleted successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Delete todo error:", error);

      setError("Failed to delete task");
    }
  };

  return (
    <div className="container py-5">
      <div
        className="card shadow mx-auto"
        style={{ maxWidth: "700px" }}
      >
        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <h2 className="fw-bold text-primary mb-0">
              <i className="bi bi-check2-square me-2"></i>
              My To-Do List
            </h2>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Dashboard
            </button>

          </div>

          {message && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              {error}
            </div>
          )}

          <form
            onSubmit={handleAddTodo}
            className="d-flex gap-2 mb-4"
          >
            <input
              type="text"
              className="form-control"
              placeholder="Enter a new task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button
              type="submit"
              className="btn btn-primary"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add
            </button>
          </form>

          {isLoading ? (
            <div className="text-center py-4">
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i
                className="bi bi-clipboard-check"
                style={{ fontSize: "3rem" }}
              ></i>

              <p className="mt-3 mb-0">
                No tasks yet. Add your first task.
              </p>
            </div>
          ) : (
            <div className="list-group">

              {todos.map((todo) => (
                <div
                  key={todo._id}
                  className="list-group-item d-flex align-items-center gap-3"
                >

                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo)}
                  />

                  <div className="flex-grow-1">

                    {editingId === todo._id ? (

                      <input
                        type="text"
                        className="form-control"
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                      />

                    ) : (

                      <span
                        className={
                          todo.completed
                            ? "text-decoration-line-through text-muted"
                            : ""
                        }
                      >
                        {todo.title}
                      </span>

                    )}

                  </div>

                  {editingId === todo._id ? (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleSaveEdit(todo._id)
                        }
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditingTitle("");
                        }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          handleStartEdit(todo)
                        }
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          handleDeleteTodo(todo._id)
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Todo;