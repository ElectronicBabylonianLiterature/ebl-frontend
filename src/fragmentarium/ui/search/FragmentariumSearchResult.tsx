import { FragmentInfo } from 'fragmentarium/domain/fragment'
import React from 'react'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { Col, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { Genres } from 'fragmentarium/domain/Genres'
import { DisplayText } from 'transliteration/ui/TransliterationLines'
import './fragmentariumSearchResult.css'

export default function FragmentSearchResult({
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
        {/*Problem with whitespace in <td/> leads to inconsistencies for Displaying Transliteration in Fragmentarium vs Transliteration in Corpus */}
        <Col>
          <div className="displayText__force_whitespace">
            {fragmentInfo.matchingLines ? (
              <DisplayText text={fragmentInfo.matchingLines} />
            ) : null}
          </div>
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
