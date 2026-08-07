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

export default function PaginationItems({
  activePage,
  pageSize,
  hasNextPage,
  paginationURLParam,
}: {
  activePage: number
  pageSize: number
  paginationURLParam: string
  hasNextPage: boolean
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()
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
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <Form.Select
        aria-label="Results per page"
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
      <Pagination>
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
      <Form className="d-flex gap-2" onSubmit={goToPage}>
        <Form.Control
          aria-label="Go to page"
          min={1}
          onChange={(event) => setPageJump(event.currentTarget.value)}
          placeholder="Page"
          size="sm"
          type="number"
          value={pageJump}
        />
        <Button size="sm" type="submit" variant="outline-secondary">
          Go
        </Button>
      </Form>
    </div>
  )
}
