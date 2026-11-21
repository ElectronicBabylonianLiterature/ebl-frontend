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
