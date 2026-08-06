# Frontend: Sistema de Impresión Logística de Etiquetas ZPL

Esta aplicación es el frontend interactivo para gestionar la impresión de etiquetas, previsualizar los códigos de barra y monitorear las métricas de operación en tiempo real.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está estructurado siguiendo los principios de **Atomic Design (Diseño Atómico)** y **Clean Architecture** a nivel de UI:

- **Atoms (`src/components/atoms/`):** Componentes básicos e indivisibles de la interfaz (ej: `Button`, `Input`, `Select`, `Badge`). Son totalmente puros y reutilizables.
- **Molecules (`src/components/molecules/`):** Combinaciones de átomos para formar pequeños grupos funcionales (ej: `FormField` combinando un label con un Input, `TabButton`).
- **Organisms (`src/components/organisms/`):** Componentes de negocio complejos autocontenidos (ej: `PrintForm` para el ingreso de solicitudes, `PrintHistory` para el historial y `MetricsDashboard` para las estadísticas).
- **Service Layer (`src/services/`):** Centraliza la comunicación HTTP (`axios`) con el API del backend, aislando la lógica de red de los componentes visuales.

---

## 🎨 Decisiones de Diseño y Experiencia de Usuario (UX)

1. **Diseño Premium y Responsivo:** Construido con **Tailwind CSS v4** y un estilo moderno, limpio, con bordes redondeados orgánicos, micro-animaciones en los botones y estados visuales claros (éxito/rechazo). Se adapta perfectamente a teléfonos móviles (layout tipo tarjetas) y monitores de escritorio (tablas compactas).
2. **Cliente HTTP con Axios:** Se utiliza **Axios** para estructurar y consumir los servicios del backend, permitiendo configurar interceptores, manejar errores de forma centralizada y facilitar la tipación de las respuestas.
3. **Visualización y Renderizado Local de ZPL:** Se implementó la librería `zpl-renderer-js` para procesar el código ZPL localmente en WebAssembly, evitando peticiones a APIs externas.
4. **Módulo de Impresión Integrado (Modal Interno + Iframe):** Al confirmarse una impresión, se despliega un modal web. Si el usuario decide imprimir, el frontend carga la imagen de la etiqueta en un `iframe` oculto en segundo plano y dispara el diálogo nativo de impresión para evitar bloqueadores de popups y asegurar que se imprima **únicamente la etiqueta** de forma limpia.
5. **Carga Dinámica de Productos:** Al ingresar un LPN en el formulario, se ejecuta una consulta optimizada (debouncificada a 400ms) a la API `/api/print/lpn/:lpn/products` para mostrar en pantalla los productos de la orden antes de procesar el botón de impresión.
6. **Historial Optimizado con Filtros y Paginación:** El historial cuenta con paginación local (5 elementos por página) y controles de navegación responsivos, junto a un selector para filtrar solicitudes por tipo (*Todos / Impresión / Reimpresión*).
7. **Validación Robusta de Formularios:** Se integró **React Hook Form** junto a **Zod** para la definición del esquema de validación y la visualización de mensajes de error de forma dinámica y reactiva en pantalla, asegurando el cumplimiento de la estructura mínima (LPN y Usuario de al menos 3 caracteres, y selección de zona válida) antes de enviar las solicitudes.

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

Si deseas apuntar directamente a una URL de API diferente en desarrollo o producción, puedes definir la variable `VITE_API_URL`:
- Crea un archivo `.env` en la raíz del proyecto y añade:
  ```env
  VITE_API_URL=http://localhost:3000
  ```

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

### Configuración del API URL en Docker
Vite requiere que las variables de entorno estén presentes en tiempo de compilación. Por ello, si necesitas cambiar la URL de la API predeterminada (`/api`), debes pasarla como argumento de compilación (`build argument`).

#### Opción A: Usando Docker Compose (Recomendado)
El proyecto incluye un `docker-compose.yml` que empaqueta y levanta la aplicación sobre un servidor Nginx en la red interna:

1. **(Opcional) Configurar la URL de la API en el compose:**
   Si deseas cambiar la API URL predeterminada, puedes agregar la sección `args` bajo `build` en tu [docker-compose.yml](file:///Users/macuser/Documents/technical-test/test-hc-frontend/docker-compose.yml):
   ```yaml
   services:
     frontend:
       build:
         context: .
         dockerfile: Dockerfile
         args:
           - VITE_API_URL=http://tu-api-url.com
   ```
2. **Construir y encender el contenedor:**
   ```bash
   docker compose up -d --build
   ```
3. **Acceder a la aplicación:**
   Abre tu navegador en `http://localhost:8082` (o el puerto configurado).

#### Opción B: Usando Docker CLI directamente

1. **Construir la imagen:**
   - Usando el valor por defecto (`/api`):
     ```bash
     docker build -t test-hc-frontend .
     ```
   - Especificando una URL personalizada para el backend:
     ```bash
     docker build --build-arg VITE_API_URL=http://tu-api-url.com -t test-hc-frontend .
     ```
2. **Correr el contenedor:**
   ```bash
   docker run -d -p 8080:80 --name test-hc-frontend-container test-hc-frontend
   ```
