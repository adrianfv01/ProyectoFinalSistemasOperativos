# Teoría de Algoritmos de Planificación y Reemplazo

> Documento de estudio para el proyecto final de **Sistemas Operativos** (UDEM, Primavera 2026).
> Sirve como guion para que un asistente (por ejemplo, Claude) te explique cada algoritmo
> implementado en este simulador de manera ordenada, con definiciones, fórmulas, ejemplos y
> casos de uso.

---

## Cómo usar este documento con Claude

Copia este archivo completo en el chat y luego pídele cosas como:

- "Explícame la **Sección 1** con tus propias palabras y un ejemplo numérico nuevo."
- "Compara FCFS contra SJF en términos de tiempo de espera promedio."
- "Hazme un quiz de 10 preguntas sobre algoritmos de reemplazo de páginas."
- "Dame una traza paso a paso de Round Robin con quantum 2 para los procesos
  P1(0,5), P2(1,3), P3(2,8)."

---

## Índice

1. [Conceptos previos](#1-conceptos-previos)
2. [Métricas de planificación](#2-métricas-de-planificación)
3. [Algoritmos de planificación de CPU](#3-algoritmos-de-planificación-de-cpu)
   - 3.1 [FCFS (First Come First Served)](#31-fcfs-first-come-first-served)
   - 3.2 [SJF (Shortest Job First)](#32-sjf-shortest-job-first)
   - 3.3 [SRTF (Shortest Remaining Time First)](#33-srtf-shortest-remaining-time-first)
   - 3.4 [HRRN (Highest Response Ratio Next)](#34-hrrn-highest-response-ratio-next)
   - 3.5 [Round Robin](#35-round-robin)
   - 3.6 [Prioridad expropiativa](#36-prioridad-expropiativa)
   - 3.7 [Cola multinivel](#37-cola-multinivel)
   - 3.8 [Cola multinivel con retroalimentación](#38-cola-multinivel-con-retroalimentación)
4. [Conceptos previos de memoria virtual](#4-conceptos-previos-de-memoria-virtual)
5. [Algoritmos de reemplazo de páginas](#5-algoritmos-de-reemplazo-de-páginas)
   - 5.1 [FIFO](#51-fifo)
   - 5.2 [LRU (Least Recently Used)](#52-lru-least-recently-used)
   - 5.3 [Óptimo (OPT / Belady)](#53-óptimo-opt--belady)
   - 5.4 [Reloj (Clock)](#54-reloj-clock)
   - 5.5 [Segunda oportunidad](#55-segunda-oportunidad)
6. [Comparativa rápida](#6-comparativa-rápida)
7. [Errores y trampas comunes](#7-errores-y-trampas-comunes)

---

## 1. Conceptos previos

Un **proceso** es un programa en ejecución. El sistema operativo lo describe con un **PCB**
(_Process Control Block_) que contiene, entre otras cosas:

- **PID**: identificador único.
- **Estado**: New, Ready, Running, Waiting, Terminated.
- **Tiempo de llegada** (_arrival time_): instante en el que el proceso entra al sistema.
- **Ráfaga de CPU** (_burst time_): tiempo total que necesita ejecutarse en CPU.
- **Prioridad**: valor numérico que indica preferencia (en este simulador, menor número
  significa mayor prioridad, lo cual es la convención más común).

El **planificador** (_scheduler_) decide qué proceso usa la CPU en cada instante. Hay tres
niveles clásicos:

| Nivel       | Decide cuándo                                                   |
|-------------|-----------------------------------------------------------------|
| Largo plazo | Admitir o no procesos al sistema.                              |
| Mediano     | Suspender o reanudar procesos (swap).                          |
| Corto plazo | Asignar la CPU al siguiente proceso de la cola de listos.      |

Este documento se concentra en el **planificador de corto plazo**.

Dos categorías importantes:

- **No expropiativo (_non-preemptive_)**: una vez que un proceso recibe la CPU la mantiene
  hasta que termina o se bloquea.
- **Expropiativo (_preemptive_)**: el sistema operativo puede quitarle la CPU al proceso en
  ejecución cuando ocurre algún evento (llegada de uno con mayor prioridad, fin de quantum,
  etc.).

---

## 2. Métricas de planificación

Para un proceso \(i\):

- **Tiempo de llegada** \(A_i\): cuando entra al sistema.
- **Tiempo de ráfaga** \(B_i\): CPU que requiere.
- **Tiempo de inicio** \(S_i\): primera vez que la CPU lo atiende.
- **Tiempo de finalización** \(F_i\): instante en el que termina.

Métricas derivadas:

| Métrica            | Fórmula                  | Significado                                        |
|--------------------|--------------------------|----------------------------------------------------|
| Tiempo de retorno  | \(T_i = F_i - A_i\)      | Cuánto tardó desde que llegó hasta que terminó.    |
| Tiempo de espera   | \(W_i = T_i - B_i\)      | Tiempo total parado en la cola de listos.          |
| Tiempo de respuesta| \(R_i = S_i - A_i\)      | Cuánto tardó en ser atendido por primera vez.      |

Promedios típicos:

\[
\bar{T} = \frac{1}{n}\sum_{i=1}^{n} T_i, \quad
\bar{W} = \frac{1}{n}\sum_{i=1}^{n} W_i, \quad
\bar{R} = \frac{1}{n}\sum_{i=1}^{n} R_i
\]

Otras métricas usadas en el simulador:

- **Throughput**: procesos terminados por unidad de tiempo.
- **Utilización de CPU**: fracción del tiempo en que la CPU está ocupada.
- **Cambios de contexto**: cuántas veces se reasignó la CPU a un proceso distinto.

---

## 3. Algoritmos de planificación de CPU

### 3.1 FCFS (First Come First Served)

- **Tipo**: no expropiativo.
- **Idea**: el primero que llega es el primero en ser atendido (cola FIFO).

**Ventajas**

- Muy simple de implementar.
- Justo en el sentido cronológico.

**Desventajas**

- **Efecto convoy**: un proceso largo retrasa a todos los cortos que llegaron después,
  lo que dispara el tiempo de espera promedio.
- Mal tiempo de respuesta para tareas interactivas.

**Ejemplo**

| Proceso | Llegada | Ráfaga |
|---------|---------|--------|
| P1      | 0       | 7      |
| P2      | 2       | 4      |
| P3      | 4       | 1      |

Orden de ejecución: P1 (0–7), P2 (7–11), P3 (11–12).
Tiempos de espera: P1 = 0, P2 = 5, P3 = 7. Promedio = 4.

---

### 3.2 SJF (Shortest Job First)

- **Tipo**: no expropiativo (en este simulador).
- **Idea**: cuando la CPU se libera, escoge entre los procesos **listos** el que tenga
  la menor ráfaga total.

**Ventajas**

- **Óptimo** en tiempo de espera promedio cuando todos los procesos están disponibles
  al mismo tiempo.

**Desventajas**

- Requiere conocer la ráfaga de antemano (en la práctica se estima).
- Riesgo de **inanición** (_starvation_): los procesos largos pueden no ejecutarse
  nunca si siempre llegan procesos cortos.

**Cómo se mitiga la inanición**: con _aging_ (envejecimiento), aumentando la prioridad
con el tiempo de espera.

---

### 3.3 SRTF (Shortest Remaining Time First)

- **Tipo**: expropiativo. Es la versión preemptiva de SJF.
- **Idea**: en cada instante, ejecuta el proceso cuyo **tiempo restante** sea el menor.
  Si llega uno con menos ráfaga restante que el actual, lo expropia.

**Ventajas**

- Aún mejor tiempo de espera promedio que SJF en cargas con llegadas dinámicas.

**Desventajas**

- Más cambios de contexto.
- Misma posibilidad de inanición que SJF.
- Necesita conocer o estimar el tiempo restante.

---

### 3.4 HRRN (Highest Response Ratio Next)

- **Tipo**: no expropiativo.
- **Idea**: cuando la CPU se libera, calcula para cada proceso listo el **response ratio**:

\[
RR = \frac{\text{tiempo de espera} + \text{ráfaga}}{\text{ráfaga}}
\]

y escoge el de mayor \(RR\).

**Ventajas**

- Combina lo mejor de SJF (favorece cortos) y FCFS (favorece a quien lleva mucho esperando).
- **Evita la inanición**: a mayor espera, mayor \(RR\), así que tarde o temprano se ejecuta.

**Desventajas**

- Requiere recalcular el ratio en cada decisión.
- Sigue necesitando conocer la ráfaga.

---

### 3.5 Round Robin

- **Tipo**: expropiativo.
- **Idea**: cada proceso recibe la CPU durante un **quantum** \(q\). Si no termina, se
  manda al final de la cola de listos y entra el siguiente.

**Ventajas**

- Excelente tiempo de respuesta, ideal para sistemas interactivos.
- No hay inanición.

**Desventajas**

- Muy sensible al valor del quantum:
  - **Quantum muy chico**: muchos cambios de contexto, sobrecarga.
  - **Quantum muy grande**: degenera en FCFS.
- Tiempo de retorno promedio puede ser peor que SJF/SRTF.

**Regla práctica**: que el quantum sea un poco mayor que el tiempo típico de una
interacción de usuario, normalmente entre 10 y 100 ms en sistemas reales.

---

### 3.6 Prioridad expropiativa

- **Tipo**: expropiativo.
- **Idea**: cada proceso tiene una **prioridad**. La CPU siempre ejecuta el proceso listo
  con mayor prioridad. Si llega uno con prioridad mayor que el actual, lo expropia.

**Ventajas**

- Permite reflejar la importancia real de cada tarea (tiempo real, sistema, usuario).

**Desventajas**

- **Inanición** de procesos de baja prioridad.
- **Inversión de prioridad**: un proceso de alta prioridad puede quedar bloqueado
  esperando un recurso que tiene uno de baja prioridad. Se mitiga con _priority
  inheritance_.

> **Convención del simulador**: número más bajo = prioridad más alta.

---

### 3.7 Cola multinivel

- **Tipo**: depende del nivel; el simulador permite configurar varias colas.
- **Idea**: dividir los procesos en **clases fijas** (por ejemplo: sistema, interactivos,
  por lotes), cada una con su **propia cola** y su **propio algoritmo** (RR para
  interactivos, FCFS para batch, etc.).
- Entre colas suele haber **prioridad estricta** (la cola superior se atiende primero) o
  **reparto de tiempo** (cada cola recibe un porcentaje).

**Ventajas**

- Diferencia bien entre tipos de carga.
- Permite combinar lo mejor de cada algoritmo.

**Desventajas**

- La asignación de proceso a cola es **fija**: si se equivoca, no hay forma de moverlo.
- Posible inanición de las colas inferiores.

---

### 3.8 Cola multinivel con retroalimentación

- **Tipo**: expropiativo.
- **Idea**: igual que la cola multinivel, pero los procesos pueden **subir o bajar de
  cola** según su comportamiento.
  - Si un proceso usa todo su quantum, baja a una cola con quantum mayor (se lo trata como
    CPU-bound).
  - Si un proceso libera la CPU antes de terminar el quantum (I/O-bound), se queda o sube.
- Suele usar quantums crecientes hacia abajo: por ejemplo \(q=8, 16, 32, \dots\).

**Ventajas**

- Se adapta dinámicamente al comportamiento real del proceso.
- Favorece a procesos cortos e interactivos sin necesidad de conocer la ráfaga.
- Se considera el algoritmo de propósito general más equilibrado.

**Desventajas**

- Configurar bien número de colas, quantums y reglas de promoción/degradación es difícil.
- Mayor complejidad de implementación.

---

## 4. Conceptos previos de memoria virtual

Antes de entrar a los algoritmos de reemplazo conviene tener claros estos términos:

- **Memoria virtual**: abstracción que da a cada proceso un espacio de direcciones propio,
  generalmente más grande que la RAM disponible.
- **Página**: bloque de tamaño fijo del espacio de direcciones virtual.
- **Marco** (_frame_): bloque de tamaño fijo de la memoria física, del mismo tamaño que
  una página.
- **Tabla de páginas**: estructura que asocia páginas virtuales con marcos físicos.
- **Cadena de referencias**: secuencia de páginas que un proceso accede a lo largo del
  tiempo. Es la entrada típica para evaluar un algoritmo de reemplazo.
- **Acierto** (_hit_): la página referenciada ya está en algún marco.
- **Fallo de página** (_page fault_): la página no está en RAM; hay que traerla de disco
  y, si no hay marcos libres, **reemplazar** alguna que ya esté.

Métricas relevantes:

- **Total de referencias** \(N\).
- **Total de fallos** \(F\).
- **Tasa de fallos**: \(F/N\).
- **Tasa de aciertos**: \(1 - F/N\).

**Anomalía de Belady**: en algunos algoritmos (como FIFO) puede ocurrir que aumentar el
número de marcos **incremente** el número de fallos en lugar de reducirlo.

---

## 5. Algoritmos de reemplazo de páginas

Para todos los ejemplos siguientes se usa la cadena de referencias clásica:

```
1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5
```

con **3 marcos** disponibles, salvo que se indique lo contrario.

### 5.1 FIFO

- **Idea**: la página que se reemplaza es la que **lleva más tiempo en memoria**, sin
  importar cuándo se usó por última vez.
- Implementación: cola FIFO de páginas cargadas.

**Ventajas**

- Sencillo y barato de implementar (cola simple).

**Desventajas**

- Puede expulsar páginas que se siguen usando.
- Sufre la **anomalía de Belady**.

**Ejemplo (3 marcos)**: 9 fallos sobre la cadena de arriba.

---

### 5.2 LRU (Least Recently Used)

- **Idea**: reemplaza la página que **hace más tiempo no se usa**. Asume que el pasado
  reciente predice el futuro cercano (principio de localidad).

**Implementaciones típicas**

- **Lista enlazada con timestamps**: cada acceso mueve la página al frente.
- **Contador o reloj lógico**: en cada acceso se anota el "tiempo".
- **Bits de referencia con muestreo periódico**.

**Ventajas**

- Aproxima muy bien al óptimo en cargas con buena localidad.
- No sufre la anomalía de Belady (es un algoritmo de pila).

**Desventajas**

- Implementación pura es costosa: requiere actualizar estructura en **cada** acceso.
- En hardware, suele aproximarse con Clock o Second Chance.

---

### 5.3 Óptimo (OPT / Belady)

- **Idea**: reemplaza la página que **no se va a usar durante el mayor tiempo en el
  futuro**.

**Ventajas**

- Es el algoritmo que **minimiza** el número de fallos. Se usa como cota inferior teórica.

**Desventajas**

- **Irrealizable en la práctica**: requiere conocer el futuro.
- Solo sirve como referencia para evaluar otros algoritmos.

---

### 5.4 Reloj (Clock)

- **Idea**: aproximación eficiente de LRU. Las páginas se organizan en un **arreglo
  circular**. Cada página tiene un **bit de referencia** \(R\):
  - En cada acceso, \(R\) se pone a 1.
  - Al necesitar reemplazo, un puntero recorre el círculo:
    - Si \(R = 0\), esa página se reemplaza y el puntero avanza.
    - Si \(R = 1\), se pone \(R = 0\) y se avanza al siguiente.

**Ventajas**

- Mucho más barato que LRU puro.
- Buena aproximación a LRU en la práctica.

**Desventajas**

- Si todas las páginas tienen \(R = 1\), puede dar una vuelta completa antes de elegir.
- No distingue entre páginas leídas y modificadas (la versión "Clock mejorado"
  añade el bit de _modified_).

---

### 5.5 Segunda oportunidad

- **Idea**: variante de FIFO que usa el bit de referencia.
- Cuando hay que reemplazar:
  - Se mira la página al frente de la cola.
  - Si su bit \(R = 0\), se reemplaza.
  - Si \(R = 1\), se "perdona": se pone \(R = 0\), se mueve al final de la cola y se
    revisa la siguiente.

> Conceptualmente, **Clock es la versión circular y eficiente de Segunda oportunidad**.

**Ventajas**

- Mejora claramente a FIFO sin cambiar mucho su estructura.

**Desventajas**

- Si todas las páginas tienen \(R = 1\), degenera a FIFO recorriendo toda la cola.

---

## 6. Comparativa rápida

### Planificación

| Algoritmo               | Expropiativo | Necesita ráfaga | Riesgo de inanición | Fortaleza principal               |
|-------------------------|:------------:|:---------------:|:-------------------:|-----------------------------------|
| FCFS                    | No           | No              | No                  | Simplicidad                       |
| SJF                     | No           | Sí              | Sí                  | Mínima espera promedio (estática) |
| SRTF                    | Sí           | Sí              | Sí                  | Mínima espera promedio (dinámica) |
| HRRN                    | No           | Sí              | No                  | Equilibra cortos y antiguos       |
| Round Robin             | Sí           | No              | No                  | Tiempo de respuesta               |
| Prioridad expropiativa  | Sí           | No              | Sí                  | Refleja importancia               |
| Cola multinivel         | Depende      | No              | Sí                  | Separa clases de carga            |
| Cola multinivel con FB  | Sí           | No              | Bajo                | Adaptación dinámica               |

### Reemplazo de páginas

| Algoritmo            | Costo de implementación | Aprovecha localidad | Anomalía de Belady |
|----------------------|:-----------------------:|:-------------------:|:------------------:|
| FIFO                 | Muy bajo                | No                  | **Sí**             |
| LRU                  | Alto (puro)             | Sí                  | No                 |
| Óptimo               | Imposible en la práctica| Sí (perfectamente)  | No                 |
| Reloj                | Bajo                    | Sí (aproximado)     | No                 |
| Segunda oportunidad  | Bajo                    | Sí (aproximado)     | Posible            |

---

## 7. Errores y trampas comunes

1. **Confundir tiempo de espera con tiempo de retorno**.
   - Espera = tiempo en cola de listos.
   - Retorno = espera + ejecución.
2. **Olvidar que SJF y SRTF necesitan conocer la ráfaga**. En sistemas reales se estima con
   promedios exponenciales.
3. **Asumir que más marcos siempre mejoran FIFO**. Falso por la anomalía de Belady.
4. **Tratar Round Robin como justo para tiempo de retorno**. Es justo para tiempo de
   respuesta; el retorno puede ser peor que en SJF.
5. **Confundir prioridad mayor con número mayor**. Conviene fijar y respetar una
   convención (en este simulador, número menor = prioridad mayor).
6. **No distinguir Clock de Segunda oportunidad**. Hacen lo mismo conceptualmente, pero
   Clock está implementado como buffer circular y es más eficiente.
7. **Comparar algoritmos con cargas distintas**. Para que la comparación sea válida hay
   que usar la **misma cadena de referencias** o el **mismo conjunto de procesos**.

---

## Plantilla de preguntas para Claude

Pega también esto en el chat para dirigir la explicación:

```
Eres mi tutor de Sistemas Operativos. A partir del documento que te pasé:

1. Hazme un resumen de 1 párrafo por algoritmo, en lenguaje sencillo.
2. Para cada algoritmo de planificación, dame una traza de Gantt con
   estos procesos: P1(0,6), P2(1,4), P3(2,2), P4(3,3) y, cuando aplique,
   quantum = 2 o prioridades P1=2, P2=1, P3=3, P4=2.
3. Para cada algoritmo de reemplazo, simula la cadena
   7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1 con 3 marcos y reporta
   el total de fallos.
4. Termina con un quiz de 10 preguntas y sus respuestas al final.
```
