import { FragmentInfo } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Col, Row } from 'react-bootstrap'
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
          <ReferenceList references={fragmentInfo.references} />
        </Col>
        <Col>
          <Lines fragment={fragmentInfo} />
        </Col>
      </Row>
    </>
  )
}

function FragmentariumSearchResult({
  fragmentInfos,
}: {
  fragmentInfos: readonly FragmentInfo[]
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
  },
  { fragmentSearchService: FragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ data }) => <FragmentariumSearchResult fragmentInfos={data} />,
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
