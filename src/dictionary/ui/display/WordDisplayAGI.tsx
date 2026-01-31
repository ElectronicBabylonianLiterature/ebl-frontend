import React from 'react'
import { Col, Row } from 'react-bootstrap'
import DOMPurify from 'dompurify'
import compareAfO from 'dictionary/domain/compareWordAGI'
import { AkkadischeGlossareUndIndex } from 'dictionary/domain/Word'

const cleanse = DOMPurify.sanitize

export function AGI({
  AkkadischeGlossareUndIndices,
}: {
  AkkadischeGlossareUndIndices: readonly AkkadischeGlossareUndIndex[]
}): JSX.Element {
  return AkkadischeGlossareUndIndices.slice()
    .sort(compareAfO)
    .map((InstanceOfAkkadischeGlossareUndIndices, index) => (
      <React.Fragment key={index}>
        <Row className="ml-5">
          <Col>
            <Row className="small text-black-50">
              <div
                dangerouslySetInnerHTML={{
                  __html: cleanse(
                    InstanceOfAkkadischeGlossareUndIndices.mainWord,
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
                    InstanceOfAkkadischeGlossareUndIndices.reference,
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
        </Row>
      </React.Fragment>
    ))
}
