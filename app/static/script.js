document.addEventListener('DOMContentLoaded', () => {
    const tasksList = document.getElementById('tasks-list');
    const addForm = document.getElementById('add-task-form');

    // Función para cargar y mostrar tareas (GET)
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');  // Ajusta si url_prefix cambia
            if (!response.ok) throw new Error('Error al cargar tareas');
            const tasks = await response.json();
            tasksList.innerHTML = '';  // Limpia lista
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${task.titulo} - ${task.descripcion} (Realizada: ${task.realizada ? 'Sí' : 'No'}) - Creada: ${task.fecha_creacion}</span>
                    <button onclick="editTask(${task.id_tareas})">Editar</button>
                    <button onclick="deleteTask(${task.id_tareas})">Eliminar</button>
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
        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, descripcion })
            });
            if (!response.ok) throw new Error('Error al agregar tarea');
            addForm.reset();  // Limpia form
            loadTasks();  // Recarga lista
        } catch (error) {
            alert(error.message);
        }
    });

    // Editar tarea (PUT) - Usa prompt simple para demo
    window.editTask = async (id) => {
        const newTitulo = prompt('Nuevo título:');
        const newDescripcion = prompt('Nueva descripción:');
        const newRealizada = confirm('¿Marcar como realizada?');
        if (newTitulo || newDescripcion || newRealizada !== undefined) {
            const data = {};
            if (newTitulo) data.titulo = newTitulo;
            if (newDescripcion) data.descripcion = newDescripcion;
            if (newRealizada !== undefined) data.realizada = newRealizada;
            try {
                const response = await fetch(`/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) throw new Error('Error al editar');
                loadTasks();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Eliminar tarea (DELETE)
    window.deleteTask = async (id) => {
        if (confirm('¿Eliminar tarea?')) {
            try {
                const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar');
                loadTasks();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Carga inicial
    loadTasks();
});