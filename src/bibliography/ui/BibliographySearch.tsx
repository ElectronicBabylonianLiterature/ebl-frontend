import React from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import { Parser } from 'html-to-react'

import withData from 'http/withData'

import './BibliographySearch.css'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyService from 'bibliography/application/BibliographyService'

function BibliographySearch({ data }: { data: readonly BibliographyEntry[] }) {
  const parser = new Parser()
  return (
    <ol className="BibliographySearch">
      {data.map((entry) => (
        <li key={entry.id} className="BibliographySearch__entry">
          <Link
            to={`/bibliography/references/${encodeURIComponent(entry.id)}`}
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

export default withData<
  unknown,
  {
    bibliographyService: BibliographyService
    query: string
  },
  readonly BibliographyEntry[]
>(
  BibliographySearch,
  (props) => props.bibliographyService.search(props.query),
  {
    watch: (props) => [props.query],
    filter: (props) => !_.isEmpty(props.query),
    defaultData: () => [],
  }
)
