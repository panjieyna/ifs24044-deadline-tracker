<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useTaskStore } from './stores/taskStore'
import TaskForm from './components/TaskForm.vue'
import TaskFilter from './components/TaskFilter.vue'
import TaskList from './components/TaskList.vue'

const store = useTaskStore()
const editingId = ref(null)
const editingTask = computed(() => store.tasks.find((t) => t.id === editingId.value) ?? null)

// Referensi ke kolom form, dipakai untuk menggulir ke form saat mode edit.
const formWrap = ref(null)

// Perbarui waktu sekarang tiap 30 detik; dihentikan saat komponen dilepas.
let timer
onMounted(() => { timer = setInterval(store.tick, 30000) })
onUnmounted(() => clearInterval(timer))

// Masuk mode edit, lalu gulir dan fokus ke form.
async function startEdit(id) {
  editingId.value = id
  await nextTick() // tunggu TaskForm selesai terisi data tugas
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  formWrap.value?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  formWrap.value?.querySelector('input[type="text"]')?.focus({ preventScroll: true })
}

function save(data) {
  if (editingId.value) {
    store.updateTask(editingId.value, data)
    editingId.value = null
  } else {
    store.addTask(data)
  }
}

function remove(id) {
  if (!confirm('Hapus tugas ini?')) return
  if (editingId.value === id) editingId.value = null
  store.removeTask(id)
}
</script>

<template>
  <main class="page">
    <!-- DIUBAH: ringkasan jadi tiga kartu angka yang mudah dipindai -->
    <header class="top">
      <h1>Tenggat tugas kuliah</h1>
      <ul class="stats">
        <li class="stat stat-belum">
          <span class="num">{{ store.counts.belum }}</span>
          <span class="lbl">Belum selesai</span>
        </li>
        <li class="stat stat-terlambat" :class="{ 'stat-late': store.counts.terlambat > 0 }">
          <span class="num">{{ store.counts.terlambat }}</span>
          <span class="lbl">Terlambat</span>
        </li>
        <li class="stat stat-selesai">
          <span class="num">{{ store.counts.selesai }}</span>
          <span class="lbl">Selesai</span>
        </li>
      </ul>
    </header>

    <!-- DIUBAH: dua kolom di layar lebar (form di kiri, daftar di kanan) -->
    <div class="layout">
      <aside ref="formWrap" class="col-form">
        <TaskForm :task="editingTask" @save="save" @cancel="editingId = null" />
      </aside>

      <section class="col-list">
        <TaskFilter
          v-model:course="store.filterCourse"
          v-model:status="store.filterStatus"
          :courses="store.courses"
        />
        <TaskList
          :tasks="store.visibleTasks"
          :now="store.now"
          @toggle="store.toggleDone"
          @edit="startEdit"
          @remove="remove"
        />
      </section>
    </div>
  </main>
</template>

<style>
/* Merah hanya berarti: terlambat, error, atau hapus. */
:root {
  --bg: #f7f6f2;
  --card: #ffffff;
  --ink: #1d2433;
  --muted: #5d6677;
  --line: #dcdad2;
  --control: #8a8f99;
  --accent: #2b4c8c;
  --accent-bg: #e8edf7;
  --todo-bg: #f4f7fd;      /* belum selesai: biru */
  --todo-line: #c3d0ea;
  --late: #b3261e;
  --late-bg: #fdf1ef;
  --late-line: #e3b5b0;
  --done: #256b42;
  --done-bg: #f1f1ec;
  --done-badge: #e3f1e8;
  --done-card: #eff8f2;    /* selesai: hijau */
  --done-line: #b9dcc6;
  --done-edge: #2e7d4f;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 106.25%; /* DIUBAH: dasar 17px, tetap menghormati pengaturan font pengguna */
  color: var(--ink);
  background: var(--bg);
}
* { box-sizing: border-box; }
body { margin: 0; line-height: 1.45; }

/* DIUBAH: halaman lebih lebar agar ruang layar terpakai */
.page { max-width: 1120px; margin: 0 auto; padding: 32px 24px 72px; }
h1 { margin: 0 0 16px; font-size: 2rem; line-height: 1.2; }
h2 { margin: 0 0 16px; font-size: 1.25rem; }

/* Kartu ringkasan */
.stats { list-style: none; margin: 0 0 28px; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; display: grid; gap: 2px; }
.stat .num { font-size: 2rem; font-weight: 700; line-height: 1.1; }
.stat .lbl { color: var(--muted); font-size: 0.95rem; }
.stat-belum { background: var(--todo-bg); border-color: var(--todo-line); }
.stat-belum .num { color: var(--accent); }
.stat-selesai { background: var(--done-card); border-color: var(--done-line); }
.stat-selesai .num { color: var(--done); }
.stat-terlambat .num { color: var(--late); }       /* angka Terlambat selalu merah */
.stat-late { background: var(--late-bg); border-color: var(--late-line); } /* tinted bila ada yang terlambat */

