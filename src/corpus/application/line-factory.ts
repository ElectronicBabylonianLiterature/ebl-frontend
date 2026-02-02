import {
  createLine,
  createVariant,
  createManuscriptLine,
  Line,
  EditStatus,
} from 'corpus/domain/line'

function nextNumber(number: string): string {
  const match = /^(\d+)(')?$/.exec(number)
  if (match) {
    const value = Number(match[1])
    const prime = match[2] || ''
    return `${value + 1}${prime}`
  } else {
    return ''
  }
}

const defaultReconstruction = '%n '

export function createDefaultLineFactory(
  lastLine: Line | null = null,
): () => Line {
  return lastLine
    ? () =>
        createLine({
          number: nextNumber(lastLine.number),
          variants: lastLine.variants.map((variant) =>
            createVariant({
              reconstruction: defaultReconstruction,
              manuscripts: variant.manuscripts.map((manuscript) =>
                createManuscriptLine({
                  manuscriptId: manuscript.manuscriptId,
                  labels: manuscript.labels,
                  number: nextNumber(manuscript.number),
                }),
              ),
            }),
          ),
          status: EditStatus.NEW,
        })
    : () =>
        createLine({
          variants: [createVariant({ reconstruction: defaultReconstruction })],
          status: EditStatus.NEW,
        })
}
