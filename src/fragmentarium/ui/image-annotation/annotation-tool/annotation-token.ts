import _ from 'lodash'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { Token } from 'transliteration/domain/token'
import { Text } from 'transliteration/domain/text'
import Sign from 'signs/domain/Sign'
import { RulingDollarLine } from 'transliteration/domain/dollar-lines'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { SurfaceAtLine } from 'transliteration/domain/at-lines'

export type AnnotationTokenType =
  | 'Reading'
  | 'Logogram'
  | 'CompoundGrapheme'
  | 'Number'
  | 'SurfaceAtLine'
  | 'RulingDollarLine'
  | 'Blank'
  | 'Disabled'
  | 'Broken'
  | 'Predicted'
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
    ['Reading', 'Logogram', 'CompoundGrapheme', 'Number'].includes(token.type)
  ) {
    return new AnnotationToken(
      token.value,
      // @ts-ignore
      token.type,
      token.value,
      path,
      true,
      null,
      'name' in token ? token.name : '',
      'subIndex' in token ? token.subIndex : null
    )
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return AnnotationToken.disabled(token.value, path)
  }
}

function structureTokens(
  line: AbstractLine,
  lineNumber: number
): readonly AnnotationToken[] {
  if (line instanceof SurfaceAtLine) {
    return [
      AnnotationToken.disabled(line.prefix, [lineNumber]),
      new AnnotationToken(
        line.label.surface.toLowerCase(),
        'SurfaceAtLine',
        line.label.surface.toLowerCase(),
        [lineNumber],
        true
      ),
    ]
  } else if (line instanceof RulingDollarLine) {
    return [
      AnnotationToken.disabled(line.prefix, [lineNumber]),
      new AnnotationToken(
        line.number.toLowerCase(),
        'RulingDollarLine',
        `${line.number.toLowerCase()} ruling`,
        [lineNumber],
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
  console.log(text.lines)
  return text.lines.map((line, lineNumber) => structureTokens(line, lineNumber))
}
