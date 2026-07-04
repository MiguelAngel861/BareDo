async function loadTasks() {
  const ul = document.getElementById("task-list");
  ul.innerHTML = "";

  const resp = await fetch("/api/v1/tasks");
  const data = await resp.json();

  for (const t of data.tasks) {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = `${t.title} - ${t.description || ""}`;
    li.appendChild(span);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      await fetch(`/api/v1/tasks/${t.task_id}`, { method: "DELETE" });
      loadTasks();
    });
    li.appendChild(delBtn);

    ul.appendChild(li);
  }
}

document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const priority = parseInt(document.getElementById("priority").value, 10);

  await fetch("/api/v1/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, priority }),
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("priority").value = "1";

  loadTasks();
});

loadTasks();
