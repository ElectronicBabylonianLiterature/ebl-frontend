import _ from 'lodash'
import Annotation, {
  AnnotationTokenType,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'
import { Text } from 'transliteration/domain/text'
import Sign from 'signs/domain/Sign'
import { RulingDollarLine } from 'transliteration/domain/dollar-lines'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { SurfaceAtLine } from 'transliteration/domain/at-lines'

export class AnnotationToken {
  constructor(
    readonly value: string,
    readonly type: AnnotationTokenType,
    readonly displayValue: string,
    readonly path: readonly number[],
    readonly enabled: boolean,
    readonly sign: Sign | null = null,
    readonly name: string = '',
    readonly subIndex: number | null = null
  ) {}

  static blank(): AnnotationToken {
    return new AnnotationToken('', 'Blank', 'blank', [], true)
  }
  static disabled(value, path): AnnotationToken {
    return new AnnotationToken(value, 'Disabled', value, path, false)
  }
  static brokenAway(value, path): AnnotationToken {
    return new AnnotationToken(value, 'BrokenAway', '', path, false)
  }

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

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (
    [
      'Reading',
      'Logogram',
      'CompoundGrapheme',
      'Number',
      'BrokenAway',
    ].includes(token.type)
  ) {
    if ('BrokenAway' == token.type) {
      return AnnotationToken.brokenAway(token.value, path)
    } else {
      return new AnnotationToken(
        token.value,
        token.type as AnnotationTokenType,
        token.value,
        path,
        true,
        null,
        'name' in token ? token.name : '',
        'subIndex' in token ? token.subIndex : null
      )
    }
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return AnnotationToken.disabled(token.value, path)
  }
}

function structureLineToTokens(
  line: AbstractLine,
  lineNumber: number
): readonly AnnotationToken[] {
  if (line instanceof SurfaceAtLine) {
    return [
      AnnotationToken.disabled(line.prefix, [lineNumber]),
      new AnnotationToken(
        line.label.surface,
        'SurfaceAtLine',
        line.label.surface.toLowerCase(),
        [lineNumber, 0],
        true
      ),
    ]
  } else if (line instanceof RulingDollarLine) {
    return [
      AnnotationToken.disabled(line.prefix, [lineNumber]),
      new AnnotationToken(
        line.number,
        'RulingDollarLine',
        `${line.number.toLowerCase()} ruling`,
        [lineNumber, 0],
        true
      ),
    ]
  } else {
    return [
      AnnotationToken.disabled(line.prefix, [lineNumber]),
      ...line.content.flatMap((token, index) =>
        mapToken(token, [lineNumber, index])
      ),
    ]
  }
}

export function createAnnotationTokens(
  text: Text
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return text.lines.map((line, lineNumber) => [
    ...structureLineToTokens(line, lineNumber),
  ])
}
