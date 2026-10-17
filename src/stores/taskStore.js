import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { isValidDate } from '../utils/date'

const STORAGE_KEY = 'tenggat-tugas:v1'
const PRIORITIES = ['rendah', 'sedang', 'tinggi']

// Data dari localStorage tidak boleh dipercaya begitu saja: cek bentuknya.
function isValidTask(t) {
  return (
    t &&
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.course === 'string' &&
    PRIORITIES.includes(t.priority) &&
    isValidDate(t.deadline)
  )
}

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(data) ? data.filter(isValidTask) : []
  } catch {
    return [] // JSON rusak atau localStorage diblokir
  }
}

// Fallback jika crypto.randomUUID tidak tersedia (mis. halaman bukan HTTPS).
function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref(loadTasks())
  const now = ref(Date.now()) // dipakai untuk status dan hitung mundur
  const filterCourse = ref('')
  const filterStatus = ref('semua')

  // Simpan otomatis setiap ada perubahan.
  watch(
    tasks,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* penyimpanan penuh atau diblokir: aplikasi tetap jalan di memori */
      }
    },
    { deep: true },
  )

  // Status dihitung dari tenggat dan waktu sekarang, tidak disimpan.
  function statusOf(task) {
    if (task.done) return 'selesai'
    return new Date(task.deadline).getTime() < now.value ? 'terlambat' : 'belum'
  }

  const courses = computed(() =>
    [...new Set(tasks.value.map((t) => t.course))].sort((a, b) => a.localeCompare(b)),
  )

  // Jika mata kuliah yang sedang difilter sudah tidak ada, reset filter.
  watch(courses, (list) => {
    if (filterCourse.value && !list.includes(filterCourse.value)) filterCourse.value = ''
  })

  const visibleTasks = computed(() =>
    tasks.value
      .map((t) => ({ ...t, status: statusOf(t) }))
      .filter((t) => !filterCourse.value || t.course === filterCourse.value)
      .filter((t) => filterStatus.value === 'semua' || t.status === filterStatus.value)
      .sort((a, b) => {
        // Tugas selesai di bawah; sisanya urut dari tenggat terdekat.
        if (a.done !== b.done) return a.done ? 1 : -1
        return new Date(a.deadline) - new Date(b.deadline)
      }),
  )

  const counts = computed(() => {
    const result = { belum: 0, terlambat: 0, selesai: 0 }
    for (const t of tasks.value) result[statusOf(t)]++
    return result
  })

  function tick() {
    now.value = Date.now()
  }

  function addTask(data) {
    tasks.value.push({ id: newId(), done: false, ...data })
  }

  function updateTask(id, data) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) Object.assign(task, data)
  }

  function toggleDone(id) {
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.done = !task.done
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  return {
    tasks, now, filterCourse, filterStatus,
    courses, visibleTasks, counts,
    tick, addTask, updateTask, toggleDone, removeTask,
  }
})