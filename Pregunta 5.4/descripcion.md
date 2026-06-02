# 5.4 Patrones de diseño aplicados — Cardly

---

## 1. Decorator (`01_decorator.puml`)

**Descripción:** Añade responsabilidades adicionales a un objeto de forma dinámica, sin modificar su clase base.

**Aporte al proyecto:** El runner de Python (`pythonRunner.ts`) necesitaba medir tiempos y normalizar el stdin sin contaminar la lógica de ejecución. El patrón Decorator permite encadenar `TimingDecorator → StdinNormalizerDecorator → BasePythonRunner` de forma composable.

**Participantes:**
- **Component:** `IPythonRunner` — interfaz `run(code, stdin)`
- **ConcreteComponent:** `BasePythonRunner` — delega en Pyodide/WebAssembly
- **Decorator:** `RunnerDecorator` — clase abstracta que envuelve un `IPythonRunner`
- **ConcreteDecorators:** `TimingDecorator` (añade `elapsedMs`), `StdinNormalizerDecorator` (recorta espacios)
- **Cliente:** `createDefaultRunner()` ensambla la cadena; `ResolverPage` la consume

**Diagrama:** `01_decorator.puml`

---

## 2. Builder (`02_builder.puml`)

**Descripción:** Separa la construcción de un objeto complejo de su representación, permitiendo el mismo proceso de construcción para distintas representaciones.

**Aporte al proyecto:** La guía visual del ejercicio (panel izquierdo) requería analizar el formato de los casos de prueba, el lenguaje y el ejemplo para generar textos específicos. `ExerciseGuideBuilder` construye `ExerciseGuideModel` paso a paso con métodos encadenables, manteniendo el JSX limpio de lógica de presentación.

**Participantes:**
- **Builder:** `ExerciseGuideBuilder` — métodos `withExample()`, `withLanguageRules()`, `withSmartInputHint()`, `build()`
- **Product:** `ExerciseGuideModel` — objeto plano con todos los textos calculados
- **Director:** `ResolverPage` — llama al builder en `useMemo` y consume el producto
- **Input:** `EjercicioDetail` — datos crudos del backend

**Diagrama:** `02_builder.puml`

---

## 3. Factory (`03_factory.puml`)

**Descripción:** Define una interfaz para crear objetos, dejando a las subclases decidir qué clase instanciar. En este caso, Factory Method simple.

**Aporte al proyecto:** El panel de recompensas muestra distintos componentes visuales según el tipo de recompensa (puntos, monedas, carta). `RecompensaUIFactory` centraliza esa decisión; el cliente `RecompensaHint` solo itera la lista sin condicionales.

**Participantes:**
- **Creator/Factory:** `RecompensaUIFactory` — switch por `recompensa.tipo`
- **Products:** `PuntosRow`, `MonedasRow`, `CartaRow` — componentes React con iconos y colores propios
- **Cliente:** `RecompensaHint` — itera y delega la creación a la fábrica

**Diagrama:** `03_factory.puml`

---

## 4. Singleton (`04_singleton.puml`)

**Descripción:** Garantiza que una clase tenga una única instancia y proporciona un punto de acceso global a ella.

**Aporte al proyecto:** `PrismaClient` (conexión a PostgreSQL/Supabase) y `EventEmitter` (bus de eventos) deben existir como instancias únicas en todo el servidor para evitar múltiples conexiones y múltiples buses.

**Participantes:**
- **Singleton 1:** `PrismaClient` — exportado por `lib/prisma.js`; Node.js cachea el módulo garantizando una sola instancia
- **Singleton 2:** `EventEmitter` — exportado por `lib/events.js` junto con el catálogo `EVENTS`
- **Clientes:** todos los servicios del backend que importan `prisma` o `events`

**Diagrama:** `04_singleton.puml`

---

## 5. Observer (`05_observer.puml`)

**Descripción:** Define una dependencia uno-a-muchos entre objetos, de modo que cuando uno cambia de estado, todos sus dependientes son notificados automáticamente.

**Aporte al proyecto:** Al completar un ejercicio, varios subsistemas deben reaccionar (otorgar recompensas, invalidar caché de ranking). El bus de eventos desacopla `ExerciseService` (publicador) de `RewardsListener` y `CachingRankingDecorator` (observadores).

**Participantes:**
- **Subject:** `EventEmitter` — bus de eventos central (`lib/events.js`)
- **Publisher:** `ExerciseService` — emite `EXERCISE_COMPLETED` tras un intento
- **Observers:** `RewardsListener` (otorga recompensas), `CachingRankingDecorator` (invalida caché)
- **Evento:** `EVENTS.EXERCISE_COMPLETED` con payload `{ usuarioId, ejercicioId, correcto }`

**Diagrama:** `05_observer.puml`

