import React from 'react'
import _ from 'lodash'
import {
  AnnotationWord,
  findLineToken,
  findWordPosition,
  isSameWord,
  listSimilarWords,
} from 'corpus/application/edit-lite/annotationWords'
import {
  findLemmaToken,
  isSameLemmaToken,
  listChangedWords,
  resetWordLemmas,
} from 'corpus/application/edit-lite/lemmaEdits'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import LemmaWordForm from 'corpus/ui/edit-lite/LemmaWordForm'
import { WordFlow } from 'corpus/ui/edit-lite/useWordFlow'
import WordPopover from 'corpus/ui/edit-lite/WordPopover'
import { getTokenLanguage } from 'fragmentarium/ui/lemmatization/LemmaSelect'
import Word from 'fragmentarium/ui/lemmatization/Word'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'

export interface LemmaEditing {
  readonly line: Line
  readonly words: readonly AnnotationWord[]
  readonly lemmatization: readonly LineLemmatization[]
  readonly loaded: readonly LineLemmatization[]
  readonly flow: WordFlow
  readonly isHighlighting: boolean
  readonly blockingDraft: string | null
  change(lemmatization: readonly LineLemmatization[]): void
  highlight(isHighlighting: boolean): void
  updateAll(position: number, word: string, uniqueLemma: UniqueLemma): void
}

interface Props {
  readonly editing: LemmaEditing
  readonly word: AnnotationWord
  readonly token: LemmatizationToken
  readonly onSetLemma: (uniqueLemma: UniqueLemma) => void
}

export const noLemmaProblem = 'The word has no lemma.'

export function describeBlockingDraft(lineNumber: string): string {
  return `Save or reset the lemmatization changes of line ${lineNumber} first.`
}

function findUpdateAllProblem(
  token: LemmatizationToken,
  blockingDraft: string | null,
): string | null {
  if (!token.hasLemma) {
    return noLemmaProblem
  }
  return blockingDraft === null ? null : describeBlockingDraft(blockingDraft)
}

export default function LemmaWord({
  editing,
  word,
  token,
  onSetLemma,
}: Props): JSX.Element {
  const { line, words, lemmatization, loaded, flow } = editing
  const position = findWordPosition(words, word) as number
  const activeWord = flow.active === null ? null : words[flow.active]
  const isHighlighted =
    editing.isHighlighting &&
    activeWord !== null &&
    listSimilarWords(line, words, activeWord).some((similar) =>
      isSameWord(similar, word),
    )
  const renderForm = (): JSX.Element => {
    const lineToken = findLineToken(line, word)
    const similarWords = listSimilarWords(line, words, word)
    const reset = (resetWords: readonly AnnotationWord[]): void =>
      editing.change(resetWordLemmas(lemmatization, loaded, line, resetWords))
    return (
      <LemmaWordForm
        word={token.value}
        language={getTokenLanguage(lineToken)}
        token={token}
        isChanged={!isSameLemmaToken(token, findLemmaToken(loaded, word))}
        canResetAll={
          listChangedWords(lemmatization, loaded, similarWords).length > 0
        }
        updateAllProblem={findUpdateAllProblem(token, editing.blockingDraft)}
        flow={flow}
        actions={{
          setLemma: onSetLemma,
          reset: (): void => reset([word]),
          resetAll: (): void => reset(similarWords),
          updateAll: (): void =>
            editing.updateAll(
              position,
              lineToken.cleanValue,
              _.toArray(token.uniqueLemma),
            ),
          highlight: editing.highlight,
        }}
      />
    )
  }

  return (
    <WordPopover
      label={`Lemma of ${token.value}`}
      position={position}
      flow={flow}
      isHighlighted={isHighlighted}
      toggle={<Word token={token} />}
    >
      {renderForm}
    </WordPopover>
  )
}
