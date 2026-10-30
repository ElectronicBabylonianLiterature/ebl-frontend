import React from 'react'
import { Button, Form, Pagination } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import {
  getNumberedPageIndexes,
  RESULT_PAGE_SIZES,
  updatePageSizeSearchParam,
  updatePaginationSearchParam,
} from 'fragmentarium/ui/search/pagination'

function PaginationControl({
  paginationURLParam,
  index,
  disabled,
  active = false,
  children,
}: {
  paginationURLParam: string
  index: number
  disabled: boolean
  active?: boolean
  children: React.ReactNode
}) {
  const location = useLocation()
  const history = useHistory()
  const search = updatePaginationSearchParam(
    location.search,
    paginationURLParam,
    index,
  )
  return (
    <Pagination.Item
      active={active}
      aria-current={active ? 'page' : undefined}
      disabled={disabled}
      href={
        disabled ? undefined : `${location.pathname}?${search}${location.hash}`
      }
      onClick={(event) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        const hasModifierKey = [
          event.metaKey,
          event.ctrlKey,
          event.shiftKey,
          event.altKey,
        ].some(Boolean)
        if (event.button !== 0 || hasModifierKey) {
          return
        }

        event.preventDefault()
        history.push({
          pathname: location.pathname,
          search,
          hash: location.hash,
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
  lastPageIndex,
  paginationURLParam,
  position,
}: {
  activePage: number
  pageSize: number
  paginationURLParam: string
  hasNextPage: boolean
  lastPageIndex?: number | null
  position: PaginationPosition
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const controlIdPrefix = React.useId()
  const pageJumpId = `${controlIdPrefix}page-jump`
  const pageSizeId = `${controlIdPrefix}page-size`
  const [pageJump, setPageJump] = React.useState('')
  const knownLastPage = lastPageIndex ?? null
  const nextPageAvailable =
    knownLastPage === null ? hasNextPage : activePage < knownLastPage
  const goToPage = (event: React.FormEvent): void => {
    event.preventDefault()
    const pageNumber = Number(pageJump)

    if (
      !Number.isSafeInteger(pageNumber) ||
      pageNumber < 1 ||
      (knownLastPage !== null && pageNumber > knownLastPage + 1)
    ) {
      return
    }

    const index = pageNumber - 1

    if (index === activePage) {
      return
    }

    history.push({
      pathname: location.pathname,
      search: updatePaginationSearchParam(
        location.search,
        paginationURLParam,
        index,
      ),
      hash: location.hash,
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
          {knownLastPage !== null && (
            <PaginationControl
              paginationURLParam={paginationURLParam}
              index={0}
              disabled={activePage === 0}
            >
              First
            </PaginationControl>
          )}
          <PaginationControl
            paginationURLParam={paginationURLParam}
            index={activePage - 1}
            disabled={activePage === 0}
          >
            Previous
          </PaginationControl>
          {knownLastPage === null ? (
            <Pagination.Item active aria-current="page">
              Page {activePage + 1}
            </Pagination.Item>
          ) : (
            getNumberedPageIndexes(activePage, knownLastPage).map(
              (page, index) =>
                page === 'ellipsis' ? (
                  <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />
                ) : (
                  <PaginationControl
                    key={page}
                    paginationURLParam={paginationURLParam}
                    index={page}
                    active={page === activePage}
                    disabled={page === activePage}
                  >
                    {page + 1}
                  </PaginationControl>
                ),
            )
          )}
          <PaginationControl
            paginationURLParam={paginationURLParam}
            index={activePage + 1}
            disabled={!nextPageAvailable}
          >
            Next
          </PaginationControl>
          {knownLastPage !== null && (
            <PaginationControl
              paginationURLParam={paginationURLParam}
              index={knownLastPage}
              disabled={activePage >= knownLastPage}
            >
              Last
            </PaginationControl>
          )}
        </Pagination>
      </div>
      <div className="fragment-result__pagination-secondary">
        {knownLastPage !== null && knownLastPage > 0 && (
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
              max={knownLastPage + 1}
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
        )}
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
                pathname: location.pathname,
                search: updatePageSizeSearchParam(
                  location.search,
                  Number(event.currentTarget.value),
                ),
                hash: location.hash,
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
