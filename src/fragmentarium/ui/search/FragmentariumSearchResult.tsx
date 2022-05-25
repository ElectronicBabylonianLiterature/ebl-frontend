import { FragmentInfo } from 'fragmentarium/domain/fragment'
import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { Col, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import { DisplayText } from 'transliteration/ui/TransliterationLines'
import WordService from 'dictionary/application/WordService'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

export default function FragmentSearchResult({
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
