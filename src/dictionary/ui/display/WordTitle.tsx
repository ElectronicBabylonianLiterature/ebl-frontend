import React from 'react'
import Word from 'dictionary/domain/Word'
import { Markdown } from 'common/Markdown'
import { Button, Col, Row } from 'react-bootstrap'
import Ipa from 'akkadian/ui/ipa'

export default function WordTitle({ word }: { word: Word }): JSX.Element {
  const guideWord = `[${word.guideWord}]`
  const pos = word.pos[0] ?? ''
  const copyableInformation = `+${word.lemma[0]}${guideWord}${pos}$`

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

        <Col xs="auto" className="pr-5 mr-5">
          <div className="border border-dark p-1 text-secondary h6">
            {copyableInformation}
            <Button
              className="ml-2 copyIcon"
              onClick={async () =>
                await navigator.clipboard.writeText(copyableInformation)
              }
            >
              <i className="fas fa-copy" />
            </Button>
          </div>
        </Col>
      </Row>
      <Col>
        <Row>{Ipa(word.lemma)}</Row>
      </Col>
      {word.arabicGuideWord.length > 0 && (
        <Row>
          <Col className="arabicGuideWord">{word.arabicGuideWord}</Col>
        </Row>
      )}
    </>
  )
}
