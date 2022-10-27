import React, { Fragment } from 'react'
import { Col, Row } from 'react-bootstrap'
import { Logogram } from 'dictionary/domain/Word'
//import { Markdown } from 'common/Markdown'

export function Logograms({
  logograms,
}: {
  logograms: readonly Logogram[]
}): JSX.Element {
  return (
    <Fragment key="akkadischeLogogramme">
      {logograms.map((logogram, i) => (
        <Row className="ml-5" key={`logogram_${i}`}>
          <Col>
            <a href={`/signs/${logogram.logogram.join(' ')}`}>𒄀</a>&emsp;
            <span>{logogram.logogram.join(' ')}</span>&emsp;
            <span>{logogram.notes.join(' ')}</span>
          </Col>
        </Row>
      ))}
    </Fragment>
  )
}

//<Markdown text={word.cdaAddenda} />
