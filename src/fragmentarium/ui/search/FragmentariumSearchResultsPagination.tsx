import {
  FragmentInfo,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import FragmentSearchService, {
  FragmentInfosPaginationPromise,
} from 'fragmentarium/application/FragmentSearchService'
import { Col, Pagination } from 'react-bootstrap'
import WordService from 'dictionary/application/WordService'
import FragmentInfoDisplay from 'fragmentarium/ui/search/FragmentariumSearchResult'

type searchPagination = (index: number) => FragmentInfosPaginationPromise

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
      props.pages
    ),
  {
    watch: (props) => [
      props.number,
      props.transliteration,
      props.bibliographyId,
      props.pages,
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
  const [activePage, setActivePage] = useState(paginationIndex)

  const [savedFragmentInfos, setSavedFragmentInfos] = useState<
    { fragmentInfos: readonly FragmentInfo[]; paginationIndex: number }[]
  >([{ fragmentInfos: fragmentInfos, paginationIndex: paginationIndex }])

  const pages = Math.ceil(totalCount / 100)
  const items = [...Array(pages).keys()].map((number, index) => {
    const page = (index + 1).toString()

    return (
      <Pagination.Item
        key={index}
        active={index === activePage}
        onClick={() => {
          setActivePage(index)
        }}
      >
        {page}
      </Pagination.Item>
    )
  })

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
    if (items[succeeding]) {
      searchPagination(succeeding).then((fragmentInfosPagination) =>
        storeFragmentInfos(fragmentInfosPagination.fragmentInfos, succeeding)
      )
    }
  })

  const FragmentInfosPageWithData = withData<
    {
      activePage: number
      searchPagination: searchPagination
      storeFragmentInfos: (
        fragmentInfos: readonly FragmentInfo[],
        activePage: number
      ) => void
    },
    { searchPagination: searchPagination },
    any
  >(
    ({ data }) => (
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
    (props) =>
      props
        .searchPagination(props.activePage)
        .then((fragmentInfoPagination) => {
          const fragmentInfos = fragmentInfoPagination.fragmentInfos
          storeFragmentInfos(fragmentInfos, activePage)
          return fragmentInfos
        }),
    {
      watch: (props) => [props.activePage],
    }
  )

  const FragmentInfoPage = ({ activePage }: { activePage: number }) => {
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
          searchPagination={searchPagination}
          storeFragmentInfos={storeFragmentInfos}
          activePage={activePage}
        />
      )
    }
  }

  return (
    <>
      <FragmentInfoPage activePage={activePage} />
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
