import React from 'react'
import { Form, Pagination } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import {
  getValidatedPageSize,
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
  hasNextPage,
  paginationURLParam,
}: {
  activePage: number
  paginationURLParam: string
  hasNextPage: boolean
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()

  return (
    <div className="d-flex align-items-center gap-2">
      <Form.Select
        aria-label="Results per page"
        size="sm"
        value={getValidatedPageSize(
          new URLSearchParams(location.search).get('limit'),
        )}
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
    </div>
  )
}
