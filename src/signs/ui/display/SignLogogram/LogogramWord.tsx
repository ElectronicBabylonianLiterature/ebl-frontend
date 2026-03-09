import withData, { WithoutData } from 'http/withData'
import Word from 'dictionary/domain/Word'
import React, { Fragment } from 'react'
import WordService from 'dictionary/application/WordService'
import { Link } from 'react-router-dom'

function isWord(
  logogramWord: Word | Record<string, never>,
): logogramWord is Word {
  return (logogramWord as Word)._id !== undefined
}

function LogogramWord({
  word,
}: {
  word: Word | Record<string, never>
}): JSX.Element | null {
  if (isWord(word)) {
    const attested = (word as Word).attested === false ? '*' : ''
    const lemma = word.lemma.join(' ')
    return (
      <Fragment>
        <Link to={`/dictionary/${word._id}`}>
          <em>
            {attested}
            {lemma}
          </em>
        </Link>
        <span>
          {` ${word.homonym}`}
          {`, “${word.guideWord}”`}
        </span>
      </Fragment>
    )
  } else {
    return null
  }
}

type Props = {
  data: Word
  wordService: WordService
}

export default withData<
  WithoutData<Props>,
  { wordId },
  Word | Record<string, never>
>(
  ({ data }) => <LogogramWord word={data} />,
  (props) => props.wordService.find(props.wordId).catch(() => ({})),
)
