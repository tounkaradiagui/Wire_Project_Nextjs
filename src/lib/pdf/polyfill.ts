
const _marks = new Map<string, number>()

const perf = {
  now: () => Date.now(),
  mark: (name: string) => {
    _marks.set(name, Date.now())
  },
  measure: (name: string, start?: string, end?: string) => {
    // Ne rien faire — évite l'erreur "negative timestamp"
  },
  getEntriesByName: () => [],
  getEntriesByType: () => [],
  clearMarks: () => { _marks.clear() },
  clearMeasures: () => { },
}

if (typeof globalThis.performance === "undefined") {
  ; (globalThis as any).performance = perf
} else {
  // Patcher uniquement measure pour éviter l'erreur
  const originalMeasure = globalThis.performance.measure.bind(globalThis.performance)
  globalThis.performance.measure = (name: string, start?: any, end?: any) => {
    try {
      return originalMeasure(name, start, end)
    } catch {
      return {} as PerformanceMeasure
    }
  }
}