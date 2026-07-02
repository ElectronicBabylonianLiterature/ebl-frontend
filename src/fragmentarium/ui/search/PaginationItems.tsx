import React from 'react'
import { Pagination } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import _ from 'lodash'

const NEIGHBOURING_PAGINATION_ITEMS = 3

function updatePaginationSearchParam(
  search: string,
  paginationURLParam: string,
  index: number,
): string {
  const params = search.replace(/^\?/, '').split('&').filter(Boolean)
  const paginationParam = `${encodeURIComponent(
    paginationURLParam,
  )}=${encodeURIComponent(index.toString())}`
  let updated = false

  const nextParams = params.flatMap((param) => {
    const [key] = param.split('=')

    if (key !== encodeURIComponent(paginationURLParam)) {
      return [param]
    }

    if (!updated) {
      updated = true
      return [paginationParam]
    }

    return []
  })

  if (!updated) {
    nextParams.push(paginationParam)
  }

  return nextParams.join('&')
}

function PaginationItem({
  paginationURLParam,
  active,
  index,
  setActivePage,
}: {
  paginationURLParam: string
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
        setActivePage(index)
        history.push({
          search: updatePaginationSearchParam(
            location.search,
            paginationURLParam,
            index,
          ),
        })
      }}
    >
      {index + 1}
    </Pagination.Item>
  )
}

type PaginationItemElement = { component: () => JSX.Element; index: number }

function createItems(
  start,
  end,
  activePage,
  setActivePage: (number: number) => void,
  paginationURLParam: string,
): readonly PaginationItemElement[] {
  return _.range(start, end + 1).map((index) => ({
    index: index,
    component: () => (
      <PaginationItem
        paginationURLParam={paginationURLParam}
        setActivePage={setActivePage}
        index={index}
        key={index}
        active={index === activePage}
      />
    ),
  }))
}

export default function PaginationItems({
  activePage,
  lastPage,
  setActivePage,
  paginationURLParam,
}: {
  activePage: number
  paginationURLParam: string
  lastPage: number
  setActivePage: (number: number) => void
}): JSX.Element {
  const start = Math.max(0, activePage - NEIGHBOURING_PAGINATION_ITEMS)
  const end = Math.min(activePage + NEIGHBOURING_PAGINATION_ITEMS, lastPage)
  const items = createItems(
    start,
    end,
    activePage,
    setActivePage,
    paginationURLParam,
  )

  const generatePaginationItem = (index) => (
    <PaginationItem
      paginationURLParam={paginationURLParam}
      setActivePage={setActivePage}
      index={index}
      key={index}
      active={index === activePage}
    />
  )
  const first = generatePaginationItem(0)
  const second = generatePaginationItem(1)
  const nextToLast = generatePaginationItem(lastPage - 1)
  const last = generatePaginationItem(lastPage)
  const ellipsis1 = <Pagination.Ellipsis key={lastPage + 100} />
  const ellipsis2 = <Pagination.Ellipsis key={lastPage + 200} />

  let paginationItems: JSX.Element[] = []
  const mostLeft = items[0].index
  const mostRight = items[items.length - 1].index

  mostLeft > 0 && paginationItems.push(first)
  mostLeft === 2 && paginationItems.push(second)
  mostLeft > 2 && paginationItems.push(ellipsis1)

  paginationItems = [
    ...paginationItems,
    ...items.map((item) => item.component()),
  ]

  mostRight < lastPage - 2 && paginationItems.push(ellipsis2)
  mostRight === lastPage - 2 && paginationItems.push(nextToLast)
  mostRight < lastPage && paginationItems.push(last)

  return <Pagination>{paginationItems}</Pagination>
}
