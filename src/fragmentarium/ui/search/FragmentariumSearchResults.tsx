import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import withData from 'http/withData'
import FragmentSearchResult from 'fragmentarium/ui/search/FragmentariumSearchResult'
import _ from 'lodash'
import {
  FragmentInfo,
  FragmentInfosPagination,
} from 'fragmentarium/domain/fragment'
import Pagination from 'fragmentarium/ui/search/Pagination'
import { Col, Row } from 'react-bootstrap'
import React from 'react'
interface FragmentInfoPaginationProps {
  number: string
  transliteration: string
  bibliographyId: string
  pages: string
  paginationIndex: number
  fragmentSearchService: FragmentSearchService
}

function FragmentInfoPagination({
  fragmentSearchService,
  number,
  transliteration,
  bibliographyId,
  pages,
  fragmentInfoPagination,
  paginationIndex,
}: FragmentInfoPaginationProps & {
  fragmentInfoPagination: FragmentInfosPagination
}): JSX.Element {
  const searchPagination = (pagination: number) =>
    fragmentSearchService
      .searchFragmentarium(
        number,
        transliteration,
        bibliographyId,
        pages,
        pagination
      )
      .then((fragmentInfosPagination) => fragmentInfosPagination.fragmentInfos)

  const Component = ({
    PaginationControlsComponent,
    PaginationElementComponent,
  }: {
    PaginationControlsComponent: JSX.Element
    PaginationElementComponent: JSX.Element
  }): JSX.Element => (
    <>
      <Row>
        <Col xs={{ offset: 5 }} className={'mt-2'}>
          {PaginationControlsComponent}
        </Col>
      </Row>
      <Row>
        <Col>{PaginationElementComponent}</Col>
      </Row>
      <Row></Row>
    </>
  )
  return (
    <Pagination<FragmentInfo>
      paginationElements={fragmentInfoPagination.fragmentInfos}
      totalCount={fragmentInfoPagination.totalCount}
      searchPagination={searchPagination}
      paginationIndex={paginationIndex}
      renderPagination={(
        PaginationControlsComponent,
        PaginationElementComponent
      ) => (
        <Component
          PaginationControlsComponent={PaginationControlsComponent}
          PaginationElementComponent={PaginationElementComponent}
        />
      )}
      renderPaginationElement={(data, key) => (
        <FragmentSearchResult key={key} fragmentInfo={data} />
      )}
    />
  )
}

export default withData<
  FragmentInfoPaginationProps,
  { fragmentSearchService: FragmentSearchService },
  FragmentInfosPagination
>(
  (props) =>
    props.data.fragmentInfos.length > 0 ? (
      <FragmentInfoPagination fragmentInfoPagination={props.data} {...props} />
    ) : null,
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
    ],
    filter: (props) =>
      !_.isEmpty(props.number) ||
      !_.isEmpty(props.transliteration) ||
      !_.isEmpty(props.bibliographyId),
    defaultData: () => ({ fragmentInfos: [], totalCount: 0 }),
  }
)
