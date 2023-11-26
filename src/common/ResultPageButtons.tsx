import React, { Dispatch, SetStateAction } from 'react'
import { CorpusQueryItem, QueryItem } from 'query/QueryResult'
import { Col, Row, Pagination } from 'react-bootstrap'
import { createPages } from '../fragmentarium/ui/search/FragmentariumSearchResult'

export function ResultPageButtons({
  pages,
  active,
  setActive,
}: {
  pages: (QueryItem | CorpusQueryItem)[][]
  active: number
  setActive: (number) => void
}): JSX.Element {
  return (
    <Row>
      <Col>
        <ResultPagination pages={pages} active={active} setActive={setActive} />
      </Col>
    </Row>
  )
}
function ResultPagination({
  pages,
  active,
  setActive,
}: {
  pages: readonly unknown[][]
  active: number
  setActive: Dispatch<SetStateAction<number>>
}): JSX.Element {
  return (
    <Pagination className="justify-content-center">
      {createPages(pages, active).map((pages, index) => {
        return (
          <React.Fragment key={index}>
            {index > 0 && <Pagination.Ellipsis />}
            {pages.map((index) => (
              <Pagination.Item
                key={index}
                active={active === index}
                onClick={(event) => {
                  event.preventDefault()
                  setActive(index)
                }}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </React.Fragment>
        )
      })}
    </Pagination>
  )
}
