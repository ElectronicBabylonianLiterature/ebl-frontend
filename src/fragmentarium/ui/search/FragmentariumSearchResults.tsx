import { FragmentInfo } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Col, Pagination, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import Bluebird from 'bluebird'

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
      </Row>
    </>
  )
}
/*
function FragmentInfosPage ({ fragmentInfos, activeIndex, savedFetchFragmentInfo }) {
  savedFetchFragmentInfo(fragmentInfos, activeIndex)
  return (
    <>
      {fragmentInfos.map((fragmentInfo, index) => (
        <FragmentInfoDisplay key={index} fragmentInfo={fragmentInfo} />
      ))}
    </>
  )
}
 */

function FragmentInfoPagination({
  fragmentInfos,
  totalCount,
  fragmentariumSearch,
}: {
  fragmentInfos: readonly FragmentInfo[]
  totalCount: number
  fragmentariumSearch: any
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
    fragmentariumSearch(1).then((fragmentInfos) =>
      addFragmentInfoSaved(fragmentInfos.fragmentInfos, 1)
    )
  })

  const FragmentInfosPage = ({ fragmentInfos, activeIndex }) => {
    addFragmentInfoSaved(fragmentInfos, activeIndex)
    return (
      <>
        {fragmentInfos.map((fragmentInfo, index) => (
          <FragmentInfoDisplay key={index} fragmentInfo={fragmentInfo} />
        ))}
      </>
    )
  }

  const FragmentInfosPageWithData = withData<any, any, any>(
    ({ data, activeIndex }) => (
      <FragmentInfosPage
        fragmentInfos={data.fragmentInfos}
        activeIndex={activeIndex}
      />
    ),
    (props) =>
      props.fragmentInfos
        ? Bluebird.resolve(props.fragmentInfos)
        : props.fragmentariumSearch(props.activeIndex),
    {
      watch: (props) => [props.activeIndex],
    }
  )

  return (
    <>
      <FragmentInfosPageWithData
        fragmentariumSearch={fragmentariumSearch}
        fragmentInfos={fragmentInfosSaved.find(
          (fragmentInfo) => fragmentInfo.index === activePage
        )}
        activePage={activePage}
      />
      <Col xs={{ offset: 5 }}>
        <Pagination>{items}</Pagination>
      </Col>
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
  { fragmentInfos: readonly FragmentInfo[]; totalCount: number }
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
      fragmentInfos={data.fragmentInfos}
      totalCount={data.totalCount}
      fragmentariumSearch={(pagination: number) =>
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
