<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 1. HERRAMIENTAS DE VUE ROUTER
const route = useRoute()
const router = useRouter()

// 2. ESTADO REACTIVO
const ciudadId = parseInt(route.params.id)
const cargando = ref(true)
const mensajeError = ref('')
const lugar = ref(null)
const stats = ref(null)

// 3. DATOS BASE
const ciudadesBase = [
  { id: 1, nombre: 'Santiago', lat: -33.46, lon: -70.65 },
  { id: 2, nombre: 'Puente Alto', lat: -33.61, lon: -70.58 },
  { id: 3, nombre: 'Valparaíso', lat: -33.04, lon: -71.63 },
  { id: 4, nombre: 'La Serena', lat: -29.91, lon: -71.25 },
  { id: 5, nombre: 'Temuco', lat: -38.74, lon: -72.6 },
]

const ciudadBase = ciudadesBase.find((c) => c.id === ciudadId)

// 4. FUNCIONES DE LÓGICA
const traducirClima = (codigoWMO) => {
  if (codigoWMO === 0) return { estado: 'Despejado', icono: 'fa-sun text-warning' }
  if (codigoWMO <= 3) return { estado: 'Nublado', icono: 'fa-cloud text-secondary' }
  if (codigoWMO <= 48) return { estado: 'Neblina', icono: 'fa-smog text-muted' }
  if (codigoWMO <= 67 || (codigoWMO >= 80 && codigoWMO <= 82))
    return { estado: 'Lluvia', icono: 'fa-cloud-showers-heavy text-primary' }
  if (codigoWMO <= 77 || codigoWMO === 85 || codigoWMO === 86)
    return { estado: 'Nieve', icono: 'fa-snowflake text-info' }
  if (codigoWMO >= 95) return { estado: 'Tormenta', icono: 'fa-cloud-bolt text-danger' }
  return { estado: 'Desconocido', icono: 'fa-cloud text-secondary' }
}

const calcularEstadisticas = (pronostico) => {
  const todasLasTemps = pronostico.flatMap((dia) => [dia.min, dia.max])
  const minSemana = Math.min(...todasLasTemps)
  const maxSemana = Math.max(...todasLasTemps)
  const sumaTemps = todasLasTemps.reduce((acc, temp) => acc + temp, 0)
  const promSemana = (sumaTemps / todasLasTemps.length).toFixed(1)

  const conteoClima = pronostico.reduce((acc, dia) => {
    acc[dia.estado] = (acc[dia.estado] || 0) + 1
    return acc
  }, {})

  let alerta = null
  if (maxSemana >= 30) {
    alerta = {
      clase: 'alert-danger',
      icono: 'fa-fire',
      texto: '¡Alerta de calor extremo! Máximas superarán los 30°C.',
    }
  } else if (minSemana <= 5) {
    alerta = {
      clase: 'alert-info',
      icono: 'fa-snowflake',
      texto: '¡Alerta de heladas! Se esperan bajas temperaturas.',
    }
  } else if (conteoClima['Lluvia']) {
    alerta = {
      clase: 'alert-primary',
      icono: 'fa-umbrella',
      texto: 'Pronóstico de lluvia durante la semana. Prepara tu paraguas.',
    }
  } else {
    alerta = {
      clase: 'alert-success',
      icono: 'fa-leaf',
      texto: 'Condiciones estables. Excelente clima para actividades al aire libre.',
    }
  }

  const resumen = `La semana presentará temperaturas entre ${minSemana}°C y ${maxSemana}°C, con un promedio general de ${promSemana}°C.`

  return { minSemana, maxSemana, promSemana, conteoClima, alerta, resumen }
}

