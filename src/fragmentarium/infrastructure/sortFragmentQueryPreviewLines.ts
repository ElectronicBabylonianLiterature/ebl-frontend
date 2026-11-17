import isNonNegativeInteger from 'common/utils/isNonNegativeInteger'

function sourceIndex(line: { readonly index?: number }): number {
  return isNonNegativeInteger(line.index)
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
