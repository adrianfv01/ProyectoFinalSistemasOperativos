export const COMMON = {
  back: 'Atrás',
  next: 'Siguiente',
  finish: 'Terminar capítulo',
  goFreeMode: 'Continuar en modo libre',
  exitGuide: 'Salir de la guía',
  exitConfirm: '¿Salir de la guía? Tu progreso se guarda automáticamente.',
  startGuide: 'Empezar guía',
  blockedAddProcesses: 'Agrega al menos un proceso para continuar.',
  blockedPickAlgo: 'Elige un algoritmo para continuar.',
  blockedPickReplacement: 'Elige un algoritmo de reemplazo para continuar.',
  glossaryTitle: 'En palabras simples',
  insightTitle: 'Lo que acabas de ver',
  tipTitle: 'Tip rápido',
} as const

export const ANALOGIES = {
  process: {
    title: 'Un proceso es como un encargo en la cocina',
    body: 'Imagina una cocina con un solo cocinero (la CPU). Cada pedido que entra es un proceso: lleva un nombre, un tiempo en que llegó y cuánto tarda en prepararse.',
  },
  scheduling: {
    title: 'Planificar es decidir a quién atender primero',
    body: 'Si llegan varios clientes al mismo tiempo, ¿a quién atiende el cajero? Las reglas que usa son los algoritmos de planificación.',
  },
  memory: {
    title: 'La memoria es un estacionamiento',
    body: 'Cada cajón vacío es un marco. Los autos que llegan son las páginas. Si un proceso necesita 4 autos, ocupa 4 cajones.',
  },
  replacement: {
    title: 'La mochila ya está llena',
    body: 'Tu mochila solo tiene cierto espacio. Si quieres meter algo nuevo, tienes que decidir qué sacas. Eso hacen los algoritmos de reemplazo.',
  },
} as const

export const ALGO_DESCRIPTIONS = {
  fcfs: {
    name: 'FCFS',
    fullName: 'Primero en llegar, primero en ser atendido',
    motto: 'El que llegó antes, va primero.',
    pros: 'Justo y muy fácil de entender.',
    cons: 'Si el primero tarda mucho, todos esperan.',
  },
  sjf: {
    name: 'SJF',
    fullName: 'El trabajo más corto primero',
    motto: 'Los rápidos pasan antes que los lentos.',
    pros: 'Reduce el tiempo de espera promedio.',
    cons: 'Los procesos largos pueden quedarse al final por mucho tiempo.',
  },
  roundRobin: {
    name: 'Round Robin',
    fullName: 'Por turnos iguales',
    motto: 'Cada quien tiene su turnito de la CPU.',
    pros: 'Nadie espera demasiado, muy justo.',
    cons: 'Genera más cambios de contexto.',
  },
} as const

export const REPL_DESCRIPTIONS = {
  fifo: {
    name: 'FIFO',
    fullName: 'Primero en entrar, primero en salir',
    motto: 'Sale la página que tiene más rato cargada.',
    pros: 'Simple y predecible.',
    cons: 'Puede sacar páginas que aún se usan mucho.',
  },
  lru: {
    name: 'LRU',
    fullName: 'La menos usada recientemente',
    motto: 'Sale la que llevas más tiempo sin tocar.',
    pros: 'Aprovecha el patrón real de uso.',
    cons: 'Más costoso de implementar en hardware.',
  },
  optimal: {
    name: 'Óptimo',
    fullName: 'El que adivina el futuro',
    motto: 'Saca la página que tardará más en volver a usarse.',
    pros: 'Da la menor cantidad de fallos posible.',
    cons: 'No es realista: necesita conocer el futuro.',
  },
} as const

export const GLOSSARY = {
  pid: 'Identificador único de cada proceso (Process ID).',
  arrivalTime: 'Momento en el que el proceso llega a la cola.',
  burstTime: 'Tiempo total de CPU que necesita el proceso para terminar.',
  quantum: 'Tiempo máximo que cada proceso puede usar la CPU por turno.',
  page: 'Bloque de tamaño fijo en el que se divide la memoria de un proceso.',
  frame: 'Espacio físico en RAM del mismo tamaño que una página.',
  pageFault: 'Cuando un proceso pide una página que no está cargada en memoria.',
  hit: 'Cuando la página solicitada ya está cargada en memoria.',
  contextSwitch: 'Guardar el estado de un proceso y cargar el de otro.',
  fragmentation: 'Memoria reservada que queda sin aprovechar dentro de una página.',
} as const
