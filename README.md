# Frontend: Sistema de Impresión Logística de Etiquetas ZPL

Esta aplicación es el frontend interactivo para gestionar la impresión de etiquetas, previsualizar los códigos de barra y monitorear las métricas de operación en tiempo real.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está estructurado siguiendo los principios de **Atomic Design (Diseño Atómico)** y **Clean Architecture** a nivel de UI:

- **Atoms (`src/components/atoms/`):** Componentes básicos e indivisibles de la interfaz (ej: `Button`, `Input`, `Select`, `Badge`). Son totalmente puros y reutilizables.
- **Molecules (`src/components/molecules/`):** Combinaciones de átomos para formar pequeños grupos funcionales (ej: `FormField` combinando un label con un Input, `TabButton`).
- **Organisms (`src/components/organisms/`):** Componentes de negocio complejos autocontenidos (ej: `PrintForm` para el ingreso de solicitudes, `PrintHistory` para el historial y `MetricsDashboard` para las estadísticas).
- **Service Layer (`src/services/`):** Centraliza la comunicación HTTP (`fetch`) con el API del backend, aislando la lógica de red de los componentes visuales.

---

## 🎨 Decisiones de Diseño y Experiencia de Usuario (UX)

1. **Diseño Premium y Responsivo:** Construido con **Tailwind CSS v4** y un estilo moderno, limpio, con bordes redondeados orgánicos, micro-animaciones en los botones y estados visuales claros (éxito/rechazo). Se adapta perfectamente a teléfonos móviles (layout tipo tarjetas) y monitores de escritorio (tablas compactas).
2. **Visualización y Renderizado Local de ZPL:** Se implementó la librería `zpl-renderer-js` para procesar el código ZPL localmente en WebAssembly, evitando peticiones a APIs externas.
3. **Módulo de Impresión Integrado (Modal Interno + Iframe):** Al confirmarse una impresión, se despliega un modal web. Si el usuario decide imprimir, el frontend carga la imagen de la etiqueta en un `iframe` oculto en segundo plano y dispara el diálogo nativo de impresión para evitar bloqueadores de popups y asegurar que se imprima **únicamente la etiqueta** de forma limpia.
4. **Carga Dinámica de Productos:** Al ingresar un LPN en el formulario, se ejecuta una consulta optimizada (debouncificada a 400ms) a la API `/api/print/lpn/:lpn/products` para mostrar en pantalla los productos de la orden antes de procesar el botón de impresión.
5. **Historial Optimizado con Filtros y Paginación:** El historial cuenta con paginación local (5 elementos por página) y controles de navegación responsivos, junto a un selector para filtrar solicitudes por tipo (*Todos / Impresión / Reimpresión*).
6. **Validación Robusta de Formularios:** Se integró **React Hook Form** junto a **Zod** para la definición del esquema de validación y la visualización de mensajes de error de forma dinámica y reactiva en pantalla, asegurando el cumplimiento de la estructura mínima (LPN y Usuario de al menos 3 caracteres, y selección de zona válida) antes de enviar las solicitudes.

---

## 📋 Supuestos del Sistema

- **Puerto Backend:** Se asume que el backend corre por defecto en `http://localhost:3000` (o `3001` en Docker) y es proxificado mediante el servidor de desarrollo Vite (`/api`).
- **Navegadores:** Se asume el uso de navegadores modernos con soporte de WebAssembly para el renderizador ZPL local.

---

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 20 o superior).
- Gestor de paquetes `npm`.

### Paso 1: Instalar dependencias
Desde la carpeta raíz del frontend, ejecuta:
```bash
npm install
```

### Paso 2: Configuración de Variables de Entorno (Opcional)
Por defecto, la API utiliza la ruta relativa `/api` que es redirigida mediante la configuración de proxy de Vite (`vite.config.ts`) al puerto local de NestJS.

---

## 🚀 Ejecución del Proyecto

### 1. Entorno de Desarrollo (Vite Dev Server)
Para iniciar la aplicación localmente en modo desarrollo con Hot Module Replacement (HMR):
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 2. Versión de Producción (Compilación estática)
Para compilar y minificar los archivos de producción:
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `/dist`.

---

## 🐳 Despliegue con Docker

### Opción A: Usando Docker Compose (Recomendado)
El proyecto incluye un `docker-compose.yml` que empaqueta y levanta la aplicación sobre un servidor Nginx en la red interna:

1. **Construir y encender el contenedor:**
   ```bash
   docker compose up -d --build
   ```
2. **Acceder a la aplicación:**
   Abre tu navegador en `http://localhost:8080`. Nginx servirá los archivos estáticos y gestionará el proxy inverso de `/api` directamente hacia el contenedor del backend.

### Opción B: Usando Docker CLI directamente

1. **Construir la imagen:**
   ```bash
   docker build -t test-hc-frontend .
   ```
2. **Correr el contenedor:**
   ```bash
   docker run -d -p 8080:80 --name test-hc-frontend-container test-hc-frontend
   ```
