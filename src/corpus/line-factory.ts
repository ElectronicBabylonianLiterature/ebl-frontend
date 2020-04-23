import { createLine, createManuscriptLine } from './text'

function nextNumber(number) {
  const match = /^(?<number>\d+)(?<prime>')?$/.exec(number)
  if (match && match.groups) {
    const value = Number(match.groups.number)
    const prime = match.groups.prime || ''
    return `${value + 1}${prime}`
  } else {
    return ''
  }
}

export function createDefaultLineFactory(lastLine: any = null) {
  return lastLine
    ? () =>
        createLine({
          number: nextNumber(lastLine.number),
          manuscripts: lastLine.manuscripts.map((manuscript) =>
            createManuscriptLine({
              manuscriptId: manuscript.manuscriptId,
              labels: manuscript.labels,
              number: nextNumber(manuscript.number),
            })
          ),
        })
    : () => createLine({})
}
