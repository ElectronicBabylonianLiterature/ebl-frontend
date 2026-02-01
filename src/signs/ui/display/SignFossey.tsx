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
          <h3>&#8547;. Fossey, Manuel d’assyriologie &#8545;</h3>
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

function collapseFosseysWithoutSigns(
  fosseys: readonly Fossey[],
): readonly (Fossey | readonly Fossey[])[] {
  const sortedFosseys = _.sortBy(fosseys, (elem) => elem.number)
  return _.reduce(
    sortedFosseys,
    (array: (Fossey | Fossey[])[], fosseyElem) => {
      if (fosseyElem.sign === '') {
        if (array.length > 0 && Array.isArray(array[array.length - 1])) {
          ;(array[array.length - 1] as Fossey[]).push(fosseyElem)
        } else {
          array.push([fosseyElem])
        }
      } else {
        array.push(fosseyElem)
      }
      return array
    },
    [],
  )
}

function FosseyContent({ fosseys }: { fosseys: readonly Fossey[] }) {
  const fosseysCollapsed = collapseFosseysWithoutSigns(fosseys)

  if (fosseysCollapsed.length > 1) {
    return (
      <>
        <Row>
          <FosseyContentColumn
            fosseys={fosseysCollapsed.slice(
              0,
              Math.floor(fosseysCollapsed.length / 2),
            )}
          />
          <FosseyContentColumn
            fosseys={fosseysCollapsed.slice(
              Math.floor(fosseysCollapsed.length / 2) + 1,
              fosseysCollapsed.length,
            )}
          />
        </Row>
      </>
    )
  } else {
    return (
      <>
        <Row>
          {' '}
          <FosseyContentColumn fosseys={fosseysCollapsed} />
        </Row>
      </>
    )
  }
}

function FosseyContentColumn({
  fosseys,
}: {
  fosseys: readonly (Fossey | readonly Fossey[])[]
}) {
  return (
    <Col>
      {fosseys.map((fosseyElem, index) => {
        if (Array.isArray(fosseyElem)) {
          return (
            <Row key={index}>
              <Col className="mx-auto my-auto">
                <strong>{fosseyElem[0].number}</strong>
                {' – '}
                <strong>{fosseyElem[fosseyElem.length - 1].number}</strong>
              </Col>
            </Row>
          )
        } else {
          fosseyElem = fosseyElem as Fossey
          return (
            <Row key={index}>
              <Col className="mx-auto my-auto">
                <strong>{fosseyElem.number}</strong>
              </Col>
              <Col className={'mx-auto'}>
                <img
                  style={{ maxWidth: '200px' }}
                  src={`data:image/png;base64, ${fosseyElem.sign}`}
                  alt=""
                />
              </Col>
              <Col className={'mx-auto'}>
                {fosseyElem.reference}
                <br />
                {fosseyElem.museumNumber && (
                  <>
                    (={' '}
                    <Link
                      to={`/library/${museumNumberToString(
                        fosseyElem.museumNumber,
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
