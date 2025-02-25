// Initialize the tasks array from localStorage or create an empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// DOM Elements
const addTaskForm = document.getElementById("add-task-form");
const taskList = document.getElementById("task-list");
const filterImportance = document.getElementById("filter-importance");
const sortBy = document.getElementById("sort-by");
const editModal = document.getElementById("edit-modal");
const editTaskForm = document.getElementById("edit-task-form");
const closeModalBtn = document.querySelector(".close");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
});

addTaskForm.addEventListener("submit", addTask);
filterImportance.addEventListener("change", renderTasks);
sortBy.addEventListener("change", renderTasks);
editTaskForm.addEventListener("submit", saveEditTask);
closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    closeModal();
  }
});

// Task Functions
function addTask(e) {
  e.preventDefault();

  const taskName = document.getElementById("task-name").value;
  const taskDetails = document.getElementById("task-details").value;
  const dueDate = document.getElementById("due-date").value;
  const importance = document.getElementById("importance").value;

  const newTask = {
    id: Date.now(), // Unique ID based on timestamp
    name: taskName,
    details: taskDetails,
    dueDate: dueDate,
    importance: importance,
    completed: false,
    dateAdded: new Date().toISOString(),
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  // Reset form
  addTaskForm.reset();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function toggleComplete(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

function openEditModal(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (task) {
    document.getElementById("edit-task-id").value = task.id;
    document.getElementById("edit-task-name").value = task.name;
    document.getElementById("edit-task-details").value = task.details;
    document.getElementById("edit-due-date").value = task.dueDate;
    document.getElementById("edit-importance").value = task.importance;

    editModal.style.display = "block";
  }
}

function saveEditTask(e) {
  e.preventDefault();

  const taskId = parseInt(document.getElementById("edit-task-id").value);
  const taskName = document.getElementById("edit-task-name").value;
  const taskDetails = document.getElementById("edit-task-details").value;
  const dueDate = document.getElementById("edit-due-date").value;
  const importance = document.getElementById("edit-importance").value;

  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        name: taskName,
        details: taskDetails,
        dueDate: dueDate,
        importance: importance,
      };
    }
    return task;
  });

  saveTasks();
  renderTasks();
  closeModal();
}

function closeModal() {
  editModal.style.display = "none";
}

// Helper Functions
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getDaysRemaining(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Overdue";
  } else if (diffDays === 0) {
    return "Due today";
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
  }
}

function getFilteredAndSortedTasks() {
  // Filter by importance
  let filteredTasks = tasks;
  const importanceFilter = filterImportance.value;

  if (importanceFilter !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.importance === importanceFilter
    );
  }

  // Sort tasks
  const sortOption = sortBy.value;

  switch (sortOption) {
    case "date-added":
      filteredTasks.sort(
        (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
      );
      break;
    case "due-date":
      filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      break;
    case "importance":
      const importanceValues = { high: 3, medium: 2, low: 1 };
      filteredTasks.sort(
        (a, b) =>
          importanceValues[b.importance] - importanceValues[a.importance]
      );
      break;
  }

  return filteredTasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredAndSortedTasks();

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<p class="empty-message">No tasks to display.</p>';
    return;
  }

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.importance} ${
      task.completed ? "completed" : ""
    }`;

    const taskContent = document.createElement("div");
    taskContent.className = "task-content";

    const taskName = document.createElement("div");
    taskName.className = "task-name";
    taskName.textContent = task.name;

    const taskDetails = document.createElement("div");
    taskDetails.className = "task-details";
    taskDetails.textContent = task.details;

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";
    taskMeta.innerHTML = `
            Due: ${formatDate(task.dueDate)} 
            <span class="days-left">(${getDaysRemaining(task.dueDate)})</span>
            <span class="importance-badge ${task.importance}">${
      task.importance
    }</span>
        `;

    taskContent.appendChild(taskName);
    if (task.details) {
      taskContent.appendChild(taskDetails);
    }
    taskContent.appendChild(taskMeta);

    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.className = "action-btn complete-btn";
    completeBtn.textContent = task.completed ? "Undo" : "Complete";
    completeBtn.addEventListener("click", () => toggleComplete(task.id));

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this task?")) {
        deleteTask(task.id);
      }
    });

    taskActions.appendChild(completeBtn);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    taskItem.appendChild(taskContent);
    taskItem.appendChild(taskActions);

    taskList.appendChild(taskItem);
  });
}
