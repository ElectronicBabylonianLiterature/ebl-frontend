import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import PaginationItems from 'fragmentarium/ui/search/PaginationItems'
import Bluebird from 'bluebird'
import withData from 'http/withData'

type renderPaginationElement<PaginationElement> = (
  data: PaginationElement,
  key: number
) => React.ReactElement<{ data: PaginationElement; key: number }>

interface Props<PaginationElement> {
  paginationElements: readonly PaginationElement[]
  totalCount: number
  searchPagination: (
    paginationIndex: number
  ) => Bluebird<readonly PaginationElement[]>
  paginationIndex: number
  renderPagination: (
    PaginationControlsComponent: JSX.Element,
    PaginationElementComponent: JSX.Element
  ) => React.ReactElement<{
    PaginationControlsComponent: JSX.Element
    PaginationElementComponent: JSX.Element
  }>
  renderPaginationElement: renderPaginationElement<PaginationElement>
}

export default function Pagination<PaginationElement>({
  paginationElements,
  totalCount,
  searchPagination,
  paginationIndex,
  renderPagination,
  renderPaginationElement,
}: Props<PaginationElement>): JSX.Element {
  const [activePage, setActivePage] = useState(paginationIndex)
  const [savedPaginationElements, setSavedPaginationElements] = useState([
    {
      paginationElements: paginationElements,
      paginationIndex: paginationIndex,
    },
  ])
  const lastPage = Math.ceil(totalCount / paginationElements.length)

  const findPaginationElements = (
    index: number
  ): readonly PaginationElement[] | null => {
    const found = _.find(savedPaginationElements, {
      paginationIndex: index,
    })
    return found ? found.paginationElements : null
  }

  const fetchAndSavePaginationElements = (
    paginationIndex: number
  ): Bluebird<readonly PaginationElement[]> =>
    searchPagination(paginationIndex).then((paginationElements) => {
      setSavedPaginationElements((stored) => [
        ...stored,
        {
          paginationElements: paginationElements,
          paginationIndex: paginationIndex,
        },
      ])
      return paginationElements
    })
  useEffect(() => {
    const succeeding = activePage + 1
    if (!findPaginationElements(succeeding) && succeeding < lastPage) {
      fetchAndSavePaginationElements(succeeding)
    }
  }, [
    activePage,
    findPaginationElements,
    fetchAndSavePaginationElements,
    lastPage,
  ])

  const DisplayActivePage = withData<
    {
      paginationElements: readonly PaginationElement[] | null
      searchPagination: (
        paginationIndex: number
      ) => Bluebird<readonly PaginationElement[]>
      activePage: number
      render: renderPaginationElement<PaginationElement>
    },
    {
      searchPagination: (
        paginationIndex: number
      ) => Bluebird<readonly PaginationElement[]>
    },
    readonly PaginationElement[]
  >(
    ({ data, render }) => (
      <>
        {data.map((paginationElement, index) =>
          render(paginationElement, index)
        )}
      </>
    ),
    (props) => props.searchPagination(props.activePage),
    {
      filter: (props) => _.isNil(props.paginationElements),
      defaultData: (props) => props.paginationElements,
    }
  )

  return (
    <>
      {' '}
      {renderPagination(
        <PaginationItems
          setActivePage={setActivePage}
          totalPages={lastPage}
          activePage={activePage}
        />,
        <DisplayActivePage
          render={renderPaginationElement}
          paginationElements={findPaginationElements(activePage)}
          searchPagination={fetchAndSavePaginationElements}
          activePage={activePage}
        />
      )}
    </>
  )
}
