import _ from 'lodash'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'
import { Text } from 'transliteration/domain/text'
import Sign from 'signs/domain/Sign'

export class AnnotationToken {
  constructor(
    readonly value: string,
    readonly path: readonly number[],
    readonly enabled: boolean,
    readonly sign: Sign | null = null
  ) {}

  isInAnnotationTokens(annotation: readonly Annotation[]): boolean {
    return Boolean(
      _.find(annotation, (singleAnnotation) =>
        _.isEqual(singleAnnotation.data.path, this.path)
      )
    )
  }

  hasMatchingPath(annotation: RawAnnotation | readonly Annotation[]): boolean {
    return _.isEqual(this.path, (annotation as RawAnnotation).data?.path)
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
  text: Text
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return text.lines.map((line, lineNumber) => [
    new AnnotationToken(line.prefix, [lineNumber], false),
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index])
    ),
  ])
}
