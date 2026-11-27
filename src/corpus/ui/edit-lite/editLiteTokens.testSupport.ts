import { LineLemmatization } from 'corpus/domain/lemmatization'
import {
  createManuscriptLine,
  createVariant,
  Line,
  LineVariant,
  ManuscriptLine,
} from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { wordFactory } from 'test-support/word-fixtures'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import { Token } from 'transliteration/domain/token'

type WordType = 'Word' | 'AkkadianWord'

const brokenText = /x|\.\.\./
const separator = /^\(?\|+\)?$/
const flags = /[[\]#?!]/g

function listValues(text: string): string[] {
  return text.split('\n')[0].split(/\s+/).filter(Boolean)
}

export function createWordToken(
  value: string,
  type: WordType,
  config: Partial<Token> = {},
): Token {
  return {
    type,
    value,
    cleanValue: value.replace(flags, ''),
    parts: [],
    uniqueLemma: [],
    normalized: type === 'AkkadianWord',
    language: 'AKKADIAN',
    lemmatizable: true,
    alignable: true,
    erasure: 'NONE',
    alignment: null,
    variant: null,
    enclosureType: [],
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
    ...(type === 'AkkadianWord' ? { modifiers: [] } : {}),
    ...config,
  } as Token
}

function createPlainToken(value: string, type: string): Token {
  return { type, value, cleanValue: value, enclosureType: [] } as Token
}

function tokenizeReconstructionValue(value: string): Token {
  if (value.startsWith('%')) {
    return createPlainToken(value, 'LanguageShift')
  }
  return separator.test(value)
    ? createPlainToken(value, 'MetricalFootSeparator')
    : createWordToken(value, 'AkkadianWord')
}

export function tokenizeReconstruction(reconstruction: string): Token[] {
  return listValues(reconstruction).map(tokenizeReconstructionValue)
}

export function tokenizeManuscriptLine(atf: string): Token[] {
  return listValues(atf).map((value) =>
    brokenText.test(value)
      ? createPlainToken(value, 'UnknownNumberOfSigns')
      : createWordToken(value, 'Word'),
  )
}

function annotateManuscriptLine(
  manuscriptLine: ManuscriptLine,
): ManuscriptLine {
  return manuscriptLine.atfTokens.length > 0
    ? manuscriptLine
    : createManuscriptLine({
        ...manuscriptLine,
        atfTokens: tokenizeManuscriptLine(manuscriptLine.atf),
      })
}

function annotateVariant(variant: LineVariant): LineVariant {
  return createVariant({
    ...variant,
    reconstructionTokens:
      variant.reconstructionTokens.length > 0
        ? variant.reconstructionTokens
        : tokenizeReconstruction(variant.reconstruction),
    manuscripts: variant.manuscripts.map(annotateManuscriptLine),
  })
}

export function annotateLine(line: Line): Line {
  return { ...line, variants: line.variants.map(annotateVariant) }
}

export function buildLineLemmatization(line: Line): LineLemmatization[] {
  const lemmatize = (tokens: readonly Token[]): LemmatizationToken[] =>
    tokens.map((token) =>
      token.lemmatizable
        ? new LemmatizationToken(token.value, true, [], [])
        : new LemmatizationToken(token.value, false),
    )
  return annotateLine(line).variants.map((variant) => [
    lemmatize(variant.reconstructionTokens),
    variant.manuscripts.map((manuscript) => lemmatize(manuscript.atfTokens)),
  ])
}

export function buildAnnotatedLines(count = 3): Line[] {
  return buildEditLiteLines(count).map(annotateLine)
}

export function buildDictionaryWord(lemma: string, homonym = 'I'): Word {
  return wordFactory.build({
    _id: `${lemma} ${homonym}`,
    lemma: [lemma],
    homonym,
    guideWord: `guide word of ${lemma}`,
    pos: ['N'],
  })
}
