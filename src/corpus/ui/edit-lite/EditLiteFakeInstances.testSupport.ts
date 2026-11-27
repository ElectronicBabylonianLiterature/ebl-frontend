import _ from 'lodash'
import { WordInstances } from 'corpus/application/edit-lite/ChapterEditSource'
import {
  AnnotationWord,
  findLineToken,
  listLemmatizableWords,
} from 'corpus/application/edit-lite/annotationWords'
import { createManuscriptLine, createVariant, Line } from 'corpus/domain/line'
import {
  parseInstancesBody,
  rejectRequest,
} from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import { annotateLine } from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { Token } from 'transliteration/domain/token'

type Instance = readonly [lineIndex: number, word: AnnotationWord, token: Token]

export const missingWordMessage = 'word is required'

export const emptyWordMessage =
  "word must be a non-empty string, got '' instead"

export function noInstancesMessage(word: string): string {
  return `The chapter has no instance of the word "${word}". Nothing was saved.`
}

export function sameLemmaMessage(
  word: string,
  lemmaIds: readonly string[],
): string {
  return `Every instance of the word "${word}" already has the lemma ${lemmaIds.join(', ')}. Nothing was saved.`
}

function listInstances(lines: readonly Line[], word: string): Instance[] {
  return lines.map(annotateLine).flatMap((line, lineIndex) =>
    listLemmatizableWords(line)
      .map(
        (position): Instance => [
          lineIndex,
          position,
          findLineToken(line, position),
        ],
      )
      .filter(([, , token]) => token.cleanValue === word),
  )
}

export function countFakeInstances(
  lines: readonly Line[],
  word: string | null,
  revision: string,
): WordInstances {
  const instances = listInstances(lines, word ?? '')
  if (_.isEmpty(word)) {
    rejectRequest(word === null ? missingWordMessage : emptyWordMessage, 422)
  }
  return {
    word: String(word),
    words: instances.length,
    lemmatized: instances.filter(([, , token]) => !_.isEmpty(token.uniqueLemma))
      .length,
    lines: _.uniq(instances.map(([lineIndex]) => lineIndex)),
    revision,
  }
}

function lemmatizeTokens(
  tokens: readonly Token[],
  word: string,
  uniqueLemma: readonly string[],
): Token[] {
  return tokens.map((token) =>
    token.lemmatizable && token.cleanValue === word
      ? ({ ...token, uniqueLemma } as Token)
      : token,
  )
}

export function lemmatizeFakeInstances(
  lines: readonly Line[],
  body: unknown,
): readonly Line[] {
  const { word, uniqueLemma } = parseInstancesBody(body)
  const instances = listInstances(lines, word)
  const changedLines = new Set(instances.map(([lineIndex]) => lineIndex))
  if (instances.length === 0) {
    rejectRequest(noInstancesMessage(word), 422)
  }
  if (
    instances.every(([, , token]) => _.isEqual(token.uniqueLemma, uniqueLemma))
  ) {
    rejectRequest(sameLemmaMessage(word, uniqueLemma), 422)
  }
  return lines.map((line, lineIndex) =>
    changedLines.has(lineIndex)
      ? {
          ...line,
          variants: annotateLine(line).variants.map((variant) =>
            createVariant({
              ...variant,
              reconstructionTokens: lemmatizeTokens(
                variant.reconstructionTokens,
                word,
                uniqueLemma,
              ),
              manuscripts: variant.manuscripts.map((manuscript) =>
                createManuscriptLine({
                  ...manuscript,
                  atfTokens: lemmatizeTokens(
                    manuscript.atfTokens,
                    word,
                    uniqueLemma,
                  ),
                }),
              ),
            }),
          ),
        }
      : line,
  )
}
