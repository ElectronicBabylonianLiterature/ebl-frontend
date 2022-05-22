import {
  FragmentInfo,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentSearchService, {
  FragmentInfosPaginationPromise,
} from 'fragmentarium/application/FragmentSearchService'
import { Col, Pagination, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import Bluebird from 'bluebird'
import { DisplayText } from 'transliteration/ui/TransliterationLines'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

type searchPagination = (index: number) => FragmentInfosPaginationPromise

export default withData<
  {
    number: string
    transliteration: string
    bibliographyId: string
    pages: string
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
    fragmentSearchService,
    wordService,
  }) => (
    <FragmentInfos
      wordService={wordService}
      fragmentInfos={data.fragmentInfos}
      totalCount={data.totalCount}
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
}: {
  fragmentInfos: readonly FragmentInfo[]
  totalCount: number
  searchPagination: searchPagination
  wordService: WordService
}): JSX.Element {
  const [activePage, setActivePage] = useState(0)
  const pages = useState(Math.ceil(totalCount / 100))
  const [fragmentInfosSaved, setFragmentInfosSaved] = useState<any>([
    { fragmentInfos: fragmentInfos, index: 0 },
  ])
  const items = [...Array(pages).keys()].map((_, index) => {
    return (
      <Pagination.Item
        key={index}
        active={index === activePage}
        onClick={() => setActivePage(index)}
      >
        {index + 1}
      </Pagination.Item>
    )
  })

  const addFragmentInfoSaved = (
    fragmentInfos: readonly FragmentInfo[],
    activePage: number
  ): void => {
    const fragmentInfoExists = _.find(fragmentInfosSaved, { index: activePage })

    fragmentInfoExists ||
      setFragmentInfosSaved((old) => [
        ...old,
        { fragmentInfos: fragmentInfos, index: activePage },
      ])
  }

  useEffect(() => {
    const preceedingFragmentInfos = activePage + 1
    searchPagination(preceedingFragmentInfos).then((fragmentInfos) =>
      addFragmentInfoSaved(fragmentInfos.fragmentInfos, preceedingFragmentInfos)
    )
  })

  return (
    <>
      <FragmentInfosPageWithData
        storeFragmentInfos={addFragmentInfoSaved}
        wordService={wordService}
        searchPagination={searchPagination}
        fragmentInfos={fragmentInfosSaved.find(
          (fragmentInfo) => fragmentInfo.index === activePage
        )}
        activeIndex={activePage}
      />
      <Col xs={{ offset: 5 }}>
        <Pagination>{items}</Pagination>
      </Col>
    </>
  )
}

const FragmentInfosPageWithData = withData<
  {
    fragmentInfos: readonly FragmentInfo[] | undefined
    wordService: WordService
    searchPagination: searchPagination
    activeIndex: number
    storeFragmentInfos: any
  },
  { searchPagination: searchPagination },
  any
>(
  ({ data, activeIndex, storeFragmentInfos, wordService }) => (
    <FragmentInfosPage
      wordService={wordService}
      storeFragmentInfos={storeFragmentInfos}
      fragmentInfos={data?.fragmentInfos}
      activeIndex={activeIndex}
    />
  ),
  (props) =>
    props.fragmentInfos
      ? Bluebird.resolve(props.fragmentInfos)
      : props.searchPagination(props.activeIndex),
  {
    watch: (props) => [props.activeIndex],
  }
)

function FragmentInfosPage({
  fragmentInfos,
  activeIndex,
  storeFragmentInfos,
  wordService,
}: {
  wordService: WordService
  fragmentInfos: readonly FragmentInfo[]
  activeIndex: number
  storeFragmentInfos: (
    fragmentInfos: readonly FragmentInfo[],
    activeIndex: number
  ) => void
}) {
  storeFragmentInfos(fragmentInfos, activeIndex)
  return (
    <>
      {fragmentInfos.map((fragmentInfo, index) => (
        <FragmentInfoDisplay
          wordService={wordService}
          key={index}
          fragmentInfo={fragmentInfo}
        />
      ))}
    </>
  )
}

function FragmentInfoDisplay({
  fragmentInfo,
  wordService,
}: {
  fragmentInfo: FragmentInfo
  wordService: WordService
}): JSX.Element {
  const script = fragmentInfo.script ? ` (${fragmentInfo.script})` : ''
  return (
    <>
      <hr />
      <Row>
        <Col xs={3}>
          <h4>
            <FragmentLink number={fragmentInfo.number}>
              {fragmentInfo.number}
            </FragmentLink>
            {script}
          </h4>
        </Col>
        <Col className={'text-center text-secondary'}>
          <GenresDisplay genres={fragmentInfo.genres} />
        </Col>
      </Row>
      <Row>
        <Col xs={3} className={'text-secondary'}>
          <small>
            <ReferenceList references={fragmentInfo.references} />
          </small>
        </Col>
        <Col>
          {fragmentInfo.matchingLines ? (
            <DictionaryContext.Provider value={wordService}>
              <DisplayText text={fragmentInfo.matchingLines} />
            </DictionaryContext.Provider>
          ) : null}
        </Col>
      </Row>
    </>
  )
}

function GenresDisplay({ genres }: { genres: Genres }): JSX.Element {
  return (
    <ul>
      {genres.genres.map((genreItem) => {
        const uncertain = genreItem.uncertain ? '(?)' : ''
        return (
          <ul key={genreItem.toString}>
            <small>{`${genreItem.category.join(' ➝ ')} ${uncertain}`}</small>
          </ul>
        )
      })}
    </ul>
  )
}
