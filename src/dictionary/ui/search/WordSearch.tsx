import React from 'react'
import _ from 'lodash'

import Word from 'dictionary/domain/Word'
import WordComponent from './Word'
import withData from 'http/withData'

import './WordSearch.css'

interface Props {
  data: readonly Word[]
}

function WordSearch({ data }: Props): JSX.Element {
  return (
    <ul className="WordSearch-results">
      {data.map((word) => (
        <li key={word._id} className="WordSearch-results__result">
          <WordComponent value={word} />
        </li>
      ))}
    </ul>
  )
}

export default withData<
  unknown,
  { query: string; wordService },
  readonly Word[]
>(WordSearch, (props) => props.wordService.search(props.query), {
  watch: (props) => [props.query],
  filter: (props) => !_.isEmpty(props.query),
  defaultData: [],
})
