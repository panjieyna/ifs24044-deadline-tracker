<script setup>
import TaskItem from './TaskItem.vue'

// Komponen presentasi: hanya menampilkan daftar dan meneruskan event ke App.
defineProps({
  tasks: { type: Array, required: true },
  now: { type: Number, required: true },
})
defineEmits(['toggle', 'edit', 'remove'])
</script>

<template>
  <ul v-if="tasks.length" class="list">
    <TaskItem
      v-for="t in tasks"
      :key="t.id"
      :task="t"
      :now="now"
      @toggle="$emit('toggle', $event)"
      @edit="$emit('edit', $event)"
      @remove="$emit('remove', $event)"
    />
  </ul>
  <p v-else class="empty">Tidak ada tugas yang cocok. Tambahkan tugas lewat form di atas.</p>
</template>