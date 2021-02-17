import Promise from 'bluebird'
import _ from 'lodash'
import { GlossaryData, GlossaryToken } from 'transliteration/domain/glossary'
import WordService from 'dictionary/application/WordService'
import { Text } from 'transliteration/domain/text'
import Label from 'transliteration/domain/Label'
import { AnyWord } from 'transliteration/domain/token'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { TextLine } from 'transliteration/domain/text-line'
import {
  isTextLine,
  isObjectAtLine,
  isSurfaceAtLine,
  isColumnAtLine,
  isAnyWord,
} from 'transliteration/domain/type-guards'

type LabeledLine = readonly [Label, TextLine]

function labelLines(text: Text): LabeledLine[] {
  const [, labeledLines] = _.reduce(
    text.lines,
    (
      [current, lines]: [Label, LabeledLine[]],
      line: AbstractLine
    ): [Label, LabeledLine[]] => {
      if (isTextLine(line)) {
        return [
          current,
          [...lines, [current.setLineNumber(line.lineNumber), line]],
        ]
      } else if (isObjectAtLine(line)) {
        return [current.setObject(line.label), lines]
      } else if (isSurfaceAtLine(line)) {
        return [current.setSurface(line.label), lines]
      } else if (isColumnAtLine(line)) {
        return [current.setColumn(line.label), lines]
      } else {
        return [current, lines]
      }
    },
    [new Label(), []]
  )
  return labeledLines
}

function createGlossaryData(tokens: GlossaryToken[]): GlossaryData {
  return _(tokens)
    .groupBy((token) => token.uniqueLemma)
    .toPairs()
    .sortBy(_.head)
    .value()
}

export default class GlossaryFactory {
  private readonly dictionary: WordService

  constructor(dictionary: WordService) {
    this.dictionary = dictionary
  }

  createGlossary(text: Text): Promise<GlossaryData> {
    const labeledLines = labelLines(text)

    return Promise.all(
      labeledLines.flatMap((line) => this.createTokensForLine(line))
    ).then(createGlossaryData)
  }

  private createTokensForLine([label, line]: LabeledLine): Promise<
    GlossaryToken
  >[] {
    return line.content
      .filter(isAnyWord)
      .filter((token: AnyWord) => token.lemmatizable)
      .flatMap((token): Promise<GlossaryToken>[] =>
        this.createTokensForWord(label, token)
      )
  }

  private createTokensForWord(
    label: Label,
    transliterationWord: AnyWord
  ): Promise<GlossaryToken>[] {
    return (
      transliterationWord.uniqueLemma?.map((lemma) =>
        this.createToken(label, transliterationWord, lemma)
      ) ?? []
    )
  }

  private createToken(
    label: Label,
    transliterationWord: AnyWord,
    lemma: string
  ): Promise<GlossaryToken> {
    return this.dictionary
      .find(lemma)
      .catch(() => null)
      .then((dictionaryWord) => ({
        label: label,
        value: transliterationWord.value,
        word: transliterationWord,
        uniqueLemma: lemma,
        dictionaryWord: dictionaryWord,
      }))
  }
}
