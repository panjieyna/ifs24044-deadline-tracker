<script setup>
import { reactive, ref, watch } from 'vue'
import { isoToLocalInput, localInputToISO } from '../utils/date'

// task = null -> mode tambah; task berisi objek -> mode edit.
const props = defineProps({ task: { type: Object, default: null } })
const emit = defineEmits(['save', 'cancel'])

const empty = () => ({ title: '', course: '', deadline: '', priority: 'sedang', note: '' })
const form = reactive(empty())
const errors = ref({})

// Isi form saat masuk mode edit, kosongkan saat kembali ke mode tambah.
watch(
  () => props.task,
  (task) => {
    Object.assign(form, task ? { ...task, deadline: isoToLocalInput(task.deadline) } : empty())
    errors.value = {}
  },
  { immediate: true },
)

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = 'Judul tugas wajib diisi.'
  if (!form.course.trim()) e.course = 'Mata kuliah wajib diisi.'
  if (!form.deadline) e.deadline = 'Tenggat wajib diisi.'
  errors.value = e
  return Object.keys(e).length === 0
}

function submit() {
  if (!validate()) return
  emit('save', {
    title: form.title.trim(),
    course: form.course.trim(),
    deadline: localInputToISO(form.deadline),
    priority: form.priority,
    note: form.note.trim(),
  })
  if (!props.task) Object.assign(form, empty()) // kosongkan setelah menambah
}
</script>

<template>
  <form class="form" novalidate @submit.prevent="submit">
    <h2>{{ task ? 'Edit tugas' : 'Tambah tugas' }}</h2>

    <label>
      Judul tugas
      <input v-model="form.title" type="text" placeholder="Tugas I proposal" />
      <small v-if="errors.title" class="err">{{ errors.title }}</small>
    </label>

    <label>
      Mata kuliah
      <input v-model="form.course" type="text" placeholder="Pengembangan Aplikasi Berbasis Web" />
      <small v-if="errors.course" class="err">{{ errors.course }}</small>
    </label>

    <div class="row">
      <label>
        Tenggat
        <input v-model="form.deadline" type="datetime-local" />
        <small v-if="errors.deadline" class="err">{{ errors.deadline }}</small>
      </label>
      <label>
        Prioritas
        <select v-model="form.priority">
          <option value="rendah">Rendah</option>
          <option value="sedang">Sedang</option>
          <option value="tinggi">Tinggi</option>
        </select>
      </label>
    </div>

    <label>
      Catatan
      <textarea v-model="form.note" rows="2" placeholder="Opsional"></textarea>
    </label>

    <div class="actions">
      <button type="submit" class="primary">{{ task ? 'Simpan perubahan' : 'Tambah tugas' }}</button>
      <button v-if="task" type="button" @click="emit('cancel')">Batal</button>
    </div>
  </form>
</template>