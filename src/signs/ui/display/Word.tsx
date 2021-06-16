import withData, { WithoutData } from 'http/withData'
import Word from 'dictionary/domain/Word'
import React, { Fragment } from 'react'
import WordService from 'dictionary/application/WordService'
import { Link } from 'react-router-dom'

function Lemma({ word }: { word: Word }): JSX.Element {
  console.log(word)
  const attested = word.attested === false ? '*' : ''
  const lemma = word.lemma.join(' ')
  return (
    <Fragment>
      {word._id ? (
        <Link to={`/dictionary/${word._id}`}>
          {attested}
          {lemma}
        </Link>
      ) : (
        <em>{`${attested}${lemma}`}</em>
      )}
      <span>{word.homonym && ` ${word.homonym}`}</span>
    </Fragment>
  )
}

type Props = {
  data: Word
  wordService: WordService
}

export default withData<WithoutData<Props>, { wordId; wordService }, Word>(
  ({ data }) => <Lemma word={data} />,
  (props) => props.wordService.find(props.wordId)
)
