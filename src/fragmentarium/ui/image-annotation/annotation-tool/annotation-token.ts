import _ from 'lodash'
import Annotation, {
  AnnotationTokenType,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
import {
  CompoundGrapheme,
  NamedSign,
  Token,
} from 'transliteration/domain/token'
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
  static initActive(
    value: string,
    type:
      | AnnotationTokenType.HasSign
      | AnnotationTokenType.Number
      | AnnotationTokenType.PartiallyBroken
      | AnnotationTokenType.CompoundGrapheme
      | AnnotationTokenType.SurfaceAtLine
      | AnnotationTokenType.RulingDollarLine,
    displayValue: string,
    path: readonly number[],
    name = '',
    subIndex: number | null = null
  ): AnnotationToken {
    return new AnnotationToken(
      value,
      type,
      displayValue,
      path,
      true,
      null,
      name,
      subIndex
    )
  }
  static initDeactive(
    displayValue: string,
    type:
      | AnnotationTokenType.CompletelyBroken
      | AnnotationTokenType.Blank
      | AnnotationTokenType.Disabled,
    path: readonly number[]
  ): AnnotationToken {
    return new AnnotationToken('', type, displayValue, path, false)
  }
  static blank(): AnnotationToken {
    return new AnnotationToken('', AnnotationTokenType.Blank, 'blank', [], true)
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

function tokenToAnnotationToken(
  token: Token,
  path: readonly number[]
): AnnotationToken {
  switch (token.type) {
    case 'Reading':
    case 'Logogram':
    case 'Number': {
      const namedSign = token as NamedSign
      const partEnclosures = namedSign.nameParts.map(
        (part) => part.enclosureType
      )
      const completelyBroken = _.intersection(...partEnclosures).includes(
        'BROKEN_AWAY'
      )
      const partiallyBroken =
        _.union(...partEnclosures).includes('BROKEN_AWAY') && !completelyBroken

      if (completelyBroken) {
        return AnnotationToken.initDeactive(
          '',
          AnnotationTokenType.CompletelyBroken,
          path
        )
      } else {
        return AnnotationToken.initActive(
          token.cleanValue,
          partiallyBroken
            ? AnnotationTokenType.PartiallyBroken
            : token.type === 'Number'
            ? AnnotationTokenType.Number
            : AnnotationTokenType.HasSign,
          token.value,
          path,
          namedSign.name,
          namedSign.subIndex
        )
      }
    }
    default: {
      const compoundGrapheme = token as CompoundGrapheme
      if (compoundGrapheme.enclosureType.includes('BROKEN_AWAY')) {
        return AnnotationToken.initDeactive(
          '',
          AnnotationTokenType.CompletelyBroken,
          path
        )
      } else {
        return AnnotationToken.initActive(
          token.cleanValue,
          AnnotationTokenType.CompoundGrapheme,
          token.value,
          path,
          token.cleanValue,
          1
        )
      }
    }
  }
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (
    ['Reading', 'Logogram', 'CompoundGrapheme', 'Number'].includes(token.type)
  ) {
    return tokenToAnnotationToken(token, path)
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    if (token.enclosureType.includes('BROKEN_AWAY')) {
      return AnnotationToken.initDeactive(
        '',
        AnnotationTokenType.CompletelyBroken,
        path
      )
    } else {
      return AnnotationToken.initDeactive(
        token.value,
        AnnotationTokenType.Disabled,
        path
      )
    }
  }
}

function structureLineToTokens(
  line: AbstractLine,
  lineNumber: number
): readonly AnnotationToken[] {
  const results: AnnotationToken[] = [
    AnnotationToken.initDeactive(line.prefix, AnnotationTokenType.Disabled, [
      lineNumber,
    ]),
  ]
  if (line instanceof SurfaceAtLine) {
    results.push(
      AnnotationToken.initActive(
        line.label.surface,
        AnnotationTokenType.SurfaceAtLine,
        line.label.surface.toLowerCase(),
        [lineNumber, 0]
      )
    )
  } else if (line instanceof RulingDollarLine) {
    results.push(
      new AnnotationToken(
        line.number,
        AnnotationTokenType.RulingDollarLine,
        `${line.number.toLowerCase()} ruling`,
        [lineNumber, 0],
        true
      )
    )
  } else {
    results.push(
      ...line.content.flatMap((token, index) =>
        mapToken(token, [lineNumber, index])
      )
    )
  }
  return results
}

export function createAnnotationTokens(
  text: Text
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return text.lines.map((line, lineNumber) => [
    ...structureLineToTokens(line, lineNumber),
  ])
}
