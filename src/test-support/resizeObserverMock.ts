import { act } from '@testing-library/react'

export class MockResizeObserver implements ResizeObserver {
  static instances: MockResizeObserver[] = []

  readonly callback: ResizeObserverCallback
  readonly observedElements: Element[] = []

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    MockResizeObserver.instances.push(this)
  }

  observe(element: Element): void {
    this.observedElements.push(element)
  }

  unobserve(element: Element): void {
    this.observedElements.splice(this.observedElements.indexOf(element), 1)
  }

  disconnect(): void {
    this.observedElements.length = 0
  }
}

export function installMockResizeObserver(): void {
  MockResizeObserver.instances = []
  window.ResizeObserver = MockResizeObserver
}

export function uninstallMockResizeObserver(): void {
  Reflect.deleteProperty(window, 'ResizeObserver')
}

export function resizeObservedElements(): void {
  act(() => {
    MockResizeObserver.instances
      .filter((observer) => observer.observedElements.length > 0)
      .forEach((observer) => observer.callback([], observer))
  })
}
