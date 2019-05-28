import React from 'react'
import _ from 'lodash'

import Word from './Word'
import withData from 'http/withData'

import './WordSearch.css'

function WordSearch ({ data }) {
  return (
    <ul className='WordSearch-results'>
      {data.map(word => (
        <li key={word._id} className='WordSearch-results__result'>
          <Word value={word} />
        </li>
      ))}
    </ul>
  )
}

export default withData(
  WordSearch,
  props => props.wordService.search(props.query),
  {
    shouldUpdate: (prevProps, props) => prevProps.query !== props.query,
    filter: props => !_.isEmpty(props.query),
    defaultData: []
  }
)
