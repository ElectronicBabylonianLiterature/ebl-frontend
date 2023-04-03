import React from 'react'
import Word from 'dictionary/domain/Word'
import { Markdown } from 'common/Markdown'
import { Col, Row } from 'react-bootstrap'
import Ipa from 'akkadian/ui/ipa'

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
          <Ipa transcription={word.lemma} />
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