---

## 6. Facade (`06_facade.puml`)

**Descripción:** Proporciona una interfaz simplificada a un conjunto de interfaces de un subsistema complejo.

**Aporte al proyecto:** Procesar un intento de ejercicio implica calcular recompensas, actualizar puntos, actualizar racha y asignar cartas. `RewardsFacade` unifica todas esas operaciones en una sola llamada `applyAttemptOutcome()`, ocultando la complejidad a `ExerciseService`.

**Participantes:**
- **Facade:** `RewardsFacade` — método `applyAttemptOutcome(params)`
- **Subsistemas:** `RewardService`, `UserProgressService`, `CardService`
- **Cliente:** `ExerciseService` — hace una sola llamada a la fachada

**Diagrama:** `06_facade.puml`

---

## 7. Repository (`07_repository.puml`)

**Descripción:** Abstrae el acceso a la fuente de datos detrás de una interfaz orientada a colecciones, separando la lógica de negocio del acceso a datos.

**Aporte al proyecto:** Los servicios del backend no interactúan con Prisma directamente. Cada repositorio (`ExerciseRepository`, `UserRepository`, `CardRepository`) encapsula las consultas a PostgreSQL y expone `withClient(tx?)` para soporte de transacciones atómicas.

**Participantes:**
- **Repositories:** `ExerciseRepository`, `UserRepository`, `CardRepository`
- **ORM:** Prisma — traduce llamadas del repositorio a SQL
- **Base de datos:** PostgreSQL en Supabase
- **Clientes:** los servicios de negocio (`ExerciseService`, `RewardService`, etc.)

**Diagrama:** `07_repository.puml`

---

## 8. Strategy (`08_strategy.puml`)

**Descripción:** Define una familia de algoritmos, encapsula cada uno y los hace intercambiables. Permite que el algoritmo varíe independientemente de los clientes que lo usan.

**Aporte al proyecto:** El validador de respuestas del backend necesitaba soportar dos modos de corrección: comparar el texto del código (`tipo: 'codigo'`) o comparar los outputs reales de ejecución (`tipo: 'output'`). Con el patrón Strategy cada modo es una clase independiente; agregar un nuevo tipo de validación no requiere modificar el contexto ni los existentes.

**Participantes:**
- **Strategy (interfaz):** `IValidationStrategy` — método abstracto `validar({ respuesta, ejercicio })`
- **ConcreteStrategy 1:** `CodigoValidationStrategy` — normaliza el código del alumno (elimina comentarios y espacios) y lo compara contra `solucionesCodigo[]`
- **ConcreteStrategy 2:** `OutputValidationStrategy` — compara los outputs reales de ejecución contra `casosPrueba[].outputEsperado`, acepta `string` o `string[]`
- **Context:** `validarRespuesta()` en `validador.js` — selecciona la estrategia del mapa `estrategias[tipo]` y delega la validación
- **Client:** `ExerciseService` — llama a `validarRespuesta()` con `tipo: 'output'` (modo principal)

**Diagrama:** `08_strategy.puml`

---

## 9. Factory Method 2 (`09_factory2.puml`)

**Descripción:** Define una interfaz para crear objetos, pero deja que las subclases decidan qué clase instanciar. La fábrica encapsula la lógica de creación y el cliente trabaja solo con la interfaz del producto.

**Aporte al proyecto:** Al resolver un ejercicio correctamente, el sistema debe aplicar distintos tipos de recompensa (puntos, monedas, cartas). `RewardFactory.create()` decide qué objeto instanciar según `recompensa.tipo`, y `rewardService` solo llama `reward.apply()` sin conocer la implementación concreta. Agregar un nuevo tipo de recompensa requiere únicamente una nueva clase y una línea en el switch, sin modificar el servicio.

**Participantes:**
- **Product (base):** `Reward` — clase abstracta con método `apply({ tx, usuarioId, ejercicio })` y helper `_applyIncrement()` compartido por puntos y monedas
- **ConcreteProducts:** `PointsReward` (incrementa puntos), `CoinsReward` (incrementa monedas), `CardReward` (asigna carta aleatoria y emite eventos), `NullReward` (Null Object para tipos desconocidos — no produce efectos)
- **Creator/Factory:** `RewardFactory` — método estático `create(recompensa)` con switch por `recompensa.tipo`
- **Client:** `rewardService.js` — itera las recompensas del ejercicio, crea cada una con la fábrica y llama `apply()`

**Diferencia con Factory 1:** La Factory 1 (frontend) crea **componentes visuales** para mostrar recompensas en la UI. Esta Factory 2 (backend) crea **objetos de negocio** que aplican los efectos reales en la base de datos. Mismo dominio, capas distintas.

**Diagrama:** `09_factory2.puml`
