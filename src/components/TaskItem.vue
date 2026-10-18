<script setup>
import { computed } from 'vue'
import { formatDeadline, formatRemaining } from '../utils/date'

// task sudah membawa properti status dari store (belum, terlambat, selesai).
const props = defineProps({
  task: { type: Object, required: true },
  now: { type: Number, required: true },
})
const emit = defineEmits(['toggle', 'edit', 'remove'])

const STATUS_LABEL = { belum: 'Belum selesai', terlambat: 'Terlambat', selesai: 'Selesai' }
const statusLabel = computed(() => STATUS_LABEL[props.task.status])

// DIUBAH: tugas dianggap mendesak jika belum selesai, belum lewat, dan sisa waktu <= 24 jam.
const URGENT_MS = 24 * 60 * 60 * 1000
const msLeft = computed(() => new Date(props.task.deadline).getTime() - props.now)
const urgent = computed(
  () => !props.task.done && msLeft.value >= 0 && msLeft.value <= URGENT_MS,
)

// Sisa waktu hanya untuk tugas belum selesai; awalan "Segera" agar tidak hanya mengandalkan warna.
const remaining = computed(() => {
  if (props.task.done) return ''
  return (urgent.value ? 'Segera · ' : '') + formatRemaining(msLeft.value)
})
</script>

<template>
  <li class="item" :class="[task.status, { urgent }]">
    <input
      type="checkbox"
      :checked="task.done"
      :aria-label="`Tandai ${task.title} selesai`"
      @change="emit('toggle', task.id)"
    />
    <div class="body">
      <p class="title">{{ task.title }}</p>
      <!-- DIUBAH: mata kuliah dan tenggat tampil lebih dulu; prioritas dipindah ke bawah -->
      <p class="course">{{ task.course }}</p>
      <p class="deadline">Tenggat: {{ formatDeadline(task.deadline) }}</p>
      <p v-if="task.note" class="note">{{ task.note }}</p>
      <p class="chip-row">
        <span class="chip" :class="'chip-' + task.priority">Prioritas {{ task.priority }}</span>
      </p>
    </div>
    <div class="side">
      <span class="badge">{{ statusLabel }}</span>
      <span v-if="remaining" class="remain" :class="{ 'remain-urgent': urgent }">{{ remaining }}</span>
      <div class="actions">
        <button type="button" @click="emit('edit', task.id)">Edit</button>
        <button type="button" class="danger" @click="emit('remove', task.id)">Hapus</button>
      </div>
    </div>
  </li>
</template>