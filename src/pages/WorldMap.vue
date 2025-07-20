<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { use } from 'echarts/core'

// Register required components for tree-shaking
use([
  CanvasRenderer,
  MapChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
])

// Import your GeoJSON map (from local assets folder)
import worldJson from '../assets/maps/world.json'
// Register the map under a name, e.g. 'world'
echarts.registerMap('world', worldJson)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const codeToCountryName = (code) => {
  const countryMap = {
    CN: 'China',
    US: 'United States',
    JP: 'Japan',
    KR: 'South Korea',
    FR: 'France',
    DE: 'Germany',
    IN: 'India',
    VN: 'Vietnam'
  }
  return countryMap[code] || code
}

const renderChart = () => {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const maxVal = Math.max(...Object.values(props.data), 1)

  chartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} students'
    },
    visualMap: {
      min: 0,
      max: maxVal,
      text: ['More', 'Less'],
      calculable: true,
      inRange: {
        color: ['#e0f3f8', '#4575b4']
      },
      left: 'left',
      bottom: '10%'
    },
    series: [{
      name: 'Nationality',
      type: 'map',
      map: 'world',
      roam: true,
      emphasis: { label: { show: true } },
      data: Object.entries(props.data).map(([code, value]) => ({
        name: codeToCountryName(code),
        value
      }))
    }]
  })
}

watch(() => props.data, renderChart, { deep: true })

onMounted(renderChart)

onBeforeUnmount(() => {
  chartInstance && chartInstance.dispose()
})
</script>