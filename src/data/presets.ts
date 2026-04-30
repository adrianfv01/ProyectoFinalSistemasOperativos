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

export interface Preset {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  category: PresetCategory
  observations: string[]
  recommendedRoute: PresetRoute
  processes: Process[]
  memory?: PresetMemoryConfig
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

export const PRESETS: Preset[] = [
  {
    id: 'fcfs-convoy',
    title: 'Efecto convoy con FCFS',
    shortDescription:
      'Un proceso largo llega primero y bloquea a tres procesos cortos detrás de él.',
    longDescription:
      'FCFS atiende los procesos en el orden estricto de llegada. Cuando el primero es muy largo, los procesos cortos se acumulan y esperan mucho tiempo, lo que dispara el promedio de espera.',
    category: 'planificacion',
    observations: [
      'P1 ocupa la CPU por completo durante sus 10 unidades de ráfaga.',
      'P2, P3 y P4 esperan aunque tienen ráfagas mínimas.',
      'El tiempo de espera promedio crece de forma desproporcionada.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 10, priority: 1, numPages: 3 },
      { pid: 2, arrivalTime: 1, burstTime: 1, priority: 1, numPages: 1 },
      { pid: 3, arrivalTime: 2, burstTime: 2, priority: 1, numPages: 1 },
      { pid: 4, arrivalTime: 3, burstTime: 1, priority: 1, numPages: 1 },
    ]),
    scheduling: { algorithm: 'fcfs', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'sjf-shortest-first',
    title: 'SJF: el más corto primero',
    shortDescription:
      'Cuatro procesos llegan al mismo tiempo y SJF los ordena por ráfaga creciente.',
    longDescription:
      'Con todas las llegadas simultáneas, SJF ofrece el menor tiempo de espera promedio posible. Compárelo con FCFS usando estos mismos procesos en el módulo de Comparación.',
    category: 'planificacion',
    observations: [
      'El orden de ejecución es P2 → P3 → P4 → P1, no por PID.',
      'Los procesos cortos terminan casi de inmediato.',
      'El tiempo de espera promedio cae respecto a FCFS.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 8, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 1, priority: 1, numPages: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 2, priority: 1, numPages: 1 },
      { pid: 4, arrivalTime: 0, burstTime: 3, priority: 1, numPages: 1 },
    ]),
    scheduling: { algorithm: 'sjf', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'srtf-preemption',
    title: 'SRTF expropia al llegar uno más corto',
    shortDescription:
      'Un proceso largo está corriendo y otro mucho más corto lo desaloja apenas llega.',
    longDescription:
      'SRTF (Shortest Remaining Time First) es la versión expropiativa de SJF. Cada vez que llega un proceso con menor tiempo restante, interrumpe al actual.',
    category: 'planificacion',
    observations: [
      'P1 inicia, pero P2 lo desaloja en t=2 y P3 desaloja a P2 en t=4.',
      'El Gantt muestra cambios de contexto en cada llegada.',
      'Los procesos cortos terminan rápido pese a llegar tarde.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 7, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 2, burstTime: 4, priority: 1, numPages: 1 },
      { pid: 3, arrivalTime: 4, burstTime: 1, priority: 1, numPages: 1 },
    ]),
    scheduling: { algorithm: 'srtf', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'round-robin-fairness',
    title: 'Round Robin: equidad y cambios de contexto',
    shortDescription:
      'Cuatro procesos similares se reparten la CPU en rebanadas de quantum 2.',
    longDescription:
      'Round Robin garantiza que ningún proceso espere más de (n−1) × quantum entre turnos. Cambie el quantum a 1 o a 5 para sentir el costo de los cambios de contexto.',
    category: 'planificacion',
    observations: [
      'Cada proceso obtiene rebanadas iguales hasta que se completa.',
      'Hay muchos cambios de contexto cuando el quantum es pequeño.',
      'El tiempo de respuesta es bajo y muy parecido entre procesos.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 5, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 1, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 3, arrivalTime: 2, burstTime: 6, priority: 1, numPages: 2 },
      { pid: 4, arrivalTime: 3, burstTime: 5, priority: 1, numPages: 2 },
    ]),
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
      'En este simulador, una prioridad menor (número) significa mayor prioridad. P1 tiene prioridad 10 y queda al final de la fila siempre que llegue otro proceso con prioridad menor.',
    category: 'planificacion',
    observations: [
      'P1 (prioridad 10) apenas avanza durante toda la simulación.',
      'P3 y P4 (prioridad 1) corren primero aunque llegan después.',
      'Es el escenario clásico para justificar el envejecimiento (aging).',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 8, priority: 10, numPages: 2 },
      { pid: 2, arrivalTime: 1, burstTime: 4, priority: 3, numPages: 2 },
      { pid: 3, arrivalTime: 2, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 4, arrivalTime: 5, burstTime: 3, priority: 1, numPages: 1 },
    ]),
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
      'El Highest Response Ratio Next calcula (espera + ráfaga) / ráfaga. Los procesos largos que han esperado mucho ganan prioridad de manera natural.',
    category: 'planificacion',
    observations: [
      'Los procesos cortos se atienden rápido.',
      'El proceso largo no se queda atrás indefinidamente.',
      'Es una alternativa cooperativa a SJF para evitar inanición.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 10, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 1, burstTime: 1, priority: 1, numPages: 1 },
      { pid: 3, arrivalTime: 2, burstTime: 2, priority: 1, numPages: 1 },
      { pid: 4, arrivalTime: 3, burstTime: 4, priority: 1, numPages: 1 },
      { pid: 5, arrivalTime: 5, burstTime: 1, priority: 1, numPages: 1 },
    ]),
    scheduling: { algorithm: 'hrrn', config: { numCores: 1, parallelism: 'real' } },
  },
  {
    id: 'mlfq-mixed-workload',
    title: 'Cola multinivel con retroalimentación',
    shortDescription:
      'Procesos de distintas prioridades se reparten en tres colas con quantum creciente.',
    longDescription:
      'Las colas de mayor prioridad usan quantum corto (interactivas) y las de menor prioridad usan quantum largo (lotes). Si un proceso agota su quantum, baja de nivel.',
    category: 'planificacion',
    observations: [
      'Los procesos prioridad 1 corren primero con quantum 2.',
      'Los procesos prioridad 2 corren después con quantum 4.',
      'El proceso de prioridad baja queda al final, en quantum 8.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 6, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 3, arrivalTime: 1, burstTime: 5, priority: 2, numPages: 2 },
      { pid: 4, arrivalTime: 1, burstTime: 6, priority: 2, numPages: 2 },
      { pid: 5, arrivalTime: 2, burstTime: 8, priority: 3, numPages: 2 },
    ]),
    scheduling: {
      algorithm: 'multilevelFeedback',
      config: { quantumPerLevel: [2, 4, 8], numCores: 1, parallelism: 'real' },
    },
  },
  {
    id: 'multicore-parallel',
    title: 'Multinúcleo: paralelismo real con 4 cores',
    shortDescription:
      'Seis procesos similares se reparten en cuatro núcleos ejecutándose en paralelo.',
    longDescription:
      'Cambia entre paralelismo real y simulado para comparar. En modo real, varios procesos ejecutan a la vez; en modo simulado se intercalan en un solo timeline.',
    category: 'multinucleo',
    observations: [
      'Cada núcleo tiene su propio carril en el Gantt.',
      'El tiempo total se reduce respecto a un solo núcleo.',
      'La utilización de CPU sube hacia el 100 % cuando hay trabajo suficiente.',
    ],
    recommendedRoute: '/planificacion',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 6, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 5, priority: 1, numPages: 2 },
      { pid: 3, arrivalTime: 0, burstTime: 7, priority: 1, numPages: 2 },
      { pid: 4, arrivalTime: 1, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 5, arrivalTime: 2, burstTime: 6, priority: 1, numPages: 2 },
      { pid: 6, arrivalTime: 3, burstTime: 5, priority: 1, numPages: 2 },
    ]),
    scheduling: {
      algorithm: 'roundRobin',
      config: { quantum: 2, numCores: 4, parallelism: 'real' },
    },
  },
  {
    id: 'fork-tree',
    title: 'Árbol de procesos con fork',
    shortDescription:
      'Un proceso padre crea dos hijos y uno de esos hijos crea un nieto.',
    longDescription:
      'Recrea la jerarquía típica al llamar a fork() en POSIX. Los hijos heredan ráfaga, prioridad, páginas e hilos del padre.',
    category: 'procesos',
    observations: [
      'P1 es el padre raíz; P2 y P3 son hijos directos.',
      'P4 es nieto de P1 a través de P2.',
      'Cada hijo conserva las propiedades del padre en el momento del fork.',
    ],
    recommendedRoute: '/procesos',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 2, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2, parentPid: 1 },
      { pid: 3, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2, parentPid: 1 },
      { pid: 4, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2, parentPid: 2 },
    ]),
  },
  {
    id: 'threads-shared-pages',
    title: 'Hilos compartiendo páginas',
    shortDescription:
      'Un proceso pesado tiene tres hilos que comparten su espacio de direcciones.',
    longDescription:
      'Los hilos del mismo proceso comparten las mismas páginas, por eso el cambio de contexto entre hilos del mismo proceso es más barato que entre procesos.',
    category: 'procesos',
    observations: [
      'P1 tiene 3 hilos (T1, T2, T3) con sus propias ráfagas.',
      'Los tres hilos referencian las mismas páginas del proceso.',
      'El planificador trata cada hilo como una unidad ejecutable.',
    ],
    recommendedRoute: '/procesos',
    processes: makeProcesses([
      {
        pid: 1,
        arrivalTime: 0,
        burstTime: 6,
        priority: 1,
        numPages: 4,
        threads: [
          { tid: 1, burstTime: 4 },
          { tid: 2, burstTime: 3 },
          { tid: 3, burstTime: 5 },
        ],
      },
      { pid: 2, arrivalTime: 1, burstTime: 3, priority: 1, numPages: 2 },
    ]),
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
      'Memoria total 64 KB con páginas de 8 KB (8 marcos). Los procesos consumen marcos completos aunque no usen todo su contenido.',
    category: 'memoria',
    observations: [
      'Cada proceso recibe marcos contiguos en la cuadrícula.',
      'Si un proceso pide menos memoria que un marco completo, se desperdicia.',
      'La tabla de páginas muestra qué marco recibe cada página de cada PID.',
    ],
    recommendedRoute: '/memoria',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 3 },
      { pid: 2, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 3, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 2 },
      { pid: 4, arrivalTime: 0, burstTime: 4, priority: 1, numPages: 1 },
    ]),
    memory: { totalMemory: 64, pageSize: 8, frames: 8 },
  },
  {
    id: 'replacement-fifo-cycle',
    title: 'FIFO con ciclo de páginas',
    shortDescription:
      'Un único proceso recorre cinco páginas en ciclo dentro de tres marcos.',
    longDescription:
      'Cuando la cadena de referencias es cíclica y supera los marcos disponibles, FIFO genera fallo en cada acceso. Es el peor caso clásico para FIFO.',
    category: 'reemplazo',
    observations: [
      'Cada nueva página expulsa a la más vieja en orden de llegada.',
      'La línea de tiempo se llena de fallos en rojo.',
      'Compárelo con LRU usando los mismos procesos.',
    ],
    recommendedRoute: '/reemplazo',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 18, priority: 1, numPages: 5 },
    ]),
    memory: { totalMemory: 64, pageSize: 4, frames: 3 },
    replacement: { algorithm: 'fifo' },
  },
  {
    id: 'replacement-lru-locality',
    title: 'LRU aprovecha la localidad temporal',
    shortDescription:
      'Dos procesos con buena localidad muestran cómo LRU mantiene en memoria lo recién usado.',
    longDescription:
      'LRU expulsa la página menos recientemente usada. En cargas con localidad temporal, conserva en memoria las páginas que vuelven a aparecer pronto.',
    category: 'reemplazo',
    observations: [
      'LRU mantiene en memoria las páginas con accesos recientes.',
      'Los aciertos crecen frente a FIFO en cargas con localidad.',
      'Cambie a FIFO en el selector y reejecute para comparar.',
    ],
    recommendedRoute: '/reemplazo',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 8, priority: 1, numPages: 3 },
      { pid: 2, arrivalTime: 0, burstTime: 8, priority: 1, numPages: 3 },
    ]),
    memory: { totalMemory: 32, pageSize: 4, frames: 4 },
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
      'Úselo como referencia para evaluar FIFO, LRU y Reloj.',
      'Cambie de algoritmo en el selector y reejecute.',
    ],
    recommendedRoute: '/reemplazo',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 12, priority: 1, numPages: 4 },
      { pid: 2, arrivalTime: 0, burstTime: 8, priority: 1, numPages: 3 },
    ]),
    memory: { totalMemory: 32, pageSize: 4, frames: 4 },
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
      'Observe cómo el puntero recorre los marcos en cada fallo.',
    ],
    recommendedRoute: '/reemplazo',
    processes: makeProcesses([
      { pid: 1, arrivalTime: 0, burstTime: 14, priority: 1, numPages: 5 },
    ]),
    memory: { totalMemory: 16, pageSize: 4, frames: 4 },
    replacement: { algorithm: 'clock' },
  },
]

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id)
}
