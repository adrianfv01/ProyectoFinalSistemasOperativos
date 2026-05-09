import { ProcessState, type Process, type Thread } from '../engine/processes/types'
import type { AlgorithmName } from '../store/schedulingStore'
import type { ReplacementAlgorithmName } from '../store/memoryStore'
import type { SchedulerConfig } from '../engine/scheduling/types'

export type PresetCategory =
  | 'planificacion'
  | 'multinucleo'
  | 'procesos'
  | 'memoria'
  | 'reemplazo'

export type PresetRoute =
  | '/procesos'
  | '/planificacion'
  | '/memoria'
  | '/reemplazo'
  | '/metricas'
  | '/comparacion'

export interface PresetMemoryConfig {
  totalMemory: number
  pageSize: number
  frames: number
}

export interface PresetSchedulingConfig {
  algorithm: AlgorithmName
  config?: Partial<SchedulerConfig>
  autoRun?: boolean
}

export interface PresetReplacementConfig {
  algorithm: ReplacementAlgorithmName
  autoRun?: boolean
  customReferenceString?: { pid: number; page: number }[]
}

export interface PresetSizing {
  min: number
  max: number
  default: number
  unit: string
  helper?: string
}

export interface Preset {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  category: PresetCategory
  observations: string[]
  recommendedRoute: PresetRoute
  sizing: PresetSizing
  buildProcesses: (size: number) => Process[]
  memory?: (size: number) => PresetMemoryConfig
  scheduling?: PresetSchedulingConfig
  replacement?: PresetReplacementConfig
}

export const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  planificacion: 'Planificación de CPU',
  multinucleo: 'Multinúcleo',
  procesos: 'Procesos e hilos',
  memoria: 'Memoria',
  reemplazo: 'Reemplazo de páginas',
}

interface ProcessSeed {
  pid: number
  arrivalTime: number
  burstTime: number
  priority: number
  numPages: number
  parentPid?: number
  threads?: Array<{ tid: number; burstTime: number }>
}

function buildProcess(seed: ProcessSeed): Process {
  const sharedPages = Array.from({ length: seed.numPages }, (_, i) => i)
  const threads: Thread[] = (seed.threads ?? []).map((t) => ({
    tid: t.tid,
    pid: seed.pid,
    burstTime: t.burstTime,
    remainingTime: t.burstTime,
    state: ProcessState.New,
    sharedPages: [...sharedPages],
  }))
  return {
    pid: seed.pid,
    arrivalTime: seed.arrivalTime,
    burstTime: seed.burstTime,
    remainingTime: seed.burstTime,
    priority: seed.priority,
    numPages: seed.numPages,
    state: ProcessState.New,
    threads,
    parentPid: seed.parentPid,
  }
}