/* Tata letak dua kolom */
.layout { display: grid; grid-template-columns: minmax(340px, 400px) 1fr; gap: 28px; align-items: start; }
.col-list { display: grid; gap: 16px; min-width: 0; }

/* Form tetap terlihat saat daftar digulir, hanya bila layar cukup tinggi */
@media (min-width: 960px) and (min-height: 760px) {
  .col-form { position: sticky; top: 24px; }
}

.form, .filters, .item { background: var(--card); border: 1px solid var(--line); border-radius: 10px; }
.form { padding: 22px; display: grid; gap: 16px; }
.filters { padding: 16px 20px; display: flex; gap: 16px; flex-wrap: wrap; }
label { display: grid; gap: 6px; font-size: 1rem; font-weight: 500; flex: 1; min-width: 200px; align-content: start; }
.row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }

input[type='text'], input[type='datetime-local'], select, textarea {
  font: inherit;
  font-size: 1rem;
  font-weight: 400;
  min-height: 46px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--control);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
}
textarea { min-height: 0; resize: vertical; }
.form [aria-invalid='true'] { border-color: var(--late); }
.err { color: var(--late); font-size: 0.9rem; font-weight: 400; }

button {
  font: inherit;
  font-size: 1rem;
  min-height: 42px;
  padding: 8px 18px;
  border: 1px solid var(--control);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
button:hover { background: #f1f2f5; }
button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
button.primary:hover { background: #233f75; }
button.danger { color: var(--late); border-color: var(--late-line); }
button.danger:hover { background: var(--late-bg); }
button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 2px;
}
.actions { display: flex; gap: 10px; }

/* Daftar tugas: kartu lebih besar dan lega */
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.item { display: flex; gap: 16px; padding: 18px 20px; border-left-width: 6px; }
.item input[type='checkbox'] { width: 26px; height: 26px; flex: none; margin: 2px 0 0; accent-color: var(--accent); }
.body { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.title { margin: 0; font-size: 1.15rem; font-weight: 600; }
.meta, .note { margin: 6px 0 0; font-size: 0.95rem; color: var(--muted); }

.chip {
  display: inline-block; margin-right: 8px; padding: 2px 10px;
  border: 1px solid var(--control); border-radius: 999px;
  font-size: 0.82rem; font-weight: 600; color: var(--muted); background: transparent;
}
.chip-sedang { background: #eceae2; color: var(--ink); }
.chip-tinggi { background: var(--ink); border-color: var(--ink); color: #fff; }

.side { display: grid; gap: 10px; justify-items: end; align-content: start; }
.badge {
  padding: 3px 12px; border-radius: 999px; white-space: nowrap;
  font-size: 0.9rem; font-weight: 600;
}
.remain { font-size: 0.9rem; color: var(--muted); }

/* Tiga status, tiga warna: belum selesai (biru), terlambat (merah), selesai (hijau). */
.item.belum { background: var(--todo-bg); border-color: var(--todo-line); border-left-color: var(--accent); }
.item.belum .badge { background: var(--accent); color: #fff; }

.item.terlambat { background: var(--late-bg); border-color: var(--late-line); border-left-color: var(--late); }
.item.terlambat .badge { background: var(--late); color: #fff; }
.item.terlambat .remain { color: var(--late); font-weight: 600; }

.item.selesai { background: var(--done-card); border-color: var(--done-line); border-left-color: var(--done-edge); }
.item.selesai .title { text-decoration: line-through; color: var(--muted); }
.item.selesai .badge { background: var(--done); color: #fff; }

.empty { color: var(--muted); text-align: center; padding: 40px 0; font-size: 1.05rem; }

/* Tablet dan ponsel: satu kolom */
@media (max-width: 959px) {
  .layout { grid-template-columns: 1fr; }
}

/* Layar sentuh dan ponsel: area tekan minimal 44px */
@media (pointer: coarse), (max-width: 520px) {
  button { min-height: 44px; }
}
@media (max-width: 520px) {
  .page { padding: 20px 14px 56px; }
  h1 { font-size: 1.6rem; }
  .stats { gap: 10px; }
  .stat { padding: 12px 14px; }
  .stat .num { font-size: 1.6rem; }
  .form { padding: 18px; }
  .item { flex-wrap: wrap; padding: 16px; }
  .side { width: 100%; justify-items: stretch; }
  .badge, .remain { justify-self: start; }
  .side .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form .actions button { flex: 1; }
}
</style>