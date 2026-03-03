const markableClass = 'markable'

function getTokenId(node: Node | null): string | null {
  if (!node) {
    return null
  }

  const element = node instanceof Element ? node : node.parentElement
  const tokenNode = element?.closest(`.${markableClass}`)

  if (tokenNode) {
    return tokenNode.getAttribute('data-id')
  }

  const sibling =
    element?.previousElementSibling?.closest(`.${markableClass}`) ||
    element?.nextElementSibling?.closest(`.${markableClass}`)

  return sibling ? sibling.getAttribute('data-id') : null
}

function getBoundaryFromRange(
  selection: Selection,
): readonly [string | null, string | null] | null {
  if (
    typeof selection.rangeCount !== 'number' ||
    selection.rangeCount < 1 ||
    typeof selection.getRangeAt !== 'function'
  ) {
    return null
  }

  const range = selection.getRangeAt(0)

  return [getTokenId(range.startContainer), getTokenId(range.endContainer)]
}

function getSelectionBoundaries(
  selection: Selection,
): readonly [string, string] | null {
  const start = getTokenId(selection.anchorNode)
  const end = getTokenId(selection.focusNode)
  if (start && end) {
    return [start, end]
  }

  const rangeBoundary = getBoundaryFromRange(selection)
  if (rangeBoundary && rangeBoundary[0] && rangeBoundary[1]) {
    return [rangeBoundary[0], rangeBoundary[1]]
  }

  return null
}

function expandSelection(
  start: string,
  end: string,
  words: readonly string[],
): readonly string[] {
  const startPosition = words.indexOf(start)
  const endPosition = words.indexOf(end)

  if (startPosition < 0 || endPosition < 0) {
    return []
  }

  const [startIndex, endIndex] = [startPosition, endPosition].sort(
    (left, right) => left - right,
  )

  return words.slice(startIndex, endIndex + 1)
}

export function getSelectedTokens(words: readonly string[]): readonly string[] {
  const selection = document.getSelection()
  if (!selection) {
    return []
  }

  const boundaries = getSelectionBoundaries(selection)

  return boundaries ? expandSelection(boundaries[0], boundaries[1], words) : []
}
