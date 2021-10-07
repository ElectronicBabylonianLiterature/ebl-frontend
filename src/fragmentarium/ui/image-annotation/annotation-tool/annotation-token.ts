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

  isPathInAnnotations(annotation: readonly Annotation[]): boolean {
    return Boolean(
      _.find(annotation, (singleAnnotation) =>
        _.isEqual(singleAnnotation.data.path, this.path)
      )
    )
  }

  isEqualPath(annotation: RawAnnotation | null): boolean {
    return _.isEqual(this.path, annotation?.data?.path)
  }
}

export class AnnotationToken_ extends AnnotationToken {
  constructor(
    readonly value: string,
    readonly path: readonly number[],
    readonly enabled: boolean,
    readonly name: string = '',
    readonly subIndex: number | null = null,
    readonly sign: Sign | null = null
  ) {
    super(value, path, enabled, sign)
    this.name = name
    this.subIndex = subIndex
  }
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken_ | AnnotationToken_[] {
  if (['Reading', 'Logogram', 'CompoundGrapheme'].includes(token.type)) {
    return new AnnotationToken_(
      token.value,
      path,
      true,
      'name' in token ? token.name : '',
      'subIndex' in token ? token.subIndex : null
    )
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return new AnnotationToken_(
      token.value,
      path,
      false,
      'name' in token ? token.name : '',
      'subIndex' in token ? token.subIndex : null
    )
  }
}

export function createAnnotationTokens(
  text: Text
): ReadonlyArray<ReadonlyArray<AnnotationToken_>> {
  return text.lines.map((line, lineNumber) => [
    new AnnotationToken_(line.prefix, [lineNumber], false),
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index])
    ),
  ])
}
