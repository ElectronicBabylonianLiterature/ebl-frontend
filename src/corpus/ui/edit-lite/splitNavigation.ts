const pageStep = 10

type KeyTarget = (index: number, lastIndex: number) => number

const keyTargets: ReadonlyMap<string, KeyTarget> = new Map<string, KeyTarget>([
  ['ArrowUp', (index) => index - 1],
  ['ArrowDown', (index) => index + 1],
  ['PageUp', (index) => index - pageStep],
  ['PageDown', (index) => index + pageStep],
  ['Home', () => 0],
  ['End', (_index, lastIndex) => lastIndex],
])

export function findKeyTarget(
  key: string,
  index: number,
  lastIndex: number,
): number | null {
  return keyTargets.get(key)?.(index, lastIndex) ?? null
}

export function revealOption(list: HTMLElement | null, index: number): void {
  const option = list?.children.item(index)
  if (list && option) {
    const visibleTop = list.getBoundingClientRect().top + list.clientTop
    const visibleBottom = visibleTop + list.clientHeight
    const { top, bottom } = option.getBoundingClientRect()
    list.scrollTop +=
      Math.min(top - visibleTop, 0) + Math.max(bottom - visibleBottom, 0)
  }
}
