import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import { Col, Container, Row } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import { isShift, isTextLine } from 'transliteration/domain/type-guards'
import './FragmentAnnotator.sass'
import { TextLine } from 'transliteration/domain/text-line'
import { AbstractLine } from 'transliteration/domain/abstract-line'

function isMarkable(token: Token): boolean {
  return !isShift(token)
}

function DisplayMarkableRow({ line }: { line: TextLine }): JSX.Element {
  return (
    <Row>
      {line.content.map((token, index) => (
        <React.Fragment key={index}>
          {index !== 0 && <>&nbsp;</>}
          {isMarkable(token) && (
            <Col className={'fragment-annotator__markable-token'}>
              {token.cleanValue}
            </Col>
          )}
        </React.Fragment>
      ))}
    </Row>
  )
}

function DisplayUnmarkableRow({ line }: { line: AbstractLine }): JSX.Element {
  return <Row>{`(${line.prefix}A ${line.type})`}</Row>
}

export default function FragmentAnnotator({
  fragment,
}: {
  fragment: Fragment
}): JSX.Element {
  console.log(fragment.text)
  return (
    <>
      {fragment.text.lines.map((line, index) => (
        <Container key={index}>
          {isTextLine(line) ? (
            <DisplayMarkableRow line={line} />
          ) : (
            <DisplayUnmarkableRow line={line} />
          )}
        </Container>
      ))}
    </>
  )
}
