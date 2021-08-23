import _ from 'lodash'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'

interface Reading {
  name: string
  subIndex: number | null | undefined
}

export class AnnotationToken {
  readonly value: string
  readonly path: readonly number[]
  readonly reading: Reading | undefined
  readonly enabled: boolean

  constructor(
    value: string,
    path: readonly number[],
    enabled: boolean,
    reading: Reading | undefined = undefined
  ) {
    this.value = value
    this.path = path
    this.reading = reading
    this.enabled = enabled
  }

  hasMatchingPath(annotation: RawAnnotation | readonly Annotation[]): boolean {
    if (Array.isArray(annotation)) {
      return Boolean(
        _.find(annotation, (singleAnnotation) =>
          _.isEqual(singleAnnotation.data.path, this.path)
        )
      )
    } else {
      return _.isEqual(this.path, (annotation as RawAnnotation).data?.path)
    }
  }
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (token.type == 'Reading' || token.type == 'Logogram') {
    return new AnnotationToken(token.value, path, true, {
      name: token.name.toLowerCase(),
      subIndex: token.subIndex,
    })
  } else if (token.type == 'CompoundGrapheme') {
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
