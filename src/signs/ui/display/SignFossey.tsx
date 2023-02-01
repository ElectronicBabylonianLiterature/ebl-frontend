import React from 'react'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import _ from 'lodash'
import { Fossey } from 'signs/domain/Sign'

export default function FosseyDisplay({
  fosseys,
}: {
  fosseys: readonly Fossey[]
}): JSX.Element | null {
  return (
    <Row className={'mt-5'}>
      <Row>
        <Col>
          <h3>&#8546;. Fossey, Manuel d’assyriologie &#8545;</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'ml-4 mt-5 pt-3 mb-3'}>
          <FosseyContent fosseys={fosseys} />
        </Col>
      </Row>
    </Row>
  )
}

function FosseyContent({ fosseys }: { fosseys: readonly Fossey[] }) {
  const sortedFosseys = _.sortBy(fosseys, (elem) => elem.number)
  const updatedFosseys = _.reduce(
    sortedFosseys,
    (array: any[], fosseyElem) => {
      if (fosseyElem.sign == '') {
        if (array.length > 0 && Array.isArray(array[array.length - 1])) {
          array[array.length - 1].push(fosseyElem)
        } else {
          array.push([fosseyElem])
        }
      } else {
        array.push(fosseyElem)
      }
      return array
    },
    []
  )

  const renderColumn = (fosseys) => {
    return (
      <Col>
        {fosseys.map((fosseyElem, index) => {
          if (Array.isArray(fosseyElem)) {
            return (
              <Row key={index}>
                <Col className="mx-auto my-auto">
                  <strong>{fosseyElem[0].number}</strong>
                  {'...'}
                  <strong>{fosseyElem[fosseyElem.length - 1].number}</strong>
                </Col>
              </Row>
            )
          } else {
            return (
              <Row key={index}>
                <Col className="mx-auto my-auto">
                  <strong>{fosseyElem.number}</strong>
                </Col>
                <Col className={'mx-auto'}>
                  <img
                    style={{ maxWidth: '200px' }}
                    src={`data:image/png;base64, ${fosseyElem.sign}`}
                  />
                </Col>
                <Col className={'mx-auto'}>
                  {fosseyElem.reference}
                  <br />
                  {fosseyElem.museumNumber && (
                    <>
                      (={' '}
                      <Link
                        to={`/fragmentarium/${museumNumberToString(
                          fosseyElem.museumNumber
                        )}`}
                      >
                        {museumNumberToString(fosseyElem.museumNumber)}){' '}
                      </Link>
                    </>
                  )}
                  {fosseyElem.date && (
                    <span className="text-left text-black-50">
                      ({fosseyElem.date})
                    </span>
                  )}
                </Col>
              </Row>
            )
          }
        })}
      </Col>
    )
  }
  let renderResult
  if (updatedFosseys.length > 1) {
    renderResult = (
      <Row>
        {renderColumn(
          updatedFosseys.slice(0, Math.floor(updatedFosseys.length / 2))
        )}
        {renderColumn(
          updatedFosseys.slice(
            Math.floor(updatedFosseys.length / 2) + 1,
            updatedFosseys.length
          )
        )}
      </Row>
    )
  } else {
    renderResult = <Row>{renderColumn(updatedFosseys)}</Row>
  }
  return <>{renderResult}</>
}
