import {
  createLine,
  createVariant,
  createManuscriptLine,
  Line,
  EditStatus,
} from 'corpus/domain/line'

function nextNumber(number: string): string {
  const match = /^(?<number>\d+)(?<prime>')?$/.exec(number)
  if (match && match.groups) {
    const value = Number(match.groups.number)
    const prime = match.groups.prime || ''
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
