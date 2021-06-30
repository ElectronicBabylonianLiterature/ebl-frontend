import withData, { WithoutData } from 'http/withData'
import Word from 'dictionary/domain/Word'
import React, { Fragment } from 'react'
import WordService from 'dictionary/application/WordService'
import { Link } from 'react-router-dom'

function LogogramWord({ word }: { word: Word }): JSX.Element {
  const attested = word.attested === false ? '*' : ''
  const lemma = word.lemma.join(' ')
  return (
    <Fragment>
      {word._id ? (
        <Link to={`/dictionary/${word._id}`}>
          <em>
            {' '}
            {attested}
            {lemma}
          </em>
        </Link>
      ) : (
        <em>{`${attested}${lemma}`}</em>
      )}
      <span>
        {` ${word.homonym}`}
        {`, “${word.guideWord}”`}
      </span>
    </Fragment>
  )
}

type Props = {
  data: Word
  wordService: WordService
}

export default withData<WithoutData<Props>, { wordId }, Word>(
  ({ data }) => <LogogramWord word={data} />,
  (props) => props.wordService.find(props.wordId)
)
