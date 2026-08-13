import React from 'react'
import { Button, Form, Pagination } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import {
  RESULT_PAGE_SIZES,
  updatePageSizeSearchParam,
  updatePaginationSearchParam,
} from './pagination'

function PaginationControl({
  paginationURLParam,
  index,
  disabled,
  children,
}: {
  paginationURLParam: string
  index: number
  disabled: boolean
  children: React.ReactNode
}) {
  const location = useLocation()
  const history = useHistory()
  return (
    <Pagination.Item
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault()
        if (disabled) {
          return
        }

        history.push({
          search: updatePaginationSearchParam(
            location.search,
            paginationURLParam,
            index,
          ),
        })
      }}
    >
      {children}
    </Pagination.Item>
  )
}

export type PaginationPosition = 'top' | 'bottom'

export default function PaginationItems({
  activePage,
  pageSize,
  hasNextPage,
  paginationURLParam,
  position,
}: {
  activePage: number
  pageSize: number
  paginationURLParam: string
  hasNextPage: boolean
  position: PaginationPosition
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const controlIdPrefix = React.useId()
  const pageJumpId = `${controlIdPrefix}page-jump`
  const pageSizeId = `${controlIdPrefix}page-size`
  const [pageJump, setPageJump] = React.useState('')
  const goToPage = (event: React.FormEvent): void => {
    event.preventDefault()
    const pageNumber = Number(pageJump)

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return
    }

    const index = pageNumber - 1

    if (index === activePage) {
      return
    }

    history.push({
      search: updatePaginationSearchParam(
        location.search,
        paginationURLParam,
        index,
      ),
    })
    setPageJump('')
  }

  return (
    <nav
      aria-label={`Search results pagination, ${position}`}
      className="fragment-result__pagination"
    >
      <div className="fragment-result__pagination-primary">
        <Pagination
          aria-label="Pages"
          className="fragment-result__pagination-pages"
          size="sm"
        >
          <PaginationControl
            paginationURLParam={paginationURLParam}
            index={activePage - 1}
            disabled={activePage === 0}
          >
            Previous
          </PaginationControl>
          <Pagination.Item active>Page {activePage + 1}</Pagination.Item>
          <PaginationControl
            paginationURLParam={paginationURLParam}
            index={activePage + 1}
            disabled={!hasNextPage}
          >
            Next
          </PaginationControl>
        </Pagination>
      </div>
      <div className="fragment-result__pagination-secondary">
        <Form
          className="fragment-result__pagination-control-group"
          onSubmit={goToPage}
        >
          <Form.Label className="mb-0" htmlFor={pageJumpId}>
            Go to page
          </Form.Label>
          <Form.Control
            className="fragment-result__pagination-page-input"
            id={pageJumpId}
            min={1}
            onChange={(event) => setPageJump(event.currentTarget.value)}
            placeholder="Page"
            required
            size="sm"
            type="number"
            value={pageJump}
          />
          <Button size="sm" type="submit" variant="outline-secondary">
            Go
          </Button>
        </Form>
        <Form.Group
          className="fragment-result__pagination-control-group"
          controlId={pageSizeId}
        >
          <Form.Label className="mb-0">Results per page</Form.Label>
          <Form.Select
            className="fragment-result__pagination-page-size"
            size="sm"
            value={pageSize}
            onChange={(event) => {
              history.push({
                search: updatePageSizeSearchParam(
                  location.search,
                  Number(event.currentTarget.value),
                ),
              })
            }}
          >
            {RESULT_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
    </nav>
  )
}
