import withData, { WithoutData } from 'http/withData'
import Word from 'dictionary/domain/Word'
import React from 'react'
import WordService from 'dictionary/application/WordService'
import { RouteComponentProps } from 'react-router-dom'
import { Lemma } from 'dictionary/ui/search/Word'

type Props = {
  data: Word
  wordService: WordService
} & RouteComponentProps<{ id: string }>

export default withData<WithoutData<Props>, { match; wordService }, Word>(
  ({ data }) => <Lemma word={data} />,
  (props) => props.wordService.find(props.match.params['id'])
)
