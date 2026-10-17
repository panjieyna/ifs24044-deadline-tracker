<script setup>
import { computed } from 'vue'
import { formatDeadline, formatRemaining } from '../utils/date'

// task sudah membawa properti status dari store.
const props = defineProps({
  task: { type: Object, required: true },
  now: { type: Number, required: true },
})
const emit = defineEmits(['toggle', 'edit', 'remove'])

const remaining = computed(() =>
  props.task.done
    ? 'Selesai'
    : formatRemaining(new Date(props.task.deadline).getTime() - props.now),
)
</script>

<template>
  <li class="item" :class="[task.status, 'prio-' + task.priority]">
    <input
      type="checkbox"
      :checked="task.done"
      :aria-label="`Tandai ${task.title} selesai`"
      @change="emit('toggle', task.id)"
    />
    <div class="body">
      <p class="title">{{ task.title }}</p>
      <p class="meta">{{ task.course }} · prioritas {{ task.priority }}</p>
      <p class="meta">{{ formatDeadline(task.deadline) }}</p>
      <p v-if="task.note" class="note">{{ task.note }}</p>
    </div>
    <div class="side">
      <span class="badge">{{ remaining }}</span>
      <div class="actions">
        <button type="button" @click="emit('edit', task.id)">Edit</button>
        <button type="button" @click="emit('remove', task.id)">Hapus</button>
      </div>
    </div>
  </li>
</template>