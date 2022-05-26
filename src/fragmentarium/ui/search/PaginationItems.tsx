import React from 'react'
import { Pagination } from 'react-bootstrap'
import { parse, stringify } from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'

const NEIGHBOURING_PAGINATION_ITEMS = 3

function PaginationItem({
  active,
  index,
  setActivePage,
}: {
  active: boolean
  index: number
  setActivePage: (number: number) => void
}) {
  const location = useLocation()
  const history = useHistory()
  return (
    <Pagination.Item
      active={active}
      onClick={(event) => {
        event.preventDefault()
        const query = parse(location.search, {
          parseNumbers: true,
        })
        setActivePage(index)
        history.push({
          search: stringify({ ...query, paginationIndex: index }),
        })
      }}
    >
      {index + 1}
    </Pagination.Item>
  )
}

type PaginationItemElement = { component: () => JSX.Element; index: number }

function createItems(
  activePage: number,
  totalPages: number,
  setActivePage: (number: number) => void
): readonly PaginationItemElement[] {
  const items: PaginationItemElement[] = []
  for (
    let index = Math.max(0, activePage - NEIGHBOURING_PAGINATION_ITEMS);
    index <=
    Math.min(activePage + NEIGHBOURING_PAGINATION_ITEMS, totalPages - 1);
    index++
  ) {
    items.push({
      index: index,
      component: () => (
        <PaginationItem
          setActivePage={setActivePage}
          index={index}
          key={index}
          active={index === activePage}
        />
      ),
    })
  }
  return items
}

export default function PaginationItems({
  activePage,
  totalPages,
  setActivePage,
}: {
  activePage: number
  totalPages: number
  setActivePage: (number: number) => void
}): JSX.Element {
  const items = createItems(activePage, totalPages, setActivePage)
  const itemComponents = items.map((item) => item.component())

  const first = (
    <PaginationItem
      setActivePage={setActivePage}
      index={0}
      key={0}
      active={0 === activePage}
    />
  )
  const last = (
    <PaginationItem
      setActivePage={setActivePage}
      key={totalPages}
      active={totalPages === activePage}
      index={totalPages}
    />
  )
  const ellipsis = <Pagination.Ellipsis key={totalPages + 1} />

  let paginationItems = (
    <Pagination>
      {[
        first,
        ellipsis,
        ...itemComponents,
        <Pagination.Ellipsis key={totalPages + 2} />,
        last,
      ]}
    </Pagination>
  )
  if (items[0].index === 0) {
    paginationItems = (
      <Pagination>{[...itemComponents, ellipsis, last]}</Pagination>
    )
  }
  if (items[0].index === 1) {
    paginationItems = (
      <Pagination>{[first, ...itemComponents, ellipsis, last]}</Pagination>
    )
  }
  if (
    items[items.length - 1].index >=
    totalPages - NEIGHBOURING_PAGINATION_ITEMS - 1
  ) {
    paginationItems = (
      <Pagination>{[first, ellipsis, ...itemComponents]}</Pagination>
    )
  }
  if (
    items[items.length - 1].index ===
    totalPages - NEIGHBOURING_PAGINATION_ITEMS - 2
  ) {
    paginationItems = (
      <Pagination>{[first, ellipsis, ...itemComponents, last]}</Pagination>
    )
  }
  if (items.length < 2 * NEIGHBOURING_PAGINATION_ITEMS) {
    paginationItems = <Pagination>{[...itemComponents]}</Pagination>
  }
  return paginationItems
}
