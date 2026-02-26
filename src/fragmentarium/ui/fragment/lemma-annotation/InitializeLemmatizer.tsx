import React from 'react'
import { useState } from 'react'
import { Text } from 'transliteration/domain/text'
import './Lemmatizer.sass'
import WordService from 'dictionary/application/WordService'
import EditableToken from 'fragmentarium/ui/fragment/linguistic-annotation/EditableToken'
import Word from 'dictionary/domain/Word'
import withData from 'http/withData'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import LemmaAnnotation, {
  LemmaAnnotatorProps,
} from 'fragmentarium/ui/fragment/lemma-annotation/LemmaAnnotation'

type LemmaId = string
type LemmaWordMap = ReadonlyMap<LemmaId, Word>

const createEditableTokens = (
  text: Text,
  words: LemmaWordMap,
): EditableToken[] => {
  const tokens: EditableToken[] = []
  let indexInText = 0

  text.allLines.forEach((line, lineIndex) => {
    line.content.forEach((token, indexInLine) => {
      if (token.lemmatizable) {
        const lemmas = token.uniqueLemma.map((lemma) => {
          return new LemmaOption(words.get(lemma) as Word)
        })
        tokens.push(
          new EditableToken(token, indexInText, indexInLine, lineIndex, lemmas),
        )
        indexInText++
      }
    })
  })
  return tokens
}

const LoadWords = withData<
  Omit<LemmaAnnotatorProps, 'editableTokens'>,
  {
    wordService: WordService
  },
  EditableToken[]
>(
  ({ data, ...props }) => <LemmaAnnotation {...props} editableTokens={data} />,
  (props) => {
    const tokens: Set<string> = new Set(
      props.text.allLines
        .flatMap((line) => line.content)
        .flatMap((token) => token.uniqueLemma || []),
    )

    return props.wordService
      .findAll([...tokens])
      .then((words) => new Map(words.map((word) => [word._id, word])))
      .then((wordMap) => createEditableTokens(props.text, wordMap))
  },
  {
    watch: (props) => [props.text],
  },
)

export const InitializeLemmatizer = (
  props: Omit<LemmaAnnotatorProps, 'editableTokens' | 'setText'>,
): JSX.Element => {
  const [text, setText] = useState<Text>(props.text)

  return <LoadWords {...props} text={text} setText={setText} />
}
