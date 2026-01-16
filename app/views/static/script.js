document.addEventListener('DOMContentLoaded', () => {
    const tasksList = document.getElementById('tasks-list');
    const addForm = document.getElementById('add-task-form');
    const addModal = document.getElementById('add-modal');
    const openAdd = document.getElementById('open-add');
    const addCancel = document.getElementById('add-cancel');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-task-form');
    const editTaskId = document.getElementById('edit-task-id');
    const editTitle = document.getElementById('edit-title');
    const editDescription = document.getElementById('edit-description');
    const editCompleted = document.getElementById('edit-completed');
    const editCancel = document.getElementById('edit-cancel');
    let currentEditTask = null;

    // Función para cargar y mostrar tareas (GET)
    async function loadTasks() {
        try {
            const response = await fetch('/api/v1/tasks');  // Ajusta si url_prefix cambia
            if (!response.ok) throw new Error('Error loading tasks');
            const tasks = await response.json();
            tasksList.innerHTML = '';  // Limpia lista
            tasks.forEach(task => {
                const li = document.createElement('li');
                const info = document.createElement('span');
                info.textContent = `${task.title} - ${task.description} (Completed: ${task.completed ? 'Yes' : 'No'}) - Created: ${task.created_at}`;

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => openEditForm(task));

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteTask(task.task_id));

                li.appendChild(info);
                li.appendChild(editButton);
                li.appendChild(deleteButton);
                tasksList.appendChild(li);
            });
        } catch (error) {
            alert(error.message);
        }
    }

    // Abrir modal de agregar
    openAdd.addEventListener('click', () => {
        addModal.classList.remove('hidden');
        // focus first input
        const titleInput = document.getElementById('title');
        if (titleInput) titleInput.focus();
    });

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
            addModal.classList.add('hidden');
            loadTasks();  // Recarga lista
        } catch (error) {
            alert(error.message);
        }
    });

    // Cancelar y cerrar modal de agregar
    addCancel.addEventListener('click', () => {
        addForm.reset();
        addModal.classList.add('hidden');
    });

    // Click en overlay cierra modal de agregar
    addModal.addEventListener('click', (e) => {
        if (e.target === addModal) {
            addForm.reset();
            addModal.classList.add('hidden');
        }
    });

    function openEditForm(task) {
        currentEditTask = task;
        editTaskId.value = task.task_id;
        editTitle.value = task.title;
        editDescription.value = task.description;
        editCompleted.checked = Boolean(task.completed);
        editModal.classList.remove('hidden');
        editTitle.focus();
    }

    function closeEditForm() {
        currentEditTask = null;
        editModal.classList.add('hidden');
        editForm.reset();
    }

    // Editar tarea (PUT) con checkbox de completado
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editTaskId.value;
        const updated = {
            title: editTitle.value.trim(),
            description: editDescription.value.trim(),
            completed: editCompleted.checked
        };
        const changes = {};
        if (currentEditTask) {
            if (updated.title !== currentEditTask.title) changes.title = updated.title;
            if (updated.description !== currentEditTask.description) changes.description = updated.description;
            if (updated.completed !== Boolean(currentEditTask.completed)) changes.completed = updated.completed;
        }
        const changeKeys = Object.keys(changes);
        if (changeKeys.length === 0) {
            closeEditForm();
            return;
        }
        const allFieldsChanged = changeKeys.length === 3;
        const method = allFieldsChanged ? 'PUT' : 'PATCH';
        const payload = allFieldsChanged ? updated : changes;
        try {
            const response = await fetch(`/api/v1/tasks/${id}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Error editing task');
            closeEditForm();
            loadTasks();
        } catch (error) {
            alert(error.message);
        }
    });

    editCancel.addEventListener('click', () => closeEditForm());

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditForm();
        }
    });

    // Eliminar tarea (DELETE)
    async function deleteTask(id) {
        if (confirm('Delete task?')) {
            try {
                const response = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error deleting task');
                loadTasks();
            } catch (error) {
                alert(error.message);
            }
        }
    }

    // Carga inicial
    loadTasks();
});