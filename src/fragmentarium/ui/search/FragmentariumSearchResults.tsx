import {
  FragmentInfo,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import FragmentSearchService, {
  FragmentInfosPaginationPromise,
  FragmentInfosPromise,
} from 'fragmentarium/application/FragmentSearchService'
import { Col, Pagination } from 'react-bootstrap'
import WordService from 'dictionary/application/WordService'
import FragmentInfoDisplay from 'fragmentarium/ui/search/FragmentariumSearchResult'
import { parse, stringify } from 'query-string'
import { useHistory, useLocation } from 'react-router-dom'

type searchPagination = (index: number) => FragmentInfosPaginationPromise
interface FragmentInfosChunk {
  fragmentInfos: readonly FragmentInfo[]
  paginationIndex: number
}

export default withData<
  {
    number: string
    transliteration: string
    bibliographyId: string
    pages: string
    paginationIndex: number
    fragmentSearchService: FragmentSearchService
    wordService: WordService
  },
  { fragmentSearchService: FragmentSearchService },
  FragmentInfosPagination
>(
  ({
    data,
    number,
    transliteration,
    bibliographyId,
    pages,
    paginationIndex,
    fragmentSearchService,
    wordService,
  }) => (
    <FragmentInfos
      wordService={wordService}
      fragmentInfos={data.fragmentInfos}
      totalCount={data.totalCount}
      paginationIndex={paginationIndex}
      searchPagination={(pagination: number) =>
        fragmentSearchService.searchFragmentarium(
          number,
          transliteration,
          bibliographyId,
          pages,
          pagination
        )
      }
    />
  ),
  (props) =>
    props.fragmentSearchService.searchFragmentarium(
      props.number,
      props.transliteration,
      props.bibliographyId,
      props.pages,
      props.paginationIndex
    ),
  {
    watch: (props) => [
      props.number,
      props.transliteration,
      props.bibliographyId,
      props.pages,
      props.paginationIndex,
    ],
    filter: (props) =>
      !_.isEmpty(props.number) ||
      !_.isEmpty(props.transliteration) ||
      !_.isEmpty(props.bibliographyId),
    defaultData: { fragmentInfos: [], totalCount: 0 },
  }
)

function FragmentInfos({
  fragmentInfos,
  totalCount,
  searchPagination,
  wordService,
  paginationIndex,
}: {
  fragmentInfos: readonly FragmentInfo[]
  totalCount: number
  searchPagination: searchPagination
  wordService: WordService
  paginationIndex: number
}): JSX.Element {
  const location = useLocation()
  const history = useHistory()
  const [activePage, setActivePage] = useState(paginationIndex)
  const [savedFragmentInfos, setSavedFragmentInfos] = useState<
    FragmentInfosChunk[]
  >([{ fragmentInfos: fragmentInfos, paginationIndex: paginationIndex }])

  const pages = Math.ceil(totalCount / 100)
  const items = [...Array(pages).keys()].map((number, index) => {
    const page = (index + 1).toString()
    return (
      <Pagination.Item
        key={index}
        active={index === activePage}
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
        {page}
      </Pagination.Item>
    )
  })
  const searchAndStorePagination = (paginationIndex): FragmentInfosPromise => {
    return searchPagination(paginationIndex).then((fragmentInfoPagination) => {
      const fragmentInfos = fragmentInfoPagination.fragmentInfos
      storeFragmentInfos(fragmentInfos, activePage)
      return fragmentInfos
    })
  }

  const storeFragmentInfos = (
    fragmentInfos: readonly FragmentInfo[],
    paginationIndex: number
  ): void => {
    const fragmentInfosAlreadyExist = _.find(savedFragmentInfos, {
      paginationIndex: paginationIndex,
    })
    if (!fragmentInfosAlreadyExist) {
      setSavedFragmentInfos((stored) => [
        ...stored,
        { fragmentInfos: fragmentInfos, paginationIndex: paginationIndex },
      ])
    }
  }

  useEffect(() => {
    const succeeding = activePage + 1
    items[succeeding] ||
      searchPagination(succeeding).then((fragmentInfosPagination) =>
        storeFragmentInfos(fragmentInfosPagination.fragmentInfos, succeeding)
      )
  })

  return (
    <>
      <FragmentInfoPage
        activePage={activePage}
        wordService={wordService}
        savedFragmentInfos={savedFragmentInfos}
        searchAndStorePagination={searchAndStorePagination}
      />
      <Col xs={{ offset: 5 }} className={'mt-2'}>
        {_.chunk(items, 20).map((itemsChunk, index) => (
          <Pagination size="sm" key={index}>
            {itemsChunk}
          </Pagination>
        ))}
      </Col>
    </>
  )
}

const FragmentInfoPage = ({
  activePage,
  wordService,
  savedFragmentInfos,
  searchAndStorePagination,
}: {
  activePage: number
  wordService: WordService
  savedFragmentInfos: readonly FragmentInfosChunk[]
  searchAndStorePagination: any
}) => {
  const foundFragmentInfo = savedFragmentInfos.find(
    (fragmentInfo) => fragmentInfo.paginationIndex === activePage
  )
  if (foundFragmentInfo) {
    return (
      <>
        {foundFragmentInfo.fragmentInfos.map((fragmentInfo, index) => (
          <FragmentInfoDisplay
            key={index}
            fragmentInfo={fragmentInfo}
            wordService={wordService}
          />
        ))}
      </>
    )
  } else {
    return (
      <FragmentInfosPageWithData
        searchPagination={searchAndStorePagination}
        activePage={activePage}
        wordService={wordService}
      />
    )
  }
}

const FragmentInfosPageWithData = withData<
  {
    activePage: number
    searchPagination: (paginationIndex: number) => FragmentInfosPromise
    wordService: WordService
  },
  { searchPagination: searchPagination },
  readonly FragmentInfo[]
>(
  ({ data, wordService }) => (
    <>
      {data.map((fragmentInfo, index) => (
        <FragmentInfoDisplay
          key={index}
          fragmentInfo={fragmentInfo}
          wordService={wordService}
        />
      ))}
    </>
  ),
  (props) => props.searchPagination(props.activePage),
  {
    watch: (props) => [props.activePage],
  }
)
