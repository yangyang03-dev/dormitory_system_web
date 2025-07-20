<template>
  <div>
    <canvas ref="canvas" />
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({ data: Object })
const canvas = ref(null)
let chart

onMounted(() => {
  chart = new Chart(canvas.value, {
    type: 'pie',
    data: props.data
  })
})

watch(() => props.data, (newData) => {
  chart.data = newData
  chart.update()
})
</script>