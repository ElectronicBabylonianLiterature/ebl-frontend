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

  attachSign(sign: Sign): AnnotationToken {
    return new AnnotationToken(
      this.value,
      this.type,
      this.displayValue,
      this.path,
      this.enabled,
      sign,
      this.name,
      this.subIndex
    )
  }

  static blank(): AnnotationToken {
    return new AnnotationToken('', AnnotationTokenType.Blank, 'blank', [], true)
  }
  static disabled(value, path): AnnotationToken {
    return new AnnotationToken(
      value,
      AnnotationTokenType.Disabled,
      value,
      path,
      false
    )
  }
  static brokenAway(value, path): AnnotationToken {
    return new AnnotationToken(
      value,
      AnnotationTokenType.BrokenAway,
      '',
      path,
      false
    )
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

function matchTokenType(tokenType: string): AnnotationTokenType {
  switch (tokenType) {
    case 'Reading':
    case 'Logogram':
      return AnnotationTokenType.HasSign
    case 'Number':
      return AnnotationTokenType.Number
    case 'CompoundGrapheme':
      return AnnotationTokenType.CompoundGrapheme
    default:
      throw Error(`'${tokenType}' has to be: 'Reading',
      'Logogram',
      'CompoundGrapheme' or
      'Number'`)
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
    if (token.type === AnnotationTokenType.BrokenAway) {
      return AnnotationToken.brokenAway(token.value, path)
    } else {
      const tokenName = 'name' in token ? token.name.toLowerCase() : ''
      const subIndex = tokenName
        ? ('subIndex' in token && token.subIndex) || 1
        : null

      return new AnnotationToken(
        token.value,
        matchTokenType(token.type),
        token.value,
        path,
        true,
        null,
        tokenName,
        subIndex
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
        AnnotationTokenType.SurfaceAtLine,
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
        AnnotationTokenType.RulingDollarLine,
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
