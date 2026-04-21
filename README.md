# Simulador de Sistemas Operativos

Aplicación web interactiva que permite visualizar y experimentar con los conceptos fundamentales de un sistema operativo: gestión de procesos e hilos, planificación de CPU, paginación de memoria y algoritmos de reemplazo de páginas. Desarrollada como proyecto final de la materia **Sistemas Operativos** en la Universidad de Monterrey (UDEM), Primavera 2026.

La aplicación está construida con un enfoque _mobile-first_ y combina dos formas de uso complementarias:

- Una **guía interactiva por capítulos** pensada para alguien que llega sin conocimientos previos.
- Un **modo libre** con seis módulos donde se pueden configurar y ejecutar simulaciones completas.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo funciona](#cómo-funciona)
  - [Pantalla de bienvenida](#pantalla-de-bienvenida)
  - [Guía interactiva](#guía-interactiva)
  - [Modo libre](#modo-libre)
- [Módulos del modo libre](#módulos-del-modo-libre)
  - [Procesos e hilos](#procesos-e-hilos)
  - [Planificación de CPU](#planificación-de-cpu)
  - [Memoria y paginación](#memoria-y-paginación)
  - [Reemplazo de páginas](#reemplazo-de-páginas)
  - [Métricas](#métricas)
  - [Comparación de algoritmos](#comparación-de-algoritmos)
- [Arquitectura](#arquitectura)
- [Diseño y experiencia de usuario](#diseño-y-experiencia-de-usuario)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Despliegue](#despliegue)

---

## Descripción general

El proyecto se divide en tres grandes zonas:

| Zona | Ruta base | Descripción |
|------|-----------|-------------|
| Bienvenida | `/` | Portada del simulador con accesos directos a la guía o al modo libre. |
| Guía interactiva | `/guia` | Tutorial paso a paso dividido en capítulos, con analogías, animaciones y mini simulaciones. |
| Modo libre | `/procesos`, `/planificacion`, `/memoria`, `/reemplazo`, `/metricas`, `/comparacion` | Seis módulos independientes con todas las herramientas de simulación. |

---

## Tecnologías

| Categoría | Herramienta | Versión |
|-----------|-------------|---------|
| Lenguaje | TypeScript | 6 |
| UI | React | 19 |
| Empaquetador | Vite | 8 |
| Estilos | Tailwind CSS (plugin oficial de Vite) | 4 |
| Enrutamiento | React Router DOM | 7 |
| Estado global | Zustand (con `persist`) | 5 |
| Animaciones | Framer Motion | 12 |
| Gráficas | Recharts | 3 |
| Iconos | Lucide React | 1 |
| Hospedaje | Firebase Hosting | — |
| CI/CD | GitHub Actions | — |

---

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada; monta BrowserRouter
├── App.tsx                   # Rutas, transiciones animadas y selección móvil/escritorio
├── index.css                 # Estilos globales (tokens de tema y utilidades de Tailwind)
│
├── components/
│   ├── layout/               # AppShell, Sidebar, MobileHeader, MobileTabBar,
│   │                           SwipeNavigator y configuración de rutas
│   ├── ui/                   # Modal, BottomSheet, Fab, Stepper, ThemeToggle,
│   │                           StickyActionBar (componentes reutilizables)
│   ├── processes/            # ProcessForm, ProcessTable, FileUpload,
│   │                           StateDiagram, ThreadManager
│   ├── scheduling/           # AlgorithmSelector, GanttChart, SimulationControls,
│   │                           ReadyQueue, CpuDisplay, SchedulingMetrics
│   ├── memory/               # MemoryConfig, MemoryGrid, PageTable
│   ├── pageReplacement/      # ReplacementAlgorithmSelector, ReplacementControls,
│   │                           ReplacementVisualization, ReplacementTimeline
│   └── comparison/           # AlgorithmPicker, ComparisonChart
│
├── pages/                    # Una página por ruta del modo libre
│   ├── WelcomePage.tsx
│   ├── ProcessesPage.tsx
│   ├── SchedulingPage.tsx
│   ├── MemoryPage.tsx
│   ├── ReplacementPage.tsx
│   ├── MetricsPage.tsx
│   └── ComparisonPage.tsx
│
├── guide/                    # Guía interactiva por capítulos
│   ├── GuideRouter.tsx       # Enrutamiento de capítulos y pasos
│   ├── GuideShell.tsx        # Cascarón visual común a todos los pasos
│   ├── GuideStep.tsx         # Encabezado y cuerpo de cada paso
│   ├── chapters/             # WelcomeChapter, ProcessesChapter, SchedulingChapter,
│   │                           MemoryChapter, ReplacementChapter, SummaryChapter
│   ├── components/           # Visualizaciones específicas de la guía
│   │                           (MiniGantt, MiniMemoryGrid, ReplacementPlayer, etc.)
│   ├── copy.ts               # Cadenas reutilizadas en la guía
│   └── types.ts / utils.ts
│
├── engine/                   # Lógica de simulación pura (sin dependencias de React)
│   ├── processes/            # stateMachine, threadManager, types
│   ├── scheduling/           # Algoritmos de planificación + cálculo de métricas
│   └── memory/               # Paginación + algoritmos de reemplazo
│
├── store/                    # Stores de Zustand
│   ├── processStore.ts
│   ├── schedulingStore.ts
│   ├── memoryStore.ts
│   ├── tutorialStore.ts      # Estado y progreso de la guía (persistido)
│   └── themeStore.ts
│
└── utils/
    ├── colors.ts             # Paleta de colores asignada a procesos
    ├── chartTheme.ts         # Tokens de color para gráficas de Recharts
    ├── fileParser.ts         # Importación de procesos desde archivo
    └── useIsMobile.ts        # Hook para detectar viewport móvil
```

---

## Cómo funciona

### Pantalla de bienvenida

La ruta `/` muestra una portada (`WelcomePage`) con un resumen visual del simulador y dos accesos principales:

- **Empezar / Continuar la guía** lleva al tutorial paso a paso.
- **Ir directo al modo libre** abre el módulo de procesos.

Si el usuario ya completó capítulos previamente, se ofrece retomar la guía desde donde la dejó (el progreso se guarda con `zustand/persist` bajo la clave `simulador-so-tutorial`).

### Guía interactiva

La guía vive bajo `/guia/:capitulo/:paso` y está compuesta por seis capítulos:

1. **Bienvenida** — qué es un sistema operativo y cómo se usa la guía.
2. **Procesos** — qué es un proceso y cómo crear los del ejemplo.
3. **Planificación** — cómo decide la CPU a quién atender.
4. **Memoria** — qué es la RAM, qué es una página y un marco.
5. **Reemplazo** — qué pasa cuando ya no caben más páginas.
6. **Resumen** — repaso del recorrido y siguientes pasos.

Cada capítulo se divide en pasos que combinan analogías, animaciones (`AnimatedStateDiagram`, `MiniGantt`, `MiniMemoryGrid`, `ReplacementPlayer`, etc.) y mini formularios. El componente `GuideRouter`:

- Determina el capítulo y paso actuales a partir de la URL.
- Verifica que cada paso pueda avanzar mediante `step.canAdvance()`. Por ejemplo, no se puede pasar del capítulo de procesos hasta haber creado al menos un mini proceso.
- Permite saltar a capítulos previamente completados desde el riel lateral (`GuideRailDesktop`).
- Marca capítulos como completados y los persiste en `tutorialStore`.

Toda la información que el usuario configura en la guía (mini procesos, elección de algoritmo, quantum, número de marcos, páginas por proceso, etc.) vive en `tutorialStore` y alimenta las visualizaciones en tiempo real.

### Modo libre

El modo libre comparte el mismo cascarón (`AppShell`) en escritorio y en móvil:

- En **escritorio** se muestra un `Sidebar` con la navegación a los seis módulos y el selector de tema.
- En **móvil** se muestran un `MobileHeader` arriba y una `MobileTabBar` abajo, además de un `SwipeNavigator` que permite cambiar de módulo deslizando.

El componente `App` calcula la dirección de la transición (avanzar o retroceder) comparando el índice de la ruta actual contra la anterior, lo que da animaciones consistentes en `AnimatePresence` de Framer Motion.

---

## Módulos del modo libre

### Procesos e hilos

Ruta: `/procesos`

- Formulario para crear procesos con PID automático, nombre, tiempo de llegada, ráfaga de CPU, prioridad y número de páginas.
- Importación masiva desde archivo de texto (`utils/fileParser.ts`).
- Tabla interactiva con edición y eliminación.
- Diagrama de transición de estados (New, Ready, Running, Waiting, Terminated) gobernado por una máquina de estados finita (`engine/processes/stateMachine.ts`).
- Creación de hilos por proceso y operación `fork` (`engine/processes/threadManager.ts`).

### Planificación de CPU

Ruta: `/planificacion`

Algoritmos implementados en `src/engine/scheduling/` y registrados en su `index.ts`:

| Algoritmo | Archivo |
|-----------|---------|
| First Come First Served (FCFS) | `fcfs.ts` |
| Shortest Job First (SJF) | `sjf.ts` |
| Shortest Remaining Time First (SRTF) | `srtf.ts` |
| Highest Response Ratio Next (HRRN) | `hrrn.ts` |
| Round Robin | `roundRobin.ts` |
| Prioridad expropiativa | `priorityPreemptive.ts` |
| Cola multinivel | `multilevelQueue.ts` |
| Cola multinivel con retroalimentación | `multilevelFeedback.ts` |

Cada planificador recibe la lista de procesos y la configuración (quantum, niveles) y produce una línea de tiempo, métricas por proceso (espera, respuesta, retorno), promedios generales, utilización de CPU y cambios de contexto (`engine/scheduling/metrics.ts`).

La simulación puede ejecutarse paso a paso o en modo continuo con velocidad ajustable. El resultado se muestra en un diagrama de Gantt interactivo, una cola de listos y la CPU activa.

### Memoria y paginación

Ruta: `/memoria`

- Configuración de tamaño de memoria física, tamaño de página y número de marcos (`MemoryConfig`).
- Asignación secuencial de páginas a marcos con detección de fallos cuando no hay marcos disponibles (`engine/memory/paging.ts`).
- Generación automática de cadenas de referencia a partir de la ráfaga y el número de páginas de cada proceso.
- Cálculo de fragmentación interna.
- Visualización en rejilla de marcos (`MemoryGrid`) y tabla de páginas por proceso (`PageTable`).

### Reemplazo de páginas

Ruta: `/reemplazo`

Algoritmos implementados en `src/engine/memory/` y registrados en su `index.ts`:

| Algoritmo | Archivo |
|-----------|---------|
| FIFO | `fifo.ts` |
| LRU (Least Recently Used) | `lru.ts` |
| Óptimo | `optimal.ts` |
| Reloj (Clock) | `clock.ts` |
| Segunda oportunidad | `secondChance.ts` |

La simulación muestra la línea de tiempo de cada referencia indicando si fue acierto o fallo, el estado de los marcos en cada paso y un resumen con total de referencias, fallos y tasa de aciertos.

### Métricas

Ruta: `/metricas`

Panel consolidado con tarjetas y gráficas de Recharts que reúne las métricas más relevantes de los tres motores: tiempos promedio de espera, respuesta y retorno; utilización de CPU; tasa de fallos de página; cambios de contexto, entre otros. Los colores de las gráficas se sincronizan con el tema activo a través de `utils/chartTheme.ts`.

### Comparación de algoritmos

Ruta: `/comparacion`

Permite seleccionar varios algoritmos de planificación y de reemplazo de páginas, ejecutarlos sobre la misma carga de trabajo y comparar los resultados lado a lado en gráficas de barras y tablas (`AlgorithmPicker`, `ComparisonChart`).

---

## Arquitectura

El proyecto sigue una separación clara entre la lógica de simulación, el estado y la interfaz:

- **`engine/`** contiene toda la lógica de algoritmos y simulación. Es TypeScript puro sin dependencias de React, lo que permite probarlo y reutilizarlo de manera independiente. Los `index.ts` exponen funciones tipo _factory_ (`getScheduler`, `getReplacementAlgorithm`) para resolver un algoritmo por su nombre.
- **`store/`** expone cinco stores de Zustand (procesos, planificación, memoria, tema y tutorial) que actúan como puente entre el motor y la UI. El store del tutorial usa `persist` para conservar el progreso entre sesiones.
- **`guide/`** consume `tutorialStore` y construye un flujo lineal por capítulos y pasos sobre los componentes de visualización propios del tutorial.
- **`pages/`** y **`components/`** consumen los stores y renderizan la interfaz del modo libre con React, Tailwind CSS y Framer Motion para las transiciones entre páginas.

```
        ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
        │   engine/    │ <----- │    store/    │ <----- │  components/ │
        │ (TS puro)    │        │   (Zustand)  │        │   + pages/   │
        └──────────────┘        └──────────────┘        └──────┬───────┘
                                                               │
                                                               v
                                                        ┌──────────────┐
                                                        │     App      │
                                                        │ (Router + UI)│
                                                        └──────────────┘
```

---

## Diseño y experiencia de usuario

- **Mobile-first**: el layout, la tipografía y los controles están pensados primero para celular. El hook `useIsMobile` decide qué cascarón usar (`Sidebar` o `MobileTabBar` + `MobileHeader`) y qué tipo de transición aplicar entre páginas.
- **Tema claro y oscuro**: gestionado por `themeStore` y aplicado mediante variables CSS (`--accent`, `--surface`, `--text`, etc.) definidas en `index.css`. El componente `ThemeToggle` permite cambiarlo desde la barra lateral o el encabezado móvil.
- **Animaciones**: `AnimatePresence` y `motion.div` envuelven cada cambio de ruta y cada cambio de paso en la guía para dar una sensación fluida.
- **Componentes reutilizables**: en `components/ui/` viven primitivas como `Modal`, `BottomSheet`, `Fab`, `Stepper` y `StickyActionBar`, usadas tanto por el modo libre como por la guía.

---

## Instalación y ejecución

Requisitos: **Node.js 20** o superior.

```bash
# Clonar el repositorio
git clone https://github.com/<usuario>/ProyectoFinalSistemasOperativos.git
cd ProyectoFinalSistemasOperativos

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev

# Compilar para producción (corre tsc -b y vite build)
npm run build

# Previsualizar la compilación generada en dist/
npm run preview
```

---

## Despliegue

El proyecto se despliega automáticamente en **Firebase Hosting** mediante GitHub Actions (`.github/workflows/firebase-deploy.yml`). Al hacer push a la rama `main`:

1. Se instalan las dependencias con `npm ci`.
2. Se compila el proyecto con `npm run build`.
3. Se despliega la carpeta `dist/` al proyecto de Firebase `sistemasoperativosproject` usando `FirebaseExtended/action-hosting-deploy@v0`.

La configuración de Firebase (`firebase.json`) sirve los archivos estáticos de `dist/` y reescribe todas las rutas a `index.html` para soportar el enrutamiento del lado del cliente de React Router.
