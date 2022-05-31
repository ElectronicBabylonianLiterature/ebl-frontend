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

  const generatePaginationItem = (index) => (
    <PaginationItem
      setActivePage={setActivePage}
      index={index}
      key={index}
      active={index === activePage}
    />
  )

  const first = generatePaginationItem(0)
  const last = generatePaginationItem(totalPages)

  const paginationItems = composePaginationItems(items, totalPages, first, last)

  return <Pagination>{paginationItems}</Pagination>
}

function composePaginationItems(
  itemComponents: readonly PaginationItemElement[],
  totalPages: number,
  first: JSX.Element,
  last: JSX.Element
): readonly JSX.Element[] {
  const items = itemComponents.map((item) => item.component())
  const leftMostIndex = itemComponents[0].index
  const rightMostIndex = itemComponents[items.length - 1].index
  const ellipsis1 = <Pagination.Ellipsis key={totalPages + 1} />
  const ellipsis2 = <Pagination.Ellipsis key={totalPages + 2} />

  const minimum = 2 * NEIGHBOURING_PAGINATION_ITEMS
  const nextToLast = totalPages - NEIGHBOURING_PAGINATION_ITEMS - 2
  const maximum = totalPages - NEIGHBOURING_PAGINATION_ITEMS - 1

  let paginationItems = [first, ellipsis1, ...items, ellipsis2, last]

  if (totalPages < minimum) {
    return [...items]
  }
  if (leftMostIndex === 0) {
    paginationItems = [...items, ellipsis1, last]
  } else if (leftMostIndex === 1)
    paginationItems = [first, ...items, ellipsis1, last]

  if (rightMostIndex === nextToLast) {
    paginationItems = [first, ellipsis1, ...items, last]
  } else if (rightMostIndex >= maximum) {
    paginationItems = [first, ellipsis1, ...items]
  }
  return paginationItems
}
