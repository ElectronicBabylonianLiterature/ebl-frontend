import withData, { WithoutData } from 'http/withData'
import Word from 'dictionary/domain/Word'
import React from 'react'
import WordService from 'dictionary/application/WordService'
import { Lemma } from 'dictionary/ui/search/Word'

type Props = {
  data: Word
  wordService: WordService
}

export default withData<WithoutData<Props>, { wordId; wordService }, Word>(
  ({ data }) => <Lemma word={data} />,
  (props) => props.wordService.find(props.wordId)
)
