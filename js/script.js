document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const taskInput = document.getElementById('task-input');
  const dateInput = document.getElementById('date-input');
  const priorityInput = document.getElementById('priority-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskListContainer = document.getElementById('task-list-container');
  const taskCount = document.getElementById('task-count');
  const filterDropdown = document.getElementById('filter-dropdown');
  const deleteCompletedBtn = document.getElementById('delete-completed-btn');
  const validationMessage = document.getElementById('validation-message');

  // App State
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, text: 'Setup CI/CD pipeline for the new project', dueDate: '2025-10-18', priority: 'high', completed: false },
    { id: 2, text: 'Refactor the authentication module', dueDate: '2025-10-20', priority: 'medium', completed: false },
    { id: 3, text: 'Write documentation for the API endpoints', dueDate: '2025-10-22', priority: 'low', completed: true },
    { id: 4, text: 'Deploy the latest build to staging environment', dueDate: '', priority: 'medium', completed: false },
  ];
  let currentFilter = 'all';

  // Functions
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const renderTasks = () => {
    taskListContainer.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      taskListContainer.innerHTML = `<p class="text-center text-gray-400 py-8">No tasks here. Great job, or time to add one!</p>`;
    } else {
      filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item', 'flex', 'items-center', 'p-3', 'my-2', 'bg-gray-50', 'rounded-lg', 'border-l-4', `priority-${task.priority}`, 'transition-all', 'duration-300');
        if (task.completed) {
          taskElement.classList.add('opacity-60');
        }

        const priorityColors = {
          high: 'bg-red-100 text-red-800',
          medium: 'bg-amber-100 text-amber-800',
          low: 'bg-blue-100 text-blue-800'
        };

        taskElement.innerHTML = `
                            <input type="checkbox" data-id="${task.id}" class="task-checkbox h-5 w-5 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" ${task.completed ? 'checked' : ''}>
                            <div class="flex-grow ml-4">
                                <p class="font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${task.text}</p>
                                <div class="flex items-center gap-4 text-sm mt-1">
                                    ${task.dueDate ? `<span class="text-gray-500">${new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>` : ''}
                                    <span class="capitalize text-xs font-semibold px-2 py-1 rounded-full ${priorityColors[task.priority]}">${task.priority}</span>
                                </div>
                            </div>
                            <button data-id="${task.id}" class="delete-btn text-gray-400 hover:text-red-500 ml-4 p-1 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        `;
        taskListContainer.appendChild(taskElement);
      });
    }
    updateTaskCount();
  };

  const updateTaskCount = () => {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `You have ${activeTasks} active ${activeTasks === 1 ? 'task' : 'tasks'}.`;
  };

  const addTask = () => {
    const text = taskInput.value.trim();
    const dueDate = dateInput.value;
    const priority = priorityInput.value;

    if (text.length >= 3) {
      // Clear previous validation state
      validationMessage.classList.add('hidden');
      taskInput.classList.remove('ring-2', 'ring-red-500');

      const newTask = {
        id: Date.now(),
        text,
        dueDate,
        priority,
        completed: false
      };
      tasks.push(newTask);
      saveTasks();
      renderTasks();
      taskInput.value = '';
      dateInput.value = '';
      priorityInput.value = 'medium';
      taskInput.focus();
    } else {
      // Validation failed, show message and red ring
      validationMessage.textContent = 'Task must be at least 3 characters.';
      validationMessage.classList.remove('hidden');
      taskInput.classList.add('ring-2', 'ring-red-500');

      // Shake the input for visual feedback
      taskInput.classList.add('shake');
      setTimeout(() => {
        taskInput.classList.remove('shake');
      }, 400);
    }
  };

  const handleTaskListClick = (e) => {
    // Toggle complete
    if (e.target.classList.contains('task-checkbox')) {
      const taskId = Number(e.target.dataset.id);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      }
    }

    // Delete task
    if (e.target.closest('.delete-btn')) {
      const taskId = Number(e.target.closest('.delete-btn').dataset.id);
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
    }
  };

  // Event Listeners
  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Reset placeholder on new input
  taskInput.addEventListener('input', () => {
    if (!validationMessage.classList.contains('hidden')) {
      validationMessage.classList.add('hidden');
      taskInput.classList.remove('ring-2', 'ring-red-500');
    }
  });

  taskListContainer.addEventListener('click', handleTaskListClick);

  filterDropdown.addEventListener('change', () => {
    currentFilter = filterDropdown.value;
    renderTasks();
  });

  deleteCompletedBtn.addEventListener('click', () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
  });

  // Initial Render
  renderTasks();
});