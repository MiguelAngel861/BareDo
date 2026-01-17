document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const qs = sel => document.querySelector(sel);

    const tasksList = $('tasks-list');
    const addModal = $('add-modal');
    const editModal = $('edit-modal');

    const addForm = $('add-task-form');
    const editForm = $('edit-task-form');

    let currentEditTask = null;

    /* ---------- Helpers ---------- */
    const prune = o =>
        Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== ''));

    const toIso = v => v ? (v.length === 16 ? `${v}:00` : v.slice(0, 19)) : null;

    const isoToInput = iso => {
        if (!iso) return '';
        const d = new Date(iso);
        return isNaN(d)
            ? iso.split(/[Z+-]/)[0].slice(0, 16)
            : d.toISOString().slice(0, 16);
    };

    const api = (url, opts = {}) =>
        fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts })
            .then(r => r.ok ? r.json().catch(() => { }) : Promise.reject());

    const openModal = m => m.classList.remove('hidden');
    const closeModal = (m, f) => {
        f?.reset();
        m.classList.add('hidden');
    };

    /* ---------- Load Tasks ---------- */
    const loadTasks = async () => {
        try {
            const tasks = await api('/api/v1/tasks');
            tasksList.innerHTML = '';
            tasks.forEach(t => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>
                        ${t.title} - ${t.description || ''}
                        ${t.due_date ? `- Due: ${new Date(t.due_date).toLocaleString()}` : ''}
                        ${t.priority ? `- Priority: ${t.priority}` : ''}
                        (Completed: ${t.completed ? 'Yes' : 'No'})
                    </span>
                `;
                ['Edit', 'Delete'].forEach(txt => {
                    const b = document.createElement('button');
                    b.textContent = txt;
                    b.onclick = () =>
                        txt === 'Edit' ? openEdit(t) : removeTask(t.task_id);
                    li.appendChild(b);
                });
                tasksList.appendChild(li);
            });
        } catch {
            alert('Error loading tasks');
        }
    };

    /* ---------- Add ---------- */
    qs('#open-add')?.addEventListener('click', () => openModal(addModal));

    addForm.addEventListener('submit', async e => {
        e.preventDefault();
        try {
            await api('/api/v1/tasks', {
                method: 'POST',
                body: JSON.stringify(prune({
                    title: $('title').value,
                    description: $('description').value,
                    due_date: toIso($('due-date').value),
                    priority: $('priority').value || 'medium'
                }))
            });
            closeModal(addModal, addForm);
            loadTasks();
        } catch {
            alert('Error adding task');
        }
    });

    const addCancel = $('add-cancel');
    if (addCancel) addCancel.onclick = () => closeModal(addModal, addForm);


    /* ---------- Edit ---------- */
    const openEdit = t => {
        currentEditTask = t;
        $('edit-task-id').value = t.task_id;
        $('edit-title').value = t.title;
        $('edit-description').value = t.description || '';
        $('edit-due-date').value = isoToInput(t.due_date);
        $('edit-priority').value = t.priority || 'medium';
        $('edit-completed').checked = !!t.completed;
        openModal(editModal);
    };

    editForm.addEventListener('submit', async e => {
        e.preventDefault();
        const id = $('edit-task-id').value;

        const updated = {
            title: $('edit-title').value.trim(),
            description: $('edit-description').value.trim(),
            due_date: toIso($('edit-due-date').value),
            priority: $('edit-priority').value,
            completed: $('edit-completed').checked
        };

        const changes = Object.fromEntries(
            Object.entries(updated).filter(
                ([k, v]) => String(v) !== String(currentEditTask[k] ?? '')
            )
        );

        if (!Object.keys(changes).length) return closeModal(editModal, editForm);

        try {
            await api(`/api/v1/tasks/${id}`, {
                method: Object.keys(changes).length === 5 ? 'PUT' : 'PATCH',
                body: JSON.stringify(prune(changes))
            });
            closeModal(editModal, editForm);
            loadTasks();
        } catch {
            alert('Error editing task');
        }
    });

    $('edit-cancel').onclick = () => closeModal(editModal, editForm);

    /* ---------- Delete ---------- */
    const removeTask = async id => {
        if (!confirm('Delete task?')) return;
        try {
            await api(`/api/v1/tasks/${id}`, { method: 'DELETE' });
            loadTasks();
        } catch {
            alert('Error deleting task');
        }
    };

    /* ---------- Global Close ---------- */
    [addModal, editModal].forEach(m =>
        m.addEventListener('click', e => e.target === m && closeModal(m))
    );

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal(addModal, addForm);
            closeModal(editModal, editForm);
        }
    });

    loadTasks();
});
