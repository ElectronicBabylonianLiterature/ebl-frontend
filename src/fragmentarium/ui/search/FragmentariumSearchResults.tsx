import { FragmentInfo } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Col, Pagination, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'

function Lines({ fragment }: { fragment: FragmentInfo }) {
  return (
    <ol className="TransliterationSearch__list">
      {fragment.matchingLines.map((group, index) => (
        <li key={index} className="TransliterationSearch__list_item">
          <ol className="TransliterationSearch__list">
            {group.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
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
function FragmentInfoDisplay({
  fragmentInfo,
}: {
  fragmentInfo: FragmentInfo
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
          <Lines fragment={fragmentInfo} />
        </Col>
      </Row>
    </>
  )
}
function FragmentInfoPagination({
  fragmentInfos,
  paginationLength = 5,
  fragmentariumSearch,
}: {
  fragmentInfos: readonly FragmentInfo[]
  paginationLength?: number
  fragmentariumSearch: any
}): JSX.Element {
  const [activePage, setActivePage] = useState(0)
  const [fragmentInfosFetched, setFragmentInfoFetched] = useState<any>([
    { fragmentInfos: fragmentInfos, index: 0 },
  ])
  const addFragmentInfoFetched = (fragmentInfos, activePage) =>
    setFragmentInfoFetched((old) => [
      ...old,
      { fragmentInfos: fragmentInfos, index: activePage },
    ])

  const items = [...Array(paginationLength).keys()].map((_, index) => {
    return (
      <Pagination.Item
        key={index}
        active={index === activePage}
        onClick={async () => {
          setActivePage(index)
          const fragmentInfosToDisplay = await fragmentariumSearch(index)
          setFragmentInfoFetched((fetched) => [
            ...fetched,
            { fragmentInfos: fragmentInfosToDisplay, index: index },
          ])
        }}
      >
        {index + 1}
      </Pagination.Item>
    )
  })

  useEffect(() => {
    async function fetchSecondPage() {
      const fragmentInfos = await fragmentariumSearch(1)
      addFragmentInfoFetched(fragmentInfos, 1)
    }
    fetchSecondPage()
  })

  const F = (fragmentInfos) => {
    if (fragmentInfos) {
      return (
        <FragmentariumSearchResult
          fragmentInfos={fragmentInfos}
          activePage={activePage}
        />
      )
    } else {
      return null
    }
  }

  return (
    <>
      <F
        fragmentInfos={
          fragmentInfosFetched
            .filter((fragmentInfo) => fragmentInfo.index === activePage)
            .next() || null
        }
      />
      <Col xs={{ offset: 5 }}>
        <Pagination>{items}</Pagination>
      </Col>
    </>
  )
}

function FragmentariumSearchResult({
  fragmentInfos,
  activePage,
}: {
  fragmentInfos: readonly FragmentInfo[]
  activePage: number
}) {
  return (
    <>
      {fragmentInfos.map((fragmentInfo, index) => (
        <FragmentInfoDisplay key={index} fragmentInfo={fragmentInfo} />
      ))}
    </>
  )
}

export default withData<
  {
    number: string
    transliteration: string
    bibliographyId: string
    pages: string
    fragmentSearchService: FragmentSearchService
  },
  { fragmentSearchService: FragmentSearchService },
  readonly FragmentInfo[]
>(
  ({
    data,
    number,
    transliteration,
    bibliographyId,
    pages,
    fragmentSearchService,
  }) => (
    <FragmentInfoPagination
      fragmentInfos={data}
      fragmentariumSearch={(pagination: number) =>
        fragmentSearchService.searchFragmentarium(
          number,
          transliteration,
          bibliographyId,
          pages
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
    defaultData: [],
  }
)
