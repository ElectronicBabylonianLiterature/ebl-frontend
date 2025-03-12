import React from 'react'
import { Link } from 'react-router-dom'
import { Parser } from 'html-to-react'
import _ from 'lodash'
import { Row, Col } from 'react-bootstrap'
import InlineMarkdown from 'common/InlineMarkdown'
import withData from 'http/withData'
import './BibliographySearch.css'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyService from 'bibliography/application/BibliographyService'
import Citation from 'bibliography/domain/Citation'
import Reference from 'bibliography/domain/Reference'

function BibliographySearch({ data }: { data: readonly BibliographyEntry[] }) {
  const parser = new Parser()

  return (
    <ol className="BibliographySearch">
      {data.map((entry) => {
        const reference = new Reference('DISCUSSION', '', '', [], entry)
        const citation = Citation.for(reference)

        return (
          <li key={entry.id} className="BibliographySearch__entry">
            <Row className="BibliographySearch__row">
              <Col md={2} className="BibliographySearch__citation-col">
                <Link
                  to={`/bibliography/references/${encodeURIComponent(
                    entry.id
                  )}`}
                  className="BibliographySearch__citation"
                >
                  <InlineMarkdown source={citation.getMarkdown()} />
                </Link>
              </Col>
              <Col md={10} className="BibliographySearch__full-reference-col">
                <div>{parser.parse(entry.toHtml())}</div>
              </Col>
            </Row>
          </li>
        )
      })}
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
