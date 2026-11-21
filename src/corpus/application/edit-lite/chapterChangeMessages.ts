function reloadMessage(change: string): string {
  return `${change} since it was loaded. Reload the chapter and apply your changes again.`
}

export const lineChangedOnServerMessage = reloadMessage(
  'This line has changed on the server',
)

export const chapterChangedMessage = reloadMessage(
  'The chapter was changed by someone else',
)

export function numberedLineChangedMessage(lineNumber: string): string {
  return reloadMessage(`Line ${lineNumber} has changed on the server`)
}

export const lineNotReturnedMessage =
  'The line was not returned by the data source.'

export const annotationsNotAvailableMessage =
  'Alignment and lemmatization are not available: this chapter was loaded as a read-only ATF snapshot without tokens.'
