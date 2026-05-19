# ClimaCL - Vue SPA 🌤️

Aplicación web de pronóstico del clima para diversas ciudades de Chile, construida como una Single Page Application (SPA). Este proyecto utiliza la API de Open-Meteo para obtener datos meteorológicos reales y los presenta en una interfaz moderna con temática nocturna.

**Enlace al repositorio:** [https://github.com/Raulleivalobos/weather-frontend-m6](https://github.com/Raulleivalobos/weather-frontend-m6)

## Características Principales

- **Vista Principal (Home):** Listado de tarjetas con el clima actual de ciudades seleccionadas.
- **Buscador Reactivo:** Filtrado en tiempo real de ciudades utilizando `v-model`.
- **Vista de Detalle:** Enrutamiento dinámico para ver estadísticas detalladas (Mín, Prom, Máx) y el pronóstico extendido de 7 días.
- **Avisos Meteorológicos:** Alertas dinámicas basadas en las temperaturas de la semana (alertas de calor, heladas o lluvia).
- **Diseño Responsivo:** Interfaz construida con Bootstrap 5 y paleta de colores personalizada de alto contraste.

## Tecnologías Utilizadas

- **Vue.js 3** (Composition API con `<script setup>`)
- **Vue Router** (Navegación SPA sin recarga de página)
- **Vite** (Herramienta de construcción ultrarrápida)
- **pnpm** (Gestor de paquetes)
- **Bootstrap 5** (Sistema de grillas y componentes CSS)
- **FontAwesome** (Iconografía)
- **Open-Meteo API** (Fuente de datos meteorológicos)

creado por Raul Leiva Lobos - 2026
