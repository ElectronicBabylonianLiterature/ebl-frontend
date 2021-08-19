import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'

export class AnnotationToken {
  readonly value: string
  readonly path: readonly number[]
  readonly cleanValue: string
  readonly enabled: boolean

  constructor(
    value: string,
    path: readonly number[],
    cleanValue: string,
    enabled: boolean
  ) {
    this.value = value
    this.path = path
    this.cleanValue = cleanValue
    this.enabled = enabled
  }

  hasMatchingPath(annotation: RawAnnotation): boolean {
    return _.isEqual(this.path, annotation.data?.path)
  }
}

function mapToken(
  token: Token,
  path: readonly number[],
  cleanValue: string
): AnnotationToken | AnnotationToken[] {
  if (['Reading', 'Logogram', 'CompoundGrapheme'].includes(token.type)) {
    return new AnnotationToken(token.value, path, cleanValue, true)
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index], part.cleanValue)
    )
  } else {
    return new AnnotationToken(token.value, path, cleanValue, false)
  }
}

export function createAnnotationTokens(
  fragment: Fragment
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return fragment.text.lines.map((line, lineNumber) => [
    new AnnotationToken(line.prefix, [lineNumber], '', false),
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index], token.cleanValue)
    ),
  ])
}
