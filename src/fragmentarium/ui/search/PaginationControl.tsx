import React from 'react'
import { Pagination } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import { updatePaginationSearchParam } from 'fragmentarium/ui/search/pagination'

export default function PaginationControl({
  paginationURLParam,
  hash,
  index,
  disabled,
  active = false,
  children,
}: {
  paginationURLParam: string
  hash?: string
  index: number
  disabled: boolean
  active?: boolean
  children: React.ReactNode
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const destinationHash = hash ?? location.hash
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
        disabled
          ? undefined
          : `${location.pathname}?${search}${destinationHash}`
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
          hash: destinationHash,
        })
      }}
    >
      {children}
    </Pagination.Item>
  )
}
