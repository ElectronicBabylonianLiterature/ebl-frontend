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

  static blank(): AnnotationToken {
    return new AnnotationToken('', AnnotationTokenType.Blank, 'blank', [], true)
  }
  static disabled(
    displayValue: string,
    path: readonly number[]
  ): AnnotationToken {
    return new AnnotationToken(
      '',
      AnnotationTokenType.Disabled,
      displayValue,
      path,
      false
    )
  }
  static completelyBroken(path: readonly number[]): AnnotationToken {
    return new AnnotationToken(
      '',
      AnnotationTokenType.CompletelyBroken,
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

function tokenToAnnotationToken(
  token: Token,
  path: readonly number[]
): AnnotationToken {
  if (['Reading', 'Logogram', 'Number'].includes(token.type)) {
    const namedSign = token as NamedSign
    const partEnclosures = namedSign.nameParts.map((part) => part.enclosureType)
    const completelyBroken = _.intersection(...partEnclosures).includes(
      'BROKEN_AWAY'
    )
    const partiallyBroken =
      _.union(...partEnclosures).includes('BROKEN_AWAY') && !completelyBroken
    if (completelyBroken) {
      return AnnotationToken.completelyBroken(path)
    } else if (partiallyBroken) {
      return new AnnotationToken(
        token.cleanValue,
        AnnotationTokenType.PartiallyBroken,
        token.value,
        path,
        true,
        null,
        namedSign.name,
        namedSign.subIndex
      )
    } else {
      return new AnnotationToken(
        token.cleanValue,
        token.type === 'Number'
          ? AnnotationTokenType.Number
          : AnnotationTokenType.HasSign,
        token.value,
        path,
        true,
        null,
        namedSign.name,
        namedSign.subIndex
      )
    }
  } else {
    const compoundGrapheme = token as CompoundGrapheme
    if (compoundGrapheme.enclosureType.includes('BROKEN_AWAY')) {
      return AnnotationToken.completelyBroken(path)
    } else {
      return new AnnotationToken(
        token.cleanValue,
        AnnotationTokenType.CompoundGrapheme,
        token.value,
        path,
        true,
        null,
        token.cleanValue,
        1
      )
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
      return AnnotationToken.completelyBroken(path)
    } else {
      return AnnotationToken.disabled(token.value, path)
    }
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