function makeProcesses(seeds: ProcessSeed[]): Process[] {
  return seeds.map(buildProcess)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export const PRESETS: Preset[] = [
  {
    id: 'comparison-mixed',
    title: 'Caso de prueba para comparar algoritmos',
    shortDescription:
      'Mezcla pensada para que cada algoritmo de planificación y reemplazo dé un resultado distinto.',
    longDescription:
      'Llegadas escalonadas con huecos para que la CPU quede ociosa, ráfagas y prioridades variadas, y páginas con localidad. Pensado para usarlo desde la pantalla de Comparación: cada barra del gráfico debería ser distinta.',
    category: 'planificacion',
    observations: [
      'Las llegadas dejan huecos, así que el uso de CPU no llega al 100% en todos los algoritmos.',
      'Las ráfagas son muy distintas: SJF y SRTF baten claramente a FCFS y Round Robin.',
      'Las prioridades cambian en cada proceso, por lo que MLQ y MLFQ se desvían del resto.',
      'Las páginas están diseñadas con localidad para que FIFO, LRU, Óptimo y Reloj se diferencien.',
    ],
    recommendedRoute: '/comparacion',
    sizing: { min: 5, max: 8, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 5, 8)
      const arrivals = [0, 1, 3, 6, 9, 12, 14, 17]
      const bursts = [8, 4, 2, 7, 3, 5, 6, 2]
      const priorities = [3, 1, 2, 3, 1, 2, 3, 1]
      const pages = [5, 3, 2, 4, 3, 4, 5, 2]
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: arrivals[i - 1],
          burstTime: bursts[i - 1],
          priority: priorities[i - 1],
          numPages: pages[i - 1],
          threads:
            i === 2
              ? [
                  { tid: 1, burstTime: 2 },
                  { tid: 2, burstTime: 1 },
                ]
              : undefined,
        })
      }
      return makeProcesses(seeds)
    },
    memory: () => ({ totalMemory: 32, pageSize: 4, frames: 4 }),
  },
  {
    id: 'fcfs-convoy',
    title: 'Efecto convoy con FCFS',
    shortDescription:
      'Un proceso largo con varios hilos llega primero y bloquea a los procesos cortos detrás de él.',
    longDescription:
      'FCFS atiende los procesos en el orden estricto de llegada. El primero es muy pesado y trae varios hilos; mientras se desahoga, los procesos cortos se acumulan detrás. Aumenta el tamaño para sentir aún más el efecto convoy.',
    category: 'planificacion',
    observations: [
      'P1 ocupa la CPU con su ráfaga grande y dos hilos de trabajo extra.',
      'Los demás procesos esperan aunque tengan ráfagas mínimas.',
      'El tiempo de espera promedio crece de forma desproporcionada.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 10, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 10)
      const seeds: ProcessSeed[] = [
        {
          pid: 1,
          arrivalTime: 0,
          burstTime: 12,
          priority: 1,
          numPages: 4,
          threads: [
            { tid: 1, burstTime: 4 },
            { tid: 2, burstTime: 3 },
          ],
        },
      ]
      const shortBursts = [1, 2, 1, 3, 2, 1, 2, 3, 1]
      for (let i = 2; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: i - 1,
          burstTime: shortBursts[(i - 2) % shortBursts.length],
          priority: 1,
          numPages: 1,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: { algorithm: 'fcfs', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'sjf-shortest-first',
    title: 'SJF: el más corto primero',
    shortDescription:
      'Varios procesos llegan al mismo tiempo y SJF los reordena por ráfaga creciente.',
    longDescription:
      'Todas las llegadas son simultáneas, así que SJF ofrece el menor tiempo de espera promedio posible. Uno de los procesos trae hilos para que la métrica de tareas suba.',
    category: 'planificacion',
    observations: [
      'El orden no es por PID sino por ráfaga.',
      'Los procesos cortos terminan casi de inmediato.',
      'Los hilos de P1 también compiten por la CPU.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 12, default: 7, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 12)
      const burstPattern = [8, 1, 2, 3, 5, 4, 6, 7, 2, 9, 1, 4]
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        const burst = burstPattern[(i - 1) % burstPattern.length]
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: burst,
          priority: 1,
          numPages: Math.max(1, Math.ceil(burst / 4)),
          threads:
            i === 1
              ? [
                  { tid: 1, burstTime: 3 },
                  { tid: 2, burstTime: 2 },
                ]
              : undefined,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: { algorithm: 'sjf', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'srtf-preemption',
    title: 'SRTF expropia al llegar uno más corto',
    shortDescription:
      'Cada nuevo proceso es más corto que el actual y lo desaloja apenas llega.',
    longDescription:
      'SRTF (Shortest Remaining Time First) expropia constantemente. Aumentar el tamaño produce más cambios de contexto y un Gantt visualmente rico.',
    category: 'planificacion',
    observations: [
      'Cada llegada genera un cambio de contexto.',
      'Los procesos cortos terminan rápido pese a llegar tarde.',
      'A más procesos, más expropiaciones.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 3, max: 10, default: 5, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 3, 10)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: i === 1 ? 0 : (i - 1) * 2,
          burstTime: Math.max(1, 9 - (i - 1)),
          priority: 1,
          numPages: 2,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: { algorithm: 'srtf', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'round-robin-fairness',
    title: 'Round Robin: equidad y cambios de contexto',
    shortDescription:
      'Varios procesos similares (uno con hilos) se reparten la CPU en rebanadas de quantum 2.',
    longDescription:
      'Round Robin garantiza que ningún proceso espere más de (n−1) × quantum entre turnos. Uno de los procesos tiene varios hilos para mostrar el reparto justo entre tareas, no solo entre procesos.',
    category: 'planificacion',
    observations: [
      'Cada proceso e hilo obtiene rebanadas iguales.',
      'A más procesos, más cambios de contexto.',
      'Los hilos de un proceso comparten sus páginas.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 12, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 12)
      const burstPattern = [5, 4, 6, 5, 7, 4, 6, 5, 4, 7, 6, 5]
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: i - 1,
          burstTime: burstPattern[(i - 1) % burstPattern.length],
          priority: 1,
          numPages: 2,
          threads:
            i === 2
              ? [
                  { tid: 1, burstTime: 3 },
                  { tid: 2, burstTime: 2 },
                ]
              : undefined,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: {
      algorithm: 'roundRobin',
      config: { quantum: 2, numCores: 1, parallelism: 'real' },
    },
  },
  {
    id: 'priority-starvation',
    title: 'Prioridad expropiativa con riesgo de inanición',
    shortDescription:
      'Procesos de alta prioridad llegan continuamente y dejan a uno de baja prioridad sin avanzar.',
    longDescription:
      'Una prioridad menor (número) significa mayor prioridad. Mientras lleguen procesos urgentes, P1 (prioridad 10) apenas avanza. Aumenta el tamaño para acentuar la inanición.',
    category: 'planificacion',
    observations: [
      'P1 (prioridad 10) apenas avanza durante toda la simulación.',
      'Los procesos prioridad 1–3 corren primero aunque llegan después.',
      'Es el caso clásico para justificar el envejecimiento (aging).',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 12, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 12)
      const seeds: ProcessSeed[] = [
        {
          pid: 1,
          arrivalTime: 0,
          burstTime: 12,
          priority: 10,
          numPages: 3,
        },
      ]
      const priorityPool = [3, 2, 1, 2, 1, 3, 1, 2, 3, 1, 2]
      const burstPool = [4, 3, 4, 2, 3, 3, 4, 2, 3, 4, 3]
      for (let i = 2; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: i - 1,
          burstTime: burstPool[(i - 2) % burstPool.length],
          priority: priorityPool[(i - 2) % priorityPool.length],
          numPages: 2,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: {
      algorithm: 'priorityPreemptive',
      config: { numCores: 1, parallelism: 'real' },
    },
  },
  {
    id: 'hrrn-aging',
    title: 'HRRN reduce la inanición',
    shortDescription:
      'HRRN combina espera y ráfaga para que los procesos viejos terminen subiendo de turno.',
    longDescription:
      'El Highest Response Ratio Next calcula (espera + ráfaga) / ráfaga. Los procesos largos que han esperado mucho ganan prioridad de forma natural. P1 trae hilos para incrementar el trabajo total.',
    category: 'planificacion',
    observations: [
      'Los procesos cortos se atienden rápido.',
      'El proceso largo no se queda atrás indefinidamente.',
      'Es una alternativa cooperativa a SJF para evitar inanición.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 12, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 12)
      const seeds: ProcessSeed[] = [
        {
          pid: 1,
          arrivalTime: 0,
          burstTime: 12,
          priority: 1,
          numPages: 3,
          threads: [
            { tid: 1, burstTime: 3 },
            { tid: 2, burstTime: 2 },
          ],
        },
      ]
      const shortBursts = [1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4]
      for (let i = 2; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: i - 1,
          burstTime: shortBursts[(i - 2) % shortBursts.length],
          priority: 1,
          numPages: 1,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: { algorithm: 'hrrn', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'mlfq-mixed-workload',
    title: 'Cola multinivel con retroalimentación',
    shortDescription:
      'Procesos de distintas prioridades se reparten en tres colas con quantum creciente.',
    longDescription:
      'Las colas de mayor prioridad usan quantum corto (interactivas) y las de menor prioridad usan quantum largo (lotes). Si un proceso agota su quantum, baja de nivel. Algunos procesos traen hilos para hacer más trabajo en el nivel alto.',
    category: 'planificacion',
    observations: [
      'Los procesos prioridad 1 corren primero con quantum 2.',
      'Los procesos prioridad 2 corren después con quantum 4.',
      'Los procesos prioridad 3 quedan al final con quantum 8.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 5, max: 14, default: 8, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 5, 14)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        const priority = ((i - 1) % 3) + 1
        const burst = priority === 1 ? 4 + ((i - 1) % 3) : priority === 2 ? 5 + ((i - 1) % 3) : 8 + ((i - 1) % 3)
        seeds.push({
          pid: i,
          arrivalTime: Math.floor((i - 1) / 2),
          burstTime: burst,
          priority,
          numPages: 2,
          threads:
            i <= 2
              ? [
                  { tid: 1, burstTime: 2 },
                  { tid: 2, burstTime: 2 },
                ]
              : undefined,
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: {
      algorithm: 'multilevelFeedback',
      config: { quantumPerLevel: [2, 4, 8], numCores: 1, parallelism: 'real' },
    },
  },
  {
    id: 'multicore-parallel',
    title: 'Multinúcleo: paralelismo real con 4 cores',
    shortDescription:
      'Un padre con varios forks e hilos satura cuatro núcleos al mismo tiempo.',
    longDescription:
      'Combina paralelismo real, hilos y forks. P1 lanza varios hijos por fork; uno de ellos corre con dos hilos. El cluster de tareas resultante satura los 4 núcleos.',
    category: 'multinucleo',
    observations: [
      'Cada núcleo tiene su propio carril en el Gantt.',
      'Los hilos de un proceso comparten páginas pero compiten por CPU.',
      'La utilización de CPU sube hacia el 100 % cuando hay trabajo suficiente.',
    ],
    recommendedRoute: '/planificacion',
    sizing: { min: 4, max: 16, default: 8, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 16)
      const burstPattern = [6, 5, 7, 4, 6, 5, 7, 4, 6, 5, 7, 4, 6, 5, 7, 4]
      const seeds: ProcessSeed[] = [
        {
          pid: 1,
          arrivalTime: 0,
          burstTime: burstPattern[0],
          priority: 1,
          numPages: 3,
          threads: [
            { tid: 1, burstTime: 3 },
            { tid: 2, burstTime: 4 },
          ],
        },
      ]
      for (let i = 2; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: Math.floor((i - 1) / 2),
          burstTime: burstPattern[(i - 1) % burstPattern.length],
          priority: 1,
          numPages: 2,
          parentPid: i <= Math.ceil(total / 2) + 1 ? 1 : i - Math.ceil(total / 2),
        })
      }
      return makeProcesses(seeds)
    },
    scheduling: {
      algorithm: 'roundRobin',
      config: { quantum: 2, numCores: 4, parallelism: 'real' },
    },
  },
  {
    id: 'fork-tree',
    title: 'Árbol de procesos con fork',
    shortDescription:
      'Un proceso padre crea hijos y nietos en un árbol de profundidad creciente.',
    longDescription:
      'Recrea la jerarquía típica al llamar a fork() en POSIX. Cada hijo apunta a su padre con parentPid; el árbol crece como un árbol binario heap-like.',
    category: 'procesos',
    observations: [
      'P1 es el padre raíz. Pi tiene como padre a P⌊i/2⌋.',
      'Los descendientes heredan ráfaga, prioridad y páginas del padre.',
      'Aumenta el tamaño para ver árboles más grandes.',
    ],
    recommendedRoute: '/procesos',
    sizing: { min: 3, max: 15, default: 7, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 3, 15)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: 4,
          priority: 1,
          numPages: 2,
          parentPid: i === 1 ? undefined : Math.floor(i / 2),
          threads:
            i === 1
              ? [
                  { tid: 1, burstTime: 2 },
                  { tid: 2, burstTime: 2 },
                ]
              : undefined,
        })
      }
      return makeProcesses(seeds)
    },
  },
  {
    id: 'threads-shared-pages',
    title: 'Hilos compartiendo páginas',
    shortDescription:
      'Un proceso pesado tiene N hilos que comparten su espacio de direcciones.',
    longDescription:
      'Los hilos del mismo proceso comparten las mismas páginas, por eso el cambio de contexto entre hilos del mismo proceso es más barato que entre procesos. El slider controla cuántos hilos tiene el proceso pesado.',
    category: 'procesos',
    observations: [
      'P1 tiene N hilos (T1..TN) con sus propias ráfagas.',
      'Los hilos referencian las mismas páginas del proceso.',
      'P2 y P3 son procesos independientes con su propia memoria.',
    ],
    recommendedRoute: '/procesos',
    sizing: {
      min: 2,
      max: 10,
      default: 5,
      unit: 'hilos',
      helper: 'Número de hilos del proceso principal',
    },
    buildProcesses: (size) => {
      const threadCount = clamp(size, 2, 10)
      const threadBursts = [4, 3, 5, 2, 4, 3, 5, 2, 4, 3]
      const threads = Array.from({ length: threadCount }, (_, i) => ({
        tid: i + 1,
        burstTime: threadBursts[i % threadBursts.length],
      }))
      return makeProcesses([
        {
          pid: 1,
          arrivalTime: 0,
          burstTime: 6,
          priority: 1,
          numPages: 4,
          threads,
        },
        { pid: 2, arrivalTime: 1, burstTime: 3, priority: 1, numPages: 2 },
        { pid: 3, arrivalTime: 2, burstTime: 4, priority: 1, numPages: 2, parentPid: 2 },
      ])
    },
    scheduling: {
      algorithm: 'roundRobin',
      config: { quantum: 2, numCores: 1, parallelism: 'real' },
    },
  },
  {
    id: 'memory-fragmentation',
    title: 'Memoria: paginación y fragmentación interna',
    shortDescription:
      'Procesos con distintos tamaños llenan los marcos y dejan ver la fragmentación interna.',
    longDescription:
      'Memoria total escalable con páginas de 8 KB. Los procesos consumen marcos completos aunque no usen todo su contenido. A más procesos, más fragmentación.',
    category: 'memoria',
    observations: [
      'Cada proceso recibe marcos contiguos en la cuadrícula.',
      'Si un proceso pide menos memoria que un marco completo, se desperdicia.',
      'La tabla de páginas muestra qué marco recibe cada página de cada PID.',
    ],
    recommendedRoute: '/memoria',
    sizing: { min: 4, max: 12, default: 6, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 4, 12)
      const pagePattern = [3, 2, 2, 1, 3, 2, 1, 2, 3, 2, 1, 2]
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: 4,
          priority: 1,
          numPages: pagePattern[(i - 1) % pagePattern.length],
        })
      }
      return makeProcesses(seeds)
    },
    memory: (size) => {
      const total = clamp(size, 4, 12)
      const frames = Math.max(8, Math.ceil(total * 1.6))
      return { totalMemory: frames * 8, pageSize: 8, frames }
    },
  },
  {
    id: 'replacement-fifo-cycle',
    title: 'FIFO con ciclo de páginas',
    shortDescription:
      'Uno o varios procesos recorren páginas en ciclo dentro de pocos marcos.',
    longDescription:
      'Cuando la cadena de referencias es cíclica y supera los marcos disponibles, FIFO genera un fallo en cada acceso. Es el peor caso clásico para FIFO. A más procesos, más referencias y la patología se nota más.',
    category: 'reemplazo',
    observations: [
      'Cada nueva página expulsa a la más vieja en orden de llegada.',
      'La línea de tiempo se llena de fallos en rojo.',
      'Compáralo con LRU usando los mismos procesos.',
    ],
    recommendedRoute: '/reemplazo',
    sizing: { min: 1, max: 4, default: 2, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 1, 4)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: 18,
          priority: 1,
          numPages: 5,
        })
      }
      return makeProcesses(seeds)
    },
    memory: () => ({ totalMemory: 64, pageSize: 4, frames: 3 }),
    replacement: { algorithm: 'fifo' },
  },
  {
    id: 'replacement-lru-locality',
    title: 'LRU aprovecha la localidad temporal',
    shortDescription:
      'Procesos con buena localidad muestran cómo LRU mantiene en memoria lo recién usado.',
    longDescription:
      'LRU expulsa la página menos recientemente usada. En cargas con localidad temporal, conserva en memoria las páginas que vuelven a aparecer pronto. Más procesos = más cadena de referencias.',
    category: 'reemplazo',
    observations: [
      'LRU mantiene en memoria las páginas con accesos recientes.',
      'Los aciertos crecen frente a FIFO en cargas con localidad.',
      'Cambia a FIFO en el selector y reejecuta para comparar.',
    ],
    recommendedRoute: '/reemplazo',
    sizing: { min: 2, max: 8, default: 3, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 2, 8)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: 8,
          priority: 1,
          numPages: 3,
        })
      }
      return makeProcesses(seeds)
    },
    memory: () => ({ totalMemory: 32, pageSize: 4, frames: 4 }),
    replacement: { algorithm: 'lru' },
  },
  {
    id: 'replacement-optimal-baseline',
    title: 'Algoritmo óptimo: línea base teórica',
    shortDescription:
      'El algoritmo óptimo expulsa la página que más tarde se volverá a referenciar.',
    longDescription:
      'Belady demostró que este algoritmo es imposible en la práctica (necesita conocer el futuro), pero sirve como cota inferior de fallos para comparar.',
    category: 'reemplazo',
    observations: [
      'Genera el menor número de fallos posible para esta cadena.',
      'Úsalo como referencia para evaluar FIFO, LRU y Reloj.',
      'Cambia de algoritmo en el selector y reejecuta.',
    ],
    recommendedRoute: '/reemplazo',
    sizing: { min: 2, max: 6, default: 3, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 2, 6)
      const burstPattern = [12, 8, 10, 9, 11, 7]
      const pagesPattern = [4, 3, 3, 4, 3, 3]
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: burstPattern[(i - 1) % burstPattern.length],
          priority: 1,
          numPages: pagesPattern[(i - 1) % pagesPattern.length],
        })
      }
      return makeProcesses(seeds)
    },
    memory: () => ({ totalMemory: 32, pageSize: 4, frames: 4 }),
    replacement: { algorithm: 'optimal' },
  },
  {
    id: 'replacement-clock',
    title: 'Reloj (Clock) y bits de referencia',
    shortDescription:
      'El algoritmo de reloj usa un puntero circular y bits de referencia para aproximar LRU.',
    longDescription:
      'Cada marco lleva un bit de referencia. El puntero avanza dando "segundas oportunidades" a las páginas referenciadas hasta encontrar una víctima sin acceso reciente.',
    category: 'reemplazo',
    observations: [
      'Las páginas referenciadas reciben un segundo turno antes de ser expulsadas.',
      'Es una aproximación práctica a LRU sin colas costosas.',
      'Observa cómo el puntero recorre los marcos en cada fallo.',
    ],
    recommendedRoute: '/reemplazo',
    sizing: { min: 1, max: 4, default: 2, unit: 'procesos' },
    buildProcesses: (size) => {
      const total = clamp(size, 1, 4)
      const seeds: ProcessSeed[] = []
      for (let i = 1; i <= total; i++) {
        seeds.push({
          pid: i,
          arrivalTime: 0,
          burstTime: 14,
          priority: 1,
          numPages: 5,
        })
      }
      return makeProcesses(seeds)
    },
    memory: () => ({ totalMemory: 16, pageSize: 4, frames: 4 }),
    replacement: { algorithm: 'clock' },
  },
]

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id)
}

export function getProcessesForPreset(preset: Preset, size?: number): Process[] {
  const target = size ?? preset.sizing.default
  return preset.buildProcesses(clamp(target, preset.sizing.min, preset.sizing.max))
}

export function getMemoryForPreset(
  preset: Preset,
  size?: number,
): PresetMemoryConfig | undefined {
  if (!preset.memory) return undefined
  const target = size ?? preset.sizing.default
  return preset.memory(clamp(target, preset.sizing.min, preset.sizing.max))
}
