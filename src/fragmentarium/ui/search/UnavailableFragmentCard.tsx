import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import FragmentLink from 'fragmentarium/ui/FragmentLink'

export function UnavailableSummaryNote(): JSX.Element {
  return (
    <small className={'text-secondary'}>
      Details for this result are unavailable.
    </small>
  )
}

export default function UnavailableFragmentCard({
  museumNumber,
}: {
  museumNumber: string
}): JSX.Element {
  return (
    <Container>
      <Row className={'fragment-result__header'}>
        <Col xs={12}>
          <h4 className={'fragment-result__fragment-number'}>
            <FragmentLink number={museumNumber}>{museumNumber}</FragmentLink>
          </h4>
          <UnavailableSummaryNote />
        </Col>
      </Row>
      <hr />
    </Container>
  )
}
