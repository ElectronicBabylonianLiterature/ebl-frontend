type IntersectionCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void

export class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = []

  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  readonly callback: IntersectionCallback
  readonly observedElements: Element[] = []

  constructor(callback: IntersectionCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe(element: Element): void {
    this.observedElements.push(element)
  }

  unobserve(element: Element): void {
    const index = this.observedElements.indexOf(element)
    if (index !== -1) {
      this.observedElements.splice(index, 1)
    }
  }

  disconnect(): void {
    this.observedElements.length = 0
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

export function installMockIntersectionObserver(): void {
  MockIntersectionObserver.instances = []
  window.IntersectionObserver =
    MockIntersectionObserver as typeof IntersectionObserver
}

export function triggerIntersection(
  visibility: {
    readonly id: string
    readonly isIntersecting: boolean
    readonly top?: number
  }[],
): void {
  const observer =
    MockIntersectionObserver.instances[
      MockIntersectionObserver.instances.length - 1
    ]
  const entries = visibility.map(
    ({ id, isIntersecting, top = 0 }) =>
      ({
        target: { id } as Element,
        isIntersecting,
        boundingClientRect: { top } as DOMRectReadOnly,
      }) as IntersectionObserverEntry,
  )
  observer.callback(entries, observer)
}
