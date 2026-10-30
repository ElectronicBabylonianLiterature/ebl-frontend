function sourceIndex(line: { readonly index?: number }): number {
  return line.index !== undefined &&
    Number.isSafeInteger(line.index) &&
    line.index >= 0
    ? line.index
    : Number.POSITIVE_INFINITY
}

export default function sortFragmentQueryPreviewLines<
  Line extends { readonly index?: number },
>(lines: readonly Line[]): Line[] {
  return [...lines].sort((first, second) => {
    const firstIndex = sourceIndex(first)
    const secondIndex = sourceIndex(second)
    return firstIndex === secondIndex ? 0 : firstIndex - secondIndex
  })
}
