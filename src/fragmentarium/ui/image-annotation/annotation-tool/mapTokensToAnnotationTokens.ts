import {
  CompoundGrapheme,
  effectiveEnclosure,
  isStrictlyPartiallyEnclosed,
  NamedSign,
  Token,
} from 'transliteration/domain/token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'
import { isNamedSign } from 'transliteration/domain/type-guards'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { ColumnAtLine, SurfaceAtLine } from 'transliteration/domain/at-lines'
import { RulingDollarLine } from 'transliteration/domain/dollar-lines'
import { Text } from 'transliteration/domain/text'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'

function typeToAnnotationTokenType(
  tokenType: string
): AnnotationTokenType.HasSign | AnnotationTokenType.Number {
  return tokenType === 'Number'
    ? AnnotationTokenType.Number
    : AnnotationTokenType.HasSign
}

function namedSignTokenToAnnotationToken(
  token: NamedSign,
  path: readonly number[]
): AnnotationToken {
  let tokenType: AnnotationTokenType
  if (effectiveEnclosure(token).includes('BROKEN_AWAY')) {
    return AnnotationToken.initDeactive(
      '',
      AnnotationTokenType.CompletelyBroken,
      path
    )
  } else if (token.flags.includes('#')) {
    tokenType = AnnotationTokenType.Damaged
  } else if (isStrictlyPartiallyEnclosed(token, 'BROKEN_AWAY')) {
    tokenType = AnnotationTokenType.PartiallyBroken
  } else {
    tokenType = typeToAnnotationTokenType(token.type)
  }
  return AnnotationToken.initActive(
    token.cleanValue,
    tokenType,
    token.value,
    path,
    token.name,
    token.subIndex
  )
}

function compoundGraphemeToAnnotationToken(
  token: CompoundGrapheme,
  path: readonly number[]
): AnnotationToken {
  const compoundGrapheme = token as CompoundGrapheme
  if (compoundGrapheme.enclosureType.includes('BROKEN_AWAY')) {
    return AnnotationToken.initDeactive(
      '',
      AnnotationTokenType.CompletelyBroken,
      path
    )
  } else {
    return AnnotationToken.initActive(
      compoundGrapheme.cleanValue,
      AnnotationTokenType.CompoundGrapheme,
      compoundGrapheme.value,
      path,
      compoundGrapheme.cleanValue,
      1
    )
  }
}

function unannotatableTokenToAnnotationToken(
  token: Token,
  path: readonly number[]
): AnnotationToken {
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

function tokenToAnnotationToken(
  token: Token,
  path: readonly number[]
): AnnotationToken {
  if ('sign' in token && token.sign) {
    return AnnotationToken.initFromTokenSign(
      token.cleanValue,
      token.value,
      path,
      token.sign.cleanValue
    )
  }
  if (isNamedSign(token)) {
    return namedSignTokenToAnnotationToken(token, path)
  }

  if (token.type === 'UnclearSign') {
    return AnnotationToken.unclear(path)
  }
  if (token.type === 'CompoundGrapheme') {
    const compoundGrapheme = token as CompoundGrapheme
    return compoundGraphemeToAnnotationToken(compoundGrapheme, path)
  } else {
    throw Error('Unknown token type')
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
      'UnclearSign',
    ].includes(token.type)
  ) {
    return tokenToAnnotationToken(token, path)
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return unannotatableTokenToAnnotationToken(token, path)
  }
}
function surfaceAtLineToAnnotationToken(
  line: SurfaceAtLine,
  path: readonly number[]
): AnnotationToken {
  return AnnotationToken.initActive(
    line.label.surface,
    AnnotationTokenType.SurfaceAtLine,
    line.label.surface.toLowerCase(),
    path
  )
}
function columnAtLineToAnnotationToken(
  line: ColumnAtLine,
  path: readonly number[]
): AnnotationToken {
  return AnnotationToken.initActive(
    line.label.column.toString(),
    AnnotationTokenType.ColumnAtLine,
    `column ${line.label.column.toString()}`,
    path
  )
}

function rulingDollarLineToAnnotationToken(
  line: RulingDollarLine,
  path: readonly number[]
): AnnotationToken {
  return AnnotationToken.initActive(
    line.number,
    AnnotationTokenType.RulingDollarLine,
    `${line.number.toLowerCase()} ruling`,
    path
  )
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
    results.push(surfaceAtLineToAnnotationToken(line, [lineNumber, 0]))
  } else if (line instanceof ColumnAtLine) {
    results.push(columnAtLineToAnnotationToken(line, [lineNumber, 0]))
  } else if (line instanceof RulingDollarLine) {
    results.push(rulingDollarLineToAnnotationToken(line, [lineNumber, 0]))
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
