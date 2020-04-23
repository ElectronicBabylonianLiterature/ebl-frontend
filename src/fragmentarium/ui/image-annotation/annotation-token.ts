import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'fragmentarium/domain/token'

export class AnnotationToken {
  readonly value: string
  readonly path: readonly number[]
  readonly enabled: boolean

  constructor(value: string, path: readonly number[], enabled: boolean) {
    this.value = value
    this.path = path
    this.enabled = enabled
  }

  hasMatchingPath(annotation: RawAnnotation): boolean {
    return _.isEqual(this.path, annotation.data?.path)
  }
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (['Reading', 'Logogram', 'CompoundGrapheme'].includes(token.type)) {
    return new AnnotationToken(token.value, path, true)
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return new AnnotationToken(token.value, path, false)
  }
}

export function createAnnotationTokens(
  fragment: Fragment
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return fragment.text.lines.map((line, lineNumber) => [
    new AnnotationToken(line.prefix, [lineNumber], false),
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index])
    ),
  ])
}
