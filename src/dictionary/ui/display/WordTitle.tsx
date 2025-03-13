import React from 'react'
import Word from 'dictionary/domain/Word'
import { Markdown } from 'common/Markdown'
import { Col, Row } from 'react-bootstrap'
import transcriptionsToPhoneticSegments from 'akkadian/application/phonetics/segments'
import { Ipa } from 'akkadian/ui/akkadianWordAnalysis'

function wordIpa(word: Word): JSX.Element {
  try {
    return (
      <Ipa
        segments={transcriptionsToPhoneticSegments(word.lemma)}
        enclose={true}
      />
    )
  } catch {
    return <></>
  }
}

export default function WordTitle({ word }: { word: Word }): JSX.Element {
  return (
    <>
      <Row>
        <Col>
          <strong>
            {word.attested === false && '*'}
            {word.lemma.join(' ')} {word.homonym}
          </strong>
          {word.guideWord.length > 0 && (
            <>
              , &ldquo;
              <Markdown text={word.guideWord} />
              &rdquo;
            </>
          )}
        </Col>
        {word.pos.length > 0 && (
          <Col>
            <h5 className="text-secondary">({word.pos.join(', ')})</h5>
          </Col>
        )}
        <Col xs="auto" className="ipaTranscription pr-5 mr-5">
          {wordIpa(word)}
        </Col>
      </Row>
      {word.arabicGuideWord.length > 0 && (
        <Row>
          <Col className="arabicGuideWord">{word.arabicGuideWord}</Col>
        </Row>
      )}
    </>
  )
}
