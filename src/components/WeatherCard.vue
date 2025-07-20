<template>
  <q-card class="q-pa-md" style="width: 600px; min-height: 180px">
    <div class="text-h6 q-mb-sm">Today's Weather</div>

    <div v-if="weatherData">
      <!-- Condition and Icon -->
      <div class="row items-center q-mb-md">
        <q-icon :name="iconName" size="40px" class="q-mr-sm" />
        <div class="text-subtitle1">{{ weatherData.condition }}</div>
      </div>

      <!-- Temperature with colored indicator -->
      <div class="q-mb-sm">
        <div class="text-subtitle2">Temperature: {{ weatherData.temp }}°C</div>
        <q-linear-progress :value="tempValue" :color="tempColor" size="15px" rounded />
      </div>

      <div class="text-caption text-grey">
        Last updated: {{ weatherData.timestamp }}
      </div>
    </div>

    <div v-else>
      <q-spinner-dots color="primary" size="40px" />
      <div class="text-caption q-mt-sm">Fetching weather...</div>
    </div>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { QSpinnerDots, QLinearProgress, QIcon } from 'quasar'

const weatherData = ref(null)

// Mappings for visualization
const tempColorMap = [
  { max: 5, color: 'blue-5', label: 'Cold' },
  { max: 15, color: 'teal', label: 'Cool' },
  { max: 25, color: 'orange', label: 'Warm' },
  { max: 40, color: 'red', label: 'Hot' }
]

const iconMap = {
  Clear: 'wb_sunny',
  Clouds: 'cloud',
  Rain: 'rainy',
  Drizzle: 'grain',
  Thunderstorm: 'flash_on',
  Snow: 'ac_unit',
  Mist: 'blur_on',
  Smoke: 'smoke_free',
  Haze: 'filter_drama',
  Dust: 'waves',
  Fog: 'blur_on',
  Sand: 'waves',
  Ash: 'whatshot',
  Squall: 'air',
  Tornado: 'rotate_right'
}

const tempValue = ref(0)
const tempColor = ref('primary')
const iconName = ref('cloud')

const getVisuals = (temp, condition) => {
  for (const range of tempColorMap) {
    if (temp <= range.max) {
      tempColor.value = range.color
      break
    }
  }
  tempValue.value = Math.min(temp / 40, 1)
  iconName.value = iconMap[condition] || 'wb_cloudy'
}

onMounted(async () => {
  const cached = localStorage.getItem('cachedWeather')
  const today = new Date().toDateString()

  if (cached) {
    const parsed = JSON.parse(cached)
    if (parsed.date === today) {
      weatherData.value = parsed
      getVisuals(parsed.temp, parsed.condition)
      return
    }
  }

  try {
    const apiKey = 'ec55186cae458fca6ec4b3bf51f58eec'  // <-- replace with real API key
    const lat=35.71
    const lon=139.76
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    const json = await res.json()
    const KelvinToCelsius = (f) => Math.round(f-273.15)
    const tempK = json.main.temp
    const tempC = KelvinToCelsius(tempK)
    const data = {
      temp: tempC,
      condition: json.weather[0].main,
      timestamp: new Date().toLocaleTimeString(),
      date: today
    }

    localStorage.setItem('cachedWeather', JSON.stringify(data))
    weatherData.value = data
    getVisuals(data.temp, data.condition)
  } catch (err) {
    console.error('Failed to fetch weather:', err)
  }
})
</script>