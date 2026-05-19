<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const datosClima = ref([])
const cargando = ref(true)
const mensajeError = ref('')
const busqueda = ref('')

const ciudadesBase = [
  {
    id: 1,
    nombre: 'Santiago',
    lat: -33.46,
    lon: -70.65,
    imagen: 'https://picsum.photos/seed/santiago/400/250',
  },
  {
    id: 2,
    nombre: 'Puente Alto',
    lat: -33.61,
    lon: -70.58,
    imagen: 'https://picsum.photos/seed/puentealto/400/250',
  },
  {
    id: 3,
    nombre: 'Valparaíso',
    lat: -33.04,
    lon: -71.63,
    imagen: 'https://picsum.photos/seed/valparaiso/400/250',
  },
  {
    id: 4,
    nombre: 'La Serena',
    lat: -29.91,
    lon: -71.25,
    imagen: 'https://picsum.photos/seed/laserena/400/250',
  },
  {
    id: 5,
    nombre: 'Temuco',
    lat: -38.74,
    lon: -72.6,
    imagen: 'https://picsum.photos/seed/temuco/400/250',
  },
]

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

const cargarClima = async () => {
  try {
    cargando.value = true
    mensajeError.value = ''

    const promesas = ciudadesBase.map(async (ciudad) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${ciudad.lat}&longitude=${ciudad.lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSantiago`
      const respuesta = await fetch(url)
      if (!respuesta.ok) throw new Error('Error HTTP ' + respuesta.status)
      const datosApi = await respuesta.json()
      const climaActual = traducirClima(datosApi.current_weather.weathercode)

      return {
        id: ciudad.id,
        nombre: ciudad.nombre,
        tempActual: Math.round(datosApi.current_weather.temperature),
        estadoActual: climaActual.estado,
        iconoActual: climaActual.icono,
        imagen: ciudad.imagen,
      }
    })

    datosClima.value = await Promise.all(promesas)
  } catch (error) {
    mensajeError.value = 'No se pudo conectar con los satélites meteorológicos.'
  } finally {
    cargando.value = false
  }
}

const ciudadesFiltradas = computed(() => {
  if (busqueda.value === '') {
    return datosClima.value
  }
  return datosClima.value.filter((lugar) =>
    lugar.nombre.toLowerCase().includes(busqueda.value.toLowerCase()),
  )
})

onMounted(() => {
  // Eliminamos el código del carrusel, ahora solo carga el clima
  cargarClima()
})

const verDetalle = (id) => {
  router.push(`/detalle/${id}`)
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

    <div class="row justify-content-center mb-5" v-if="!cargando && !mensajeError">
      <div class="col-md-6">
        <div class="input-group shadow-sm">
          <span class="input-group-text custom-input-bg custom-border text-custom-muted">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            type="text"
            class="form-control custom-input-bg custom-border text-white"
            placeholder="Buscar ciudad..."
            v-model="busqueda"
          />
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-5">
      <div
        class="spinner-border text-primary mb-3"
        role="status"
        style="width: 3rem; height: 3rem"
      ></div>
      <h3 class="text-white">Conectando con Open-Meteo API...</h3>
    </div>

    <div v-else-if="mensajeError" class="text-center py-5">
      <i class="fa-solid fa-triangle-exclamation text-danger display-1 mb-3"></i>
      <h3 class="text-white mb-2">Error de Conexión</h3>
      <p class="text-muted">{{ mensajeError }}</p>
      <button @click="cargarClima" class="btn btn-outline-primary mt-3">Reintentar</button>
    </div>

    <div v-else class="row g-4 mb-5">
      <div v-if="ciudadesFiltradas.length === 0" class="col-12 text-center text-custom-muted py-4">
        <i class="fa-solid fa-cloud-sun-rain fs-1 mb-2"></i>
        <p>No se encontraron ciudades con ese nombre.</p>
      </div>

      <div v-for="lugar in ciudadesFiltradas" :key="lugar.id" class="col-md-6 col-lg-4">
        <article class="card custom-card h-100 shadow-lg" @click="verDetalle(lugar.id)">
          <img :src="lugar.imagen" :alt="lugar.nombre" class="card-img-top custom-card-img" />
          <div class="card-body text-center p-4">
            <i :class="`fa-solid ${lugar.iconoActual} display-4 mb-3 text-warning`"></i>
            <h2 class="h3 fw-bold text-white mb-2">{{ lugar.nombre }}</h2>
            <p class="display-6 fw-bold text-primary mb-2">{{ lugar.tempActual }}°C</p>
            <p class="text-custom-muted fs-5 mb-0">{{ lugar.estadoActual }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-custom-muted {
  color: #9ca3af !important;
}
.custom-border {
  border-color: #2d3748 !important;
}

.custom-card {
  background-color: #1b222d;
  border: 1px solid #2d3748;
  border-radius: 12px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4) !important;
}

.custom-card-img {
  height: 220px;
  object-fit: cover;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.custom-input-bg {
  background-color: #151b24 !important;
}

.form-control:focus {
  background-color: #1b222d !important;
  color: white;
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
