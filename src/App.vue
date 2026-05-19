<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="bg-dark py-3 shadow-sm mb-4 sticky-top" style="z-index: 1050">
    <div class="container d-flex justify-content-between align-items-center">
      <RouterLink to="/" class="text-decoration-none">
        <h1 class="h4 text-white m-0 d-flex align-items-center">
          <i class="fa-solid fa-cloud-sun text-warning me-2 fs-3"></i>
          Clima<span class="text-primary">CL</span>
        </h1>
      </RouterLink>
      <nav>
        <RouterLink to="/" class="btn btn-outline-light btn-sm">Inicio</RouterLink>
      </nav>
    </div>
  </header>

  <main class="container mb-5">
    <RouterView />
  </main>

  <footer class="bg-dark text-white text-center py-4 mt-auto">
    <div class="container">
      <p class="mb-0">© 2026 ClimaCL - Desarrollado por Raúl Leiva Lobos</p>
    </div>
  </footer>
</template>

<style>
/* CSS Global */
body {
  background-color: #0f172a; /* Azul nocturno profundo de tu diseño */
  color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
