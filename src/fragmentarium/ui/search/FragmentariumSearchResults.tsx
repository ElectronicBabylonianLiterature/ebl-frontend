import { FragmentInfo } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import _ from 'lodash'
import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import FragmentSearchService from 'fragmentarium/application/FragmentSearchService'
import { Col, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import { DisplayText } from 'transliteration/ui/TransliterationLines'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

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

function FragmentariumSearchResult({
  fragmentInfos,
  wordService,
}: {
  fragmentInfos: readonly FragmentInfo[]
  wordService: WordService
}) {
  return (
    <>
      {fragmentInfos.map((fragmentInfo, index) => (
        <FragmentInfoDisplay
          key={index}
          wordService={wordService}
          fragmentInfo={fragmentInfo}
        />
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
    wordService: WordService
  },
  { fragmentSearchService: FragmentSearchService },
  readonly FragmentInfo[]
>(
  ({ data, wordService }) => (
    <FragmentariumSearchResult wordService={wordService} fragmentInfos={data} />
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
