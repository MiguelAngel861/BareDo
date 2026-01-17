document.addEventListener('DOMContentLoaded', () => {
    const tasksList = document.getElementById('tasks-list');
    const addForm = document.getElementById('add-task-form');
    let addModal = document.getElementById('add-modal');
    let openAdd = document.getElementById('open-add');
    let addCancel = document.getElementById('add-cancel');
    // Fallback lookups in case elements aren't found by ID (robustness)
    if (!openAdd) openAdd = document.querySelector('.add-container button');
    if (!addModal) addModal = document.querySelector('#add-modal');
    if (!addCancel) addCancel = document.querySelector('#add-cancel');
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
                    let due = '';
                    if (task.due_date) {
                        try {
                            due = `Due: ${new Date(task.due_date).toLocaleString()}`;
                        } catch (err) {
                            due = `Due: ${task.due_date}`;
                        }
                    }
                    const prio = task.priority ? `Priority: ${task.priority}` : '';
                    info.textContent = `${task.title} - ${task.description} ${due ? '- ' + due : ''} ${prio ? '- ' + prio : ''} (Completed: ${task.completed ? 'Yes' : 'No'}) - Created: ${task.created_at}`;

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

    // Abrir modal de agregar (si existe botón)
    if (openAdd && addModal) {
        openAdd.addEventListener('click', () => {
            addModal.classList.remove('hidden');
            const titleInput = document.getElementById('title');
            if (titleInput) titleInput.focus();
        });
    } else {
        console.warn('Add modal or button not found in DOM.');
    }

    // Helpers to normalize datetime formats
    function inputToIsoNoTZ(val) {
        if (!val) return null;
        // val from datetime-local is like 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS'
        if (val.length === 16) return val + ':00';
        if (val.length >= 19) return val.slice(0, 19);
        return val;
    }

    function isoToInputValue(iso) {
        if (!iso) return '';
        // Try to parse into a Date; if invalid, fallback to trimming
        const d = new Date(iso);
        if (isNaN(d)) {
            const s = String(iso).split(/[Z+-]/)[0];
            return s.length >= 16 ? s.slice(0, 16) : s;
        }
        const pad = n => String(n).padStart(2, '0');
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }

    // Remove keys whose value is null or an empty string (preserve false/0)
    function prunePayload(obj) {
        const out = {};
        Object.keys(obj).forEach(k => {
            const v = obj[k];
            if (v === null || v === undefined) return;
            if (typeof v === 'string' && v.trim() === '') return;
            out[k] = v;
        });
        return out;
    }

    // Agregar tarea (POST)
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const rawDue = document.getElementById('due-date').value;
        const due_date = inputToIsoNoTZ(rawDue);
        const priority = document.getElementById('priority').value || 'medium';
        try {
            const payload = prunePayload({ title, description, due_date, priority });
            const response = await fetch('/api/v1/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
    if (addCancel && addModal) {
        addCancel.addEventListener('click', () => {
            addForm.reset();
            addModal.classList.add('hidden');
        });
    }

    // Click en overlay cierra modal de agregar
    if (addModal) {
        addModal.addEventListener('click', (e) => {
            if (e.target === addModal) {
                addForm.reset();
                addModal.classList.add('hidden');
            }
        });
    }

    // Close modals with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (addModal && !addModal.classList.contains('hidden')) addModal.classList.add('hidden');
            if (editModal && !editModal.classList.contains('hidden')) editModal.classList.add('hidden');
        }
    });

    function openEditForm(task) {
        currentEditTask = task;
        editTaskId.value = task.task_id;
        editTitle.value = task.title;
        editDescription.value = task.description || '';
        const editDue = document.getElementById('edit-due-date');
        const editPriority = document.getElementById('edit-priority');
        if (editDue) editDue.value = isoToInputValue(task.due_date) || '';
        if (editPriority) editPriority.value = task.priority || 'medium';
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
            due_date: inputToIsoNoTZ(document.getElementById('edit-due-date').value) || null,
            priority: document.getElementById('edit-priority').value || 'medium',
            completed: editCompleted.checked
        };
        const changes = {};
        if (currentEditTask) {
            if (updated.title !== currentEditTask.title) changes.title = updated.title;
            if (updated.description !== currentEditTask.description) changes.description = updated.description;
            // compare due_date by timestamp (handles formatting differences)
            try {
                const currDueTs = currentEditTask.due_date ? new Date(currentEditTask.due_date).getTime() : null;
                const updDueTs = updated.due_date ? new Date(updated.due_date).getTime() : null;
                if (currDueTs !== updDueTs) changes.due_date = updated.due_date;
            } catch (e) {
                if (String(updated.due_date) !== String(currentEditTask.due_date)) changes.due_date = updated.due_date;
            }
            if (updated.priority !== currentEditTask.priority) changes.priority = updated.priority;
            if (updated.completed !== Boolean(currentEditTask.completed)) changes.completed = updated.completed;
        }
        const changeKeys = Object.keys(changes);
        if (changeKeys.length === 0) {
            closeEditForm();
            return;
        }
        const allFieldsChanged = changeKeys.length === 5;
        const method = allFieldsChanged ? 'PUT' : 'PATCH';
        const payload = allFieldsChanged ? updated : changes;
        const pruned = prunePayload(payload);
        if (Object.keys(pruned).length === 0) {
            closeEditForm();
            return;
        }
        try {
            const response = await fetch(`/api/v1/tasks/${id}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pruned)
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