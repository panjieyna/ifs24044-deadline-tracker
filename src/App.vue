<script setup>
import { computed, ref } from 'vue'
import { useTaskStore } from './stores/taskStore'
import TaskForm from './components/TaskForm.vue'
import TaskItem from './components/TaskItem.vue'

const store = useTaskStore()
const editingId = ref(null)
const editingTask = computed(() => store.tasks.find((t) => t.id === editingId.value) ?? null)

function save(data) {
  if (editingId.value) {
    store.updateTask(editingId.value, data)
    editingId.value = null
  } else {
    store.addTask(data)
  }
}

function remove(id) {
  if (confirm('Hapus tugas ini?')) {
    if (editingId.value === id) editingId.value = null
    store.removeTask(id)
  }
}
</script>

<template>
  <main class="page">
    <header>
      <h1>Tenggat tugas kuliah</h1>
      <p class="summary">
        {{ store.counts.belum }} belum selesai · {{ store.counts.terlambat }} terlambat ·
        {{ store.counts.selesai }} selesai
      </p>
    </header>

    <TaskForm :task="editingTask" @save="save" @cancel="editingId = null" />

    <section class="filters">
      <label>
        Mata kuliah
        <select v-model="store.filterCourse">
          <option value="">Semua</option>
          <option v-for="c in store.courses" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>
        Status
        <select v-model="store.filterStatus">
          <option value="semua">Semua</option>
          <option value="belum">Belum selesai</option>
          <option value="terlambat">Terlambat</option>
          <option value="selesai">Selesai</option>
        </select>
      </label>
    </section>

    <ul v-if="store.visibleTasks.length" class="list">
      <TaskItem
        v-for="t in store.visibleTasks"
        :key="t.id"
        :task="t"
        :status="store.statusOf(t)"
        :now="store.now"
        @toggle="store.toggleDone"
        @edit="editingId = $event"
        @remove="remove"
      />
    </ul>
    <p v-else class="empty">Belum ada tugas yang cocok. Tambahkan tugas pertamamu lewat form di atas.</p>
  </main>
</template>

<style>
:root {
  --bg: #f7f6f2;
  --card: #ffffff;
  --ink: #1d2433;
  --muted: #5d6677;
  --line: #dcdad2;
  --accent: #2b4c8c;
  --late: #b3261e;
  --done: #2e7d4f;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  background: var(--bg);
}
* { box-sizing: border-box; }
body { margin: 0; }
.page { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; }
h1 { margin: 0 0 4px; font-size: 1.6rem; }
h2 { margin: 0 0 12px; font-size: 1.1rem; }
.summary { margin: 0 0 20px; color: var(--muted); }

.form, .filters, .item {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 8px;
}
.form { padding: 16px; display: grid; gap: 12px; margin-bottom: 20px; }
.filters { padding: 12px 16px; display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
label { display: grid; gap: 4px; font-size: 0.9rem; flex: 1; min-width: 160px; }
input[type='text'], input[type='datetime-local'], select, textarea {
  font: inherit; padding: 8px; border: 1px solid var(--line); border-radius: 6px; background: #fff;
}
.row { display: flex; gap: 12px; flex-wrap: wrap; }
.err { color: var(--late); }
button {
  font: inherit; padding: 6px 12px; border: 1px solid var(--line);
  border-radius: 6px; background: #fff; cursor: pointer;
}
button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.actions { display: flex; gap: 8px; }

.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.item { display: flex; gap: 12px; padding: 12px 14px; border-left-width: 5px; }
.item.prio-tinggi { border-left-color: var(--late); }
.item.prio-sedang { border-left-color: #c8962b; }
.item.prio-rendah { border-left-color: var(--line); }
.item.selesai { opacity: 0.65; }
.item.selesai .title { text-decoration: line-through; }
.body { flex: 1; }
.title { margin: 0; font-weight: 600; }
.meta, .note { margin: 2px 0 0; font-size: 0.85rem; color: var(--muted); }
.side { display: grid; gap: 8px; justify-items: end; align-content: start; }
.badge { font-size: 0.8rem; font-weight: 600; color: var(--accent); }
.item.terlambat .badge { color: var(--late); }
.item.selesai .badge { color: var(--done); }
.empty { color: var(--muted); text-align: center; padding: 24px 0; }
</style>
