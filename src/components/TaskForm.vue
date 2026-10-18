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
    <!-- DIUBAH: keterangan tanda wajib; tanda * disembunyikan dari pembaca layar, aria-required menggantikannya -->
    <p class="hint"><span class="req" aria-hidden="true">*</span> wajib diisi</p>

    <div class="row">
      <label>
        <span>Judul tugas <span class="req" aria-hidden="true">*</span></span>
        <input
          v-model="form.title"
          type="text"
          placeholder="Tugas I proposal"
          aria-required="true"
          :aria-invalid="errors.title ? 'true' : null"
          :aria-describedby="errors.title ? 'err-title' : null"
        />
        <small v-if="errors.title" id="err-title" class="err" role="alert">{{ errors.title }}</small>
      </label>

      <label>
        <span>Mata kuliah <span class="req" aria-hidden="true">*</span></span>
        <input
          v-model="form.course"
          type="text"
          placeholder="Pengembangan Aplikasi Berbasis Web"
          aria-required="true"
          :aria-invalid="errors.course ? 'true' : null"
          :aria-describedby="errors.course ? 'err-course' : null"
        />
        <small v-if="errors.course" id="err-course" class="err" role="alert">{{ errors.course }}</small>
      </label>
    </div>

    <div class="row">
      <label>
        <span>Tenggat <span class="req" aria-hidden="true">*</span></span>
        <input
          v-model="form.deadline"
          type="datetime-local"
          aria-required="true"
          :aria-invalid="errors.deadline ? 'true' : null"
          :aria-describedby="errors.deadline ? 'err-deadline' : null"
        />
        <small v-if="errors.deadline" id="err-deadline" class="err" role="alert">{{ errors.deadline }}</small>
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