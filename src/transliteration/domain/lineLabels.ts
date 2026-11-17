import { AbstractLine } from 'transliteration/domain/abstract-line'
import {
  defaultLabels,
  Labels,
  labelsAbbreviation,
  createLineAnchorId,
} from 'transliteration/domain/labels'
import { TextLine } from 'transliteration/domain/text-line'
import {
  isColumnAtLine,
  isSealAtLine,
  isObjectAtLine,
  isSurfaceAtLine,
  isTextLine,
} from 'transliteration/domain/type-guards'

export function createTextLineId(
  labels: Labels | undefined,
  line: TextLine,
): string {
  return createLineAnchorId(
    labels ? [labelsAbbreviation(labels)] : [],
    line.lineNumber,
  )
}

function clearSeal(labels: Labels): Labels {
  return labels.sealNumber == null ? labels : { ...labels, sealNumber: null }
}

export function getCurrentLabels(labels: Labels, line: AbstractLine): Labels {
  if (isObjectAtLine(line)) {
    return { ...clearSeal(labels), object: line.label }
  } else if (isSurfaceAtLine(line)) {
    return { ...clearSeal(labels), surface: line.label }
  } else if (isColumnAtLine(line)) {
    return { ...clearSeal(labels), column: line.label }
  } else if (isSealAtLine(line)) {
    return { ...labels, sealNumber: line.number }
  } else {
    return labels
  }
}

export function hasTextLineWithId(
  lines: readonly AbstractLine[],
  lineId: string,
): boolean {
  let labels = defaultLabels
  for (const line of lines) {
    if (isTextLine(line) && createTextLineId(labels, line) === lineId) {
      return true
    }
    labels = getCurrentLabels(labels, line)
  }
  return false
}
