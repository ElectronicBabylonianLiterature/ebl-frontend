import {
  createLine,
  createVariant,
  createManuscriptLine,
  Line,
} from 'corpus/domain/text'

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
  lastLine: Line | null = null
): () => Line {
  return lastLine
    ? () =>
        createLine({
          variants: lastLine.variants.map((variant) =>
            createVariant({
              number: nextNumber(variant.number),
              reconstruction: defaultReconstruction,
              manuscripts: variant.manuscripts.map((manuscript) =>
                createManuscriptLine({
                  manuscriptId: manuscript.manuscriptId,
                  labels: manuscript.labels,
                  number: nextNumber(manuscript.number),
                })
              ),
            })
          ),
        })
    : () =>
        createLine({
          variants: [createVariant({ reconstruction: defaultReconstruction })],
        })
}
