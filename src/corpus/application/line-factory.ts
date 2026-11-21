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

function nextFreeNumber(
  number: string,
  takenNumbers: readonly string[],
): string {
  let proposal = nextNumber(number)
  while (proposal !== '' && takenNumbers.includes(proposal)) {
    proposal = nextNumber(proposal)
  }
  return proposal
}

const defaultReconstruction = '%n '

export function createDefaultLineFactory(
  lastLine: Line | null = null,
  takenNumbers: readonly string[] = [],
): () => Line {
  return lastLine
    ? () =>
        createLine({
          number: nextFreeNumber(lastLine.number, takenNumbers),
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
