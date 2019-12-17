import { Fragment } from 'fragmentarium/domain/fragment'

export interface AnnotationToken {
  value: string
  path: readonly number[]
  enabled: boolean
}

interface Token {
  type: string
  value: string
  parts?: readonly Token[]
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (['Reading', 'Logogram', 'CompoundGrapheme'].includes(token.type)) {
    return {
      value: token.value,
      path: path,
      enabled: true
    }
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return {
      value: token.value,
      path: path,
      enabled: false
    }
  }
}

export function createAnnotationTokens(
  fragment: Fragment
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return fragment.text.lines.map((line, lineNumber) => [
    {
      id: String(lineNumber),
      path: [lineNumber],
      value: line.prefix || '',
      enabled: false
    },
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index])
    )
  ])
}
