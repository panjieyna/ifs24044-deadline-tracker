<script setup>
// defineModel membuat prop + emit untuk v-model secara otomatis (Vue 3.4+).
defineProps({ courses: { type: Array, default: () => [] } })
const course = defineModel('course', { default: '' })
const status = defineModel('status', { default: 'semua' })
</script>

<template>
  <section class="filters">
    <label>
      Mata kuliah
      <select v-model="course">
        <option value="">Semua</option>
        <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>
    <label>
      Status
      <select v-model="status">
        <option value="semua">Semua</option>
        <option value="belum">Belum selesai</option>
        <option value="terlambat">Terlambat</option>
        <option value="selesai">Selesai</option>
      </select>
    </label>
  </section>
</template>