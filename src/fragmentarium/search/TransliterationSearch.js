import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { Table } from 'react-bootstrap'

import withData from 'http/withData'

import './TransliterationSearch.css'

function Lines ({ fragment }) {
  return (
    <ol className='TransliterationSearch__list'>
      {fragment.matching_lines.map((group, index) =>
        <li key={index} className='TransliterationSearch__list_item'>
          <ol className='TransliterationSearch__list'>
            {group.map((line, index) =>
              <li key={index}>{line}</li>
            )}
          </ol>
        </li>
      )}
    </ol>
  )
}

function TransliterationSearchResult ({ data }) {
  return (
    <Table responsive>
      <thead>
        <tr>
          <th>Number</th>
          <th>Script</th>
          <th>Matching lines</th>
        </tr>
      </thead>
      <tbody>
        {data.map(fragment =>
          <tr key={fragment._id}>
            <td><Link to={`/fragmentarium/${fragment._id}`}>{fragment._id}</Link></td>
            <td>{fragment.script}</td>
            <td><Lines fragment={fragment} /></td>
          </tr>
        )}
        {_.isEmpty(data) && <tr><td colSpan={4}>No fragments found.</td></tr>}
      </tbody>
    </Table>
  )
}

export default withData(
  ({ transliteration, data }) => transliteration
    ? <TransliterationSearchResult data={data} />
    : null
  ,
  props => props.fragmentService.searchTransliteration(props.transliteration),
  {
    shouldUpdate: (prevProps, props) => prevProps.transliteration !== props.transliteration,
    filter: props => !_.isEmpty(props.transliteration),
    defaultData: []
  }
)
