import React from 'react'
import { Col, Row } from 'react-bootstrap'
import DOMPurify from 'dompurify'

const cleanse = DOMPurify.sanitize

export function AGI({
  AkkadischeGlossareUndIndices,
}: {
  AkkadischeGlossareUndIndices: any
}): JSX.Element {
  return AkkadischeGlossareUndIndices.slice()
    .sort(compareAfO)
    .map((InstanceOfAkkadischeGlossareUndIndices) => (
      <>
        <Col className="offset-md-1">
          <Row className="small text-black-50">
            <div
              dangerouslySetInnerHTML={{
                __html: cleanse(
                  InstanceOfAkkadischeGlossareUndIndices.mainWord
                ),
              }}
            />
          </Row>
          <Row>
            <div
              dangerouslySetInnerHTML={{
                __html: cleanse(InstanceOfAkkadischeGlossareUndIndices.note),
              }}
            />
          </Row>
          <Row>
            <div
              dangerouslySetInnerHTML={{
                __html: cleanse(
                  InstanceOfAkkadischeGlossareUndIndices.reference
                ),
              }}
            />
          </Row>
          <Row className="mb-3">
            <div className="small text-black-50 ml-3">
              [{InstanceOfAkkadischeGlossareUndIndices.AfO}]
            </div>
          </Row>
        </Col>
      </>
    ))
}

function compareAfO(a, b) {
  if (a.AfO.includes('Beih')) {
    return 1
  } else if (b.AfO.includes('Beih') || a.AfO > b.AfO) {
    return -1
  } else if (b.AfO > a.AfO) {
    return 1
  } else {
    return 0
  }
}
