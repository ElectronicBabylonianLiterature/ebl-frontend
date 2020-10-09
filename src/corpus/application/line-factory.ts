import { createLine, createManuscriptLine, Line } from 'corpus/domain/text'

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
          number: nextNumber(lastLine.number),
          reconstruction: defaultReconstruction,
          manuscripts: lastLine.manuscripts.map((manuscript) =>
            createManuscriptLine({
              manuscriptId: manuscript.manuscriptId,
              labels: manuscript.labels,
              number: nextNumber(manuscript.number),
            })
          ),
        })
    : () => createLine({ reconstruction: defaultReconstruction })
}
