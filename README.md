# Simulador de Sistemas Operativos

Aplicacion web interactiva que permite visualizar y simular los conceptos fundamentales de un sistema operativo: gestion de procesos e hilos, planificacion de CPU, paginacion de memoria y algoritmos de reemplazo de paginas. Desarrollada como proyecto final de la materia **Sistemas Operativos** en la Universidad de Monterrey (UDEM), Primavera 2026.

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Tecnologias](#tecnologias)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modulos y funcionalidad](#modulos-y-funcionalidad)
  - [Procesos e hilos](#procesos-e-hilos)
  - [Planificacion de CPU](#planificacion-de-cpu)
  - [Memoria y paginacion](#memoria-y-paginacion)
  - [Reemplazo de paginas](#reemplazo-de-paginas)
  - [Metricas](#metricas)
  - [Comparacion de algoritmos](#comparacion-de-algoritmos)
- [Arquitectura](#arquitectura)
- [Instalacion y ejecucion](#instalacion-y-ejecucion)
- [Despliegue](#despliegue)

---

## Descripcion general

El simulador ofrece seis modulos principales accesibles desde una barra lateral de navegacion:

| Ruta | Modulo | Descripcion |
|------|--------|-------------|
| `/` | Procesos | Crear, editar y eliminar procesos; gestionar hilos; importar procesos desde archivo; visualizar el diagrama de transicion de estados. |
| `/scheduling` | Planificacion | Seleccionar un algoritmo de planificacion, ejecutar la simulacion paso a paso o en modo automatico, y visualizar el diagrama de Gantt junto con las metricas. |
| `/memory` | Memoria | Configurar la memoria fisica (marcos, tamano de pagina), asignar paginas a marcos y observar la fragmentacion interna. |
| `/replacement` | Reemplazo | Elegir un algoritmo de reemplazo de paginas, ejecutar la simulacion sobre una cadena de referencias y observar la linea de tiempo de aciertos y fallos. |
| `/metrics` | Metricas | Panel consolidado con tarjetas y graficas que resumen el rendimiento de la planificacion, la memoria y el reemplazo. |
| `/comparison` | Comparacion | Ejecutar varios algoritmos de planificacion y de reemplazo sobre la misma carga de trabajo y comparar sus resultados en graficas. |

---

## Tecnologias

| Categoria | Herramienta | Version |
|-----------|-------------|---------|
| Lenguaje | TypeScript | 6 |
| UI | React | 19 |
| Empaquetador | Vite | 8 |
| Estilos | Tailwind CSS | 4 |
| Enrutamiento | React Router | 7 |
| Estado global | Zustand | 5 |
| Animaciones | Framer Motion | 12 |
| Graficas | Recharts | 3 |
| Iconos | Lucide React | 1 |
| Hospedaje | Firebase Hosting | - |
| CI/CD | GitHub Actions | - |

---

## Estructura del proyecto

```
src/
├── main.tsx                  # Punto de entrada; monta BrowserRouter
├── App.tsx                   # Rutas y transiciones animadas
├── index.css                 # Estilos globales (Tailwind)
│
├── components/
│   ├── layout/               # AppShell, Sidebar (navegacion y tema)
│   ├── processes/            # ProcessForm, ProcessTable, FileUpload,
│   │                           StateDiagram, ThreadManager
│   ├── scheduling/           # AlgorithmSelector, GanttChart,
│   │                           SimulationControls, ReadyQueue,
│   │                           CpuDisplay, SchedulingMetrics
│   ├── memory/               # MemoryConfig, MemoryGrid, PageTable
│   ├── pageReplacement/      # ReplacementAlgorithmSelector,
│   │                           ReplacementVisualization,
│   │                           ReplacementTimeline, ReplacementControls
│   └── comparison/           # AlgorithmPicker, ComparisonChart
│
├── pages/                    # Una pagina por modulo
│   ├── ProcessesPage.tsx
│   ├── SchedulingPage.tsx
│   ├── MemoryPage.tsx
│   ├── ReplacementPage.tsx
│   ├── MetricsPage.tsx
│   └── ComparisonPage.tsx
│
├── engine/                   # Logica de simulacion (sin dependencias de UI)
│   ├── processes/            # stateMachine, threadManager, types
│   ├── scheduling/           # Algoritmos de planificacion y metricas
│   └── memory/               # Paginacion y algoritmos de reemplazo
│
├── store/                    # Stores de Zustand
│   ├── processStore.ts
│   ├── schedulingStore.ts
│   ├── memoryStore.ts
│   └── themeStore.ts
│
└── utils/
    ├── colors.ts             # Paleta de colores para procesos
    └── fileParser.ts         # Importacion de procesos desde archivo
```

---

## Modulos y funcionalidad

### Procesos e hilos

- Formulario para crear procesos con PID automatico, nombre, tiempo de llegada, rafaga de CPU, prioridad y numero de paginas.
- Importacion masiva desde archivo de texto.
- Tabla interactiva con edicion y eliminacion.
- Diagrama de transicion de estados (New, Ready, Running, Waiting, Terminated) gobernado por una maquina de estados finita (`stateMachine.ts`).
- Creacion de hilos por proceso y operacion `fork` (`threadManager.ts`).

### Planificacion de CPU

Algoritmos implementados en `src/engine/scheduling/`:

| Algoritmo | Archivo |
|-----------|---------|
| First Come First Served (FCFS) | `fcfs.ts` |
| Shortest Job First (SJF) | `sjf.ts` |
| Shortest Remaining Time First (SRTF) | `srtf.ts` |
| Highest Response Ratio Next (HRRN) | `hrrn.ts` |
| Round Robin | `roundRobin.ts` |
| Prioridad expropiativa | `priorityPreemptive.ts` |
| Cola multinivel | `multilevelQueue.ts` |
| Cola multinivel con retroalimentacion | `multilevelFeedback.ts` |

Cada algoritmo recibe la lista de procesos y la configuracion (quantum, niveles) y produce una linea de tiempo, metricas por proceso (tiempo de espera, respuesta, retorno), promedio general, utilizacion de CPU y cambios de contexto.

La simulacion puede ejecutarse paso a paso o en modo continuo con velocidad ajustable. El resultado se muestra en un diagrama de Gantt interactivo.

### Memoria y paginacion

- Configuracion de tamano de memoria fisica, tamano de pagina y numero de marcos.
- Asignacion secuencial de paginas a marcos con deteccion de fallos cuando no hay marcos disponibles.
- Generacion automatica de cadenas de referencia a partir de la rafaga y el numero de paginas de cada proceso.
- Calculo de fragmentacion interna.
- Visualizacion en rejilla de marcos y tabla de paginas por proceso.

### Reemplazo de paginas

Algoritmos implementados en `src/engine/memory/`:

| Algoritmo | Archivo |
|-----------|---------|
| FIFO | `fifo.ts` |
| LRU (Least Recently Used) | `lru.ts` |
| Optimo | `optimal.ts` |
| Reloj (Clock) | `clock.ts` |
| Segunda oportunidad | `secondChance.ts` |

La simulacion muestra la linea de tiempo de cada referencia indicando si fue acierto o fallo, el estado de los marcos en cada paso y un resumen con total de referencias, fallos y tasa de aciertos.

### Metricas

Panel que reune las metricas mas relevantes de los tres modulos anteriores en tarjetas y graficas de Recharts: tiempos promedio de espera, respuesta y retorno; utilizacion de CPU; tasa de fallos de pagina, entre otros.

### Comparacion de algoritmos

Permite seleccionar varios algoritmos de planificacion y de reemplazo de paginas, ejecutarlos sobre la misma carga de trabajo y comparar los resultados lado a lado en graficas de barras y tablas.

---

## Arquitectura

El proyecto sigue una separacion clara entre la logica de simulacion y la interfaz grafica:

- **`engine/`** contiene toda la logica de algoritmos y simulacion. Es TypeScript puro sin dependencias de React, lo que permite probarlo y reutilizarlo de manera independiente.
- **`store/`** expone cuatro stores de Zustand (procesos, planificacion, memoria, tema) que actuan como puente entre el motor y la UI.
- **`components/`** y **`pages/`** consumen los stores y renderizan la interfaz con React, Tailwind CSS y Framer Motion para las transiciones entre paginas.

---

## Instalacion y ejecucion

```bash
# Clonar el repositorio
git clone https://github.com/<usuario>/ProyectoFinalSistemasOperativos.git
cd ProyectoFinalSistemasOperativos

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev

# Compilar para produccion
npm run build

# Previsualizar la compilacion
npm run preview
```

Requisitos: **Node.js 20** o superior.

---

## Despliegue

El proyecto se despliega automaticamente en **Firebase Hosting** mediante GitHub Actions. Al hacer push a la rama `main`:

1. Se instalan las dependencias (`npm ci`).
2. Se compila el proyecto (`npm run build`).
3. Se despliega la carpeta `dist/` al proyecto de Firebase `sistemasoperativosproject`.

La configuracion de Firebase (`firebase.json`) redirige todas las rutas a `index.html` para soportar el enrutamiento del lado del cliente.
