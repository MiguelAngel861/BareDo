document.addEventListener('DOMContentLoaded', () => {
    const tasksList = document.getElementById('tasks-list');
    const addForm = document.getElementById('add-task-form');

    // Función para cargar y mostrar tareas (GET)
    async function loadTasks() {
        try {
            const response = await fetch('/api/v1/tasks');  // Ajusta si url_prefix cambia
            if (!response.ok) throw new Error('Error loading tasks');
            const tasks = await response.json();
            tasksList.innerHTML = '';  // Limpia lista
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${task.title} - ${task.description} (Completed: ${task.completed ? 'Yes' : 'No'}) - Created: ${task.created_at}</span>
                    <button onclick="editTask(${task.task_id})">Edit</button>
                    <button onclick="deleteTask(${task.task_id})">Delete</button>
                `;
                tasksList.appendChild(li);
            });
        } catch (error) {
            alert(error.message);
        }
    }

    // Agregar tarea (POST)
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        try {
            const response = await fetch('/api/v1/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });
            if (!response.ok) throw new Error('Error adding task');
            addForm.reset();  // Limpia form
            loadTasks();  // Recarga lista
        } catch (error) {
            alert(error.message);
        }
    });

    // Editar tarea (PUT) - Usa prompt simple para demo
    window.editTask = async (id) => {
        const newTitle = prompt('New title:');
        const newDescription = prompt('New description:');
        const newCompleted = confirm('Mark as completed?');
        if (newTitle || newDescription || newCompleted !== undefined) {
            const data = {};
            if (newTitle) data.title = newTitle;
            if (newDescription) data.description = newDescription;
            if (newCompleted !== undefined) data.completed = newCompleted;
            try {
                const response = await fetch(`/api/v1/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Error editing task');
                loadTasks();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Eliminar tarea (DELETE)
    window.deleteTask = async (id) => {
        if (confirm('Delete task?')) {
            try {
                const response = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error deleting task');
                loadTasks();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Carga inicial
    loadTasks();
});