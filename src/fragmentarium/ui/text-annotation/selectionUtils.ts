const markableClass = 'markable'

function sortSelection(
  selection: readonly string[],
  words: readonly string[],
): readonly string[] {
  return [...new Set(selection)].sort(
    (left, right) => words.indexOf(left) - words.indexOf(right),
  )
}

function getSelectionRange(selection: Selection): Range | null {
  if (
    typeof selection.rangeCount !== 'number' ||
    selection.rangeCount < 1 ||
    typeof selection.getRangeAt !== 'function'
  ) {
    return null
  }

  const range = selection.getRangeAt(0)

  return range.collapsed ? null : range
}

function getTokenId(
  node: Node | null,
  includeSiblingFallback: boolean,
): string | null {
  if (!node) {
    return null
  }

  const element = node instanceof Element ? node : node.parentElement
  const tokenNode = element?.closest(`.${markableClass}`)

  if (tokenNode) {
    return tokenNode.getAttribute('data-id')
  }

  if (!includeSiblingFallback) {
    return null
  }

  const sibling =
    element?.previousElementSibling?.closest(`.${markableClass}`) ||
    element?.nextElementSibling?.closest(`.${markableClass}`)

  return sibling ? sibling.getAttribute('data-id') : null
}

function resolveSelectionFromNodes(
  startNode: Node | null,
  endNode: Node | null,
  words: readonly string[],
  includeSiblingFallback: boolean,
): readonly string[] {
  const startTokenId = getTokenId(startNode, includeSiblingFallback)
  const endTokenId = getTokenId(endNode, includeSiblingFallback)

  if (!startTokenId || !endTokenId) {
    return []
  }

  return expandSelection(startTokenId, endTokenId, words)
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

function getTokensFromRange(range: Range): readonly string[] {
  if (typeof range.intersectsNode !== 'function') {
    return []
  }

  const nodes = document.querySelectorAll<HTMLElement>(
    `.${markableClass}[data-id]`,
  )

  return Array.from(nodes)
    .filter((node) => {
      try {
        return range.intersectsNode(node)
      } catch {
        return false
      }
    })
    .map((node) => node.getAttribute('data-id'))
    .filter((id): id is string => !!id)
}

export function getSelectedTokens(words: readonly string[]): readonly string[] {
  const selection = document.getSelection()
  if (!selection) {
    return []
  }

  const includeSiblingFallback = !selection.isCollapsed
  const directSelection = resolveSelectionFromNodes(
    selection.anchorNode,
    selection.focusNode,
    words,
    includeSiblingFallback,
  )

  if (directSelection.length > 0) {
    return directSelection
  }

  const range = getSelectionRange(selection)
  if (!range) {
    return []
  }

  const intersectedTokens = sortSelection(getTokensFromRange(range), words)
  if (intersectedTokens.length > 0) {
    return intersectedTokens
  }

  const includeRangeSiblingFallback = !selection.isCollapsed || !range.collapsed

  return resolveSelectionFromNodes(
    range.startContainer,
    range.endContainer,
    words,
    includeRangeSiblingFallback,
  )
}
