import type { CasoPrueba, EjercicioDetail } from '@/types/api';

export interface ExerciseGuideExample {
  input: string;
  outputEsperado: string;
  inputInline: string;
  outputInline: string;
}

export interface ExerciseGuideModel {
  titulo: string;
  descripcion: string;
  lenguaje: string;
  entradaTexto: string;
  salidaTexto: string;
  editorTexto: string;
  pruebaTexto: string;
  stdinHint: string;
  ejemplo?: ExerciseGuideExample;
}

// Patrón Builder:
// Construye la guía visual del ejercicio paso a paso desde los datos del backend.
// Así la pantalla no mezcla reglas de presentación con el renderizado de React.
export class ExerciseGuideBuilder {
  private readonly guide: ExerciseGuideModel;

  private constructor(ejercicio: EjercicioDetail) {
    this.guide = {
      titulo: ejercicio.titulo,
      descripcion: ejercicio.descripcion,
      lenguaje: ejercicio.lenguaje,
      entradaTexto: 'Los datos llegan por input(). No escribas el valor dentro del código.',
      salidaTexto: 'Imprime solo la respuesta final con print(). Respeta mayúsculas, minúsculas y espacios.',
      editorTexto: 'Completa la solución respetando exactamente el formato de salida de los casos de prueba.',
      pruebaTexto: 'Cada input de prueba se envía automáticamente a tu programa cuando presionas Probar.',
      stdinHint: 'Tu input aquí',
    };
  }

  static create(ejercicio: EjercicioDetail) {
    return new ExerciseGuideBuilder(ejercicio);
  }

  withExample(caso?: CasoPrueba) {
    if (caso) {
      this.guide.ejemplo = {
        input: caso.input || '(vacío)',
        outputEsperado: caso.outputEsperado || '(vacío)',
        inputInline: toInline(caso.input),
        outputInline: toInline(caso.outputEsperado),
      };
    }
    return this;
  }

  withLanguageRules() {
    if (this.guide.lenguaje.toLowerCase().startsWith('py')) {
      this.guide.editorTexto = 'Usa input() para leer la entrada y print() para mostrar la salida.';
      this.guide.pruebaTexto = 'Cada input de prueba se envía automáticamente a tu programa. Tu código debe leerlo con input() y mostrar el resultado con print().';
    }
    return this;
  }

  /**
   * Analiza el input del primer caso de prueba y genera textos de ayuda
   * específicos al formato real de la entrada (una línea / varias líneas).
   */
  withSmartInputHint() {
    const input = this.guide.ejemplo?.input ?? '';
    const isPy = this.guide.lenguaje.toLowerCase().startsWith('py');
    if (!isPy || !input) return this;

    const hasNewlines = input.includes('\n');
    const hasSpaces   = input.trim().includes(' ');

    if (hasNewlines) {
      const lineCount = input.split('\n').length;
      this.guide.entradaTexto =
        `Los datos llegan en ${lineCount} líneas separadas. Usa input() una vez por cada valor.`;
      this.guide.stdinHint = input;
    } else if (hasSpaces) {
      this.guide.entradaTexto =
        'Todos los valores llegan en UNA sola línea separados por espacios. ' +
        'Léelos con input() y sepáralos con .split().';
      this.guide.editorTexto =
        'Usa input().split() para obtener todos los valores de una sola vez. ' +
        'Si son números, conviértelos con int() o map(int, ...).';
      this.guide.stdinHint = input;
    } else {
      this.guide.entradaTexto =
        'El dato llega por input(). Lee un solo valor y conviértelo al tipo que necesites.';
      this.guide.stdinHint = input;
    }

    return this;
  }

  build(): ExerciseGuideModel {
    return { ...this.guide, ejemplo: this.guide.ejemplo ? { ...this.guide.ejemplo } : undefined };
  }
}

function toInline(value: string): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > 24 ? `${clean.slice(0, 24)}…` : clean || '(vacío)';
}
