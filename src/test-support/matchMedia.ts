export function createMatchMedia(
  preferReducedMotion: boolean,
): (query: string) => MediaQueryList {
  return (query: string): MediaQueryList =>
    ({
      matches:
        preferReducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as MediaQueryList
}

export function setReducedMotionMatchMedia(
  preferReducedMotion: boolean,
): () => void {
  const originalMatchMedia = window.matchMedia

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: createMatchMedia(preferReducedMotion),
  })

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: originalMatchMedia,
    })
  }
}
