import React from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Parser } from 'html-to-react'

import withData from 'http/withData'

import './BibliographySearch.css'

function BibliographySearch({ data }) {
  const parser = new Parser()
  return (
    <ol className="BibliographySearch">
      {data.map(entry => (
        <li key={entry.id} className="BibliographySearch__entry">
          <Link
            to={`/bibliography/${encodeURIComponent(entry.id)}`}
            className="BibliographySearch__edit"
          >
            <i className="fas fa-edit" />
          </Link>
          {parser.parse(entry.toHtml())}
        </li>
      ))}
    </ol>
  )
}

export default withData(
  BibliographySearch,
  props => props.bibliographyService.search(props.query),
  {
    shouldUpdate: (prevProps, props) => prevProps.query !== props.query,
    filter: props => !_.isEmpty(props.query),
    defaultData: []
  }
)