// 5. FETCH DE LA API
const cargarDetalle = async () => {
  if (!ciudadBase) {
    mensajeError.value = 'Ciudad no encontrada.'
    cargando.value = false
    return
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ciudadBase.lat}&longitude=${ciudadBase.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSantiago`
    const respuesta = await fetch(url)
    if (!respuesta.ok) throw new Error('Error HTTP')
    const datosApi = await respuesta.json()

    const climaActual = traducirClima(datosApi.current_weather.weathercode)
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    const pronosticoSemanal = datosApi.daily.time.slice(0, 7).map((fechaStr, index) => {
      const fecha = new Date(fechaStr + 'T12:00:00')
      const climaDia = traducirClima(datosApi.daily.weathercode[index])
      return {
        dia: diasSemana[fecha.getDay()],
        min: Math.round(datosApi.daily.temperature_2m_min[index]),
        max: Math.round(datosApi.daily.temperature_2m_max[index]),
        estado: climaDia.estado,
        icono: climaDia.icono,
      }
    })

    lugar.value = {
      nombre: ciudadBase.nombre,
      tempActual: Math.round(datosApi.current_weather.temperature),
      estadoActual: climaActual.estado,
      iconoActual: climaActual.icono,
      pronosticoSemanal: pronosticoSemanal,
    }

    stats.value = calcularEstadisticas(pronosticoSemanal)
  } catch (error) {
    mensajeError.value = 'Error al cargar los detalles del clima.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDetalle()
})

const volver = () => {
  router.push('/')
}
</script>

<template>
  <div>
    <div class="text-center mb-5 mt-4">
      <h1 class="text-primary fw-bold mb-3" style="font-size: 2.5rem">Pronóstico del Clima Hoy</h1>
      <p class="text-custom-muted fs-5">
        Consulta el clima actual y el pronóstico semanal de tus localidades favoritas.
      </p>
    </div>

    <button @click="volver" class="btn btn-outline-primary mb-4" style="border-radius: 6px">
      <i class="fa-solid fa-arrow-left me-2"></i>Volver al listado
    </button>

    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-white mt-3">Cargando pronóstico extendido...</p>
    </div>

    <div v-else-if="mensajeError" class="alert alert-danger text-center">
      {{ mensajeError }}
    </div>

    <div v-else-if="lugar && stats" class="detail-card shadow-lg mb-5">
      <div class="card-body p-4 p-md-5">
        <div
          :class="`alert custom-alert-${stats.alerta.clase.split('-')[1]} d-flex align-items-center mb-5 border-0 shadow-sm`"
          role="alert"
        >
          <i :class="`fa-solid ${stats.alerta.icono} fs-4 me-3`"></i>
          <div><strong>Aviso Meteorológico:</strong> {{ stats.alerta.texto }}</div>
        </div>

        <div class="row mb-5 align-items-center">
          <div class="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
            <h2 class="display-4 text-white fw-bold mb-2">{{ lugar.nombre }}</h2>
            <p
              class="fs-4 text-custom-muted mb-0 d-flex align-items-center justify-content-center justify-content-lg-start"
            >
              <i :class="`fa-solid ${lugar.iconoActual} me-2 text-warning`"></i>
              {{ lugar.estadoActual }} actual
            </p>
          </div>

          <div class="col-lg-7">
            <div class="row g-3 text-center">
              <div class="col-4">
                <div class="stat-box">
                  <h3 class="stat-label mb-2">Mín.</h3>
                  <p class="stat-value text-info mb-0">{{ stats.minSemana }}°C</p>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-box">
                  <h3 class="stat-label mb-2">Prom.</h3>
                  <p class="stat-value text-success mb-0">{{ stats.promSemana }}°C</p>
                </div>
              </div>
              <div class="col-4">
                <div class="stat-box">
                  <h3 class="stat-label mb-2">Máx.</h3>
                  <p class="stat-value text-warning mb-0">{{ stats.maxSemana }}°C</p>
                </div>
              </div>

              <div class="col-12">
                <div class="stat-box text-start">
                  <h3 class="stat-label mb-3">
                    <i class="fa-solid fa-chart-pie me-2"></i>Días por clima
                  </h3>
                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-for="(cantidad, estado) in stats.conteoClima"
                      :key="estado"
                      class="custom-badge"
                    >
                      {{ cantidad }} día(s) {{ estado }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="stat-box text-start">
                  <h3 class="stat-label mb-2">
                    <i class="fa-solid fa-chart-line me-2"></i>Resumen estadístico
                  </h3>
                  <p class="text-white mb-0" style="font-size: 1.05rem; line-height: 1.5">
                    {{ stats.resumen }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 class="h4 text-white mb-4 border-bottom custom-border pb-2">Pronóstico Extendido</h3>
        <div class="rounded-3 overflow-hidden custom-border stat-box-bg">
          <div
            v-for="(dia, index) in lugar.pronosticoSemanal"
            :key="index"
            class="d-flex justify-content-between align-items-center p-3 border-bottom custom-border"
          >
            <span :class="`fw-bold w-25 ${index === 0 ? 'text-primary' : 'text-white'}`">
              {{ index === 0 ? 'Hoy' : dia.dia }}
            </span>
            <span class="text-custom-muted w-50 text-center">{{ dia.estado }}</span>
            <span class="w-25 text-end d-flex align-items-center justify-content-end">
              <i :class="`fa-solid ${dia.icono} me-3 fs-5`"></i>

              <span class="text-info me-2 fs-5">{{ dia.min }}°</span>
              <span class="text-warning fw-bold fs-5">{{ dia.max }}°</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CONTENEDORES Y CRISTALES */
.detail-card {
  background-color: #1b222d; /* Tono azul marino exacto */
  border: 1px solid #2d3748;
  border-radius: 12px;
}

.stat-box {
  background-color: #151b24; /* Color interno hundido */
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1.25rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-box-bg {
  background-color: #151b24;
}

.custom-border {
  border-color: #374151 !important;
}

/* LABELS Y VALORES */
.stat-label {
  color: #9ca3af; /* Gris claro de alta legibilidad */
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 600;
}

.text-custom-muted {
  color: #9ca3af !important;
}

/* BADGES (Etiquetas de conteo) */
.custom-badge {
  background-color: #1f2937;
  border: 1px solid #374151;
  color: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* ALERTAS PERSONALIZADAS DE ALTO CONTRASTE */
.custom-alert-info {
  background-color: #cffafe;
  color: #083344;
}
.custom-alert-danger {
  background-color: #fee2e2;
  color: #7f1d1d;
}
.custom-alert-primary {
  background-color: #dbeafe;
  color: #1e3a8a;
}
.custom-alert-success {
  background-color: #d1fae5;
  color: #064e3b;
}
</style>
