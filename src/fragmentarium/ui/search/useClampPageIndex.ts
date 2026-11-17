import React from 'react'
import { useLocation } from 'react-router-dom'
import { useHistory } from 'router/compat'
import { updatePaginationSearchParam } from 'fragmentarium/ui/search/pagination'

export default function useClampPageIndex(
  pageIndex: number,
  lastPageIndex: number | null,
  paginationURLParam: string,
): boolean {
  const location = useLocation()
  const history = useHistory()

  React.useEffect(() => {
    if (lastPageIndex !== null && pageIndex > lastPageIndex) {
      history.replace({
        pathname: location.pathname,
        search: updatePaginationSearchParam(
          location.search,
          paginationURLParam,
          lastPageIndex,
        ),
        hash: location.hash,
      })
    }
  }, [
    history,
    lastPageIndex,
    location.hash,
    location.pathname,
    location.search,
    pageIndex,
    paginationURLParam,
  ])

  return lastPageIndex !== null && pageIndex > lastPageIndex
}
