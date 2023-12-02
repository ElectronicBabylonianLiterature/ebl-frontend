import React, { Dispatch, SetStateAction } from 'react'
import { CorpusQueryItem, QueryItem } from 'query/QueryResult'
import { Col, Row, Pagination } from 'react-bootstrap'
import _ from 'lodash'

function createPages(pages: readonly unknown[][], active: number): number[][] {
  const pageNumbers = _.range(pages.length)

  if (pages.length <= 10) {
    return [pageNumbers]
  }
  const buttonGroups: number[][] = []
  const showEllipsis1 = active > 5
  const showEllipsis2 = active < pageNumbers.length - 6

  const activeGroup = pageNumbers.slice(
    showEllipsis1 ? active - 3 : 0,
    showEllipsis2 ? active + 4 : pageNumbers.length
  )

  showEllipsis1 && buttonGroups.push([0])
  buttonGroups.push(activeGroup)
  showEllipsis2 && buttonGroups.push(pageNumbers.slice(-1))

  return buttonGroups
}

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
