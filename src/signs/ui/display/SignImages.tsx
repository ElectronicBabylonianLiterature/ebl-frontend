import SignService from 'signs/application/SignService'
import React from 'react'
import withData, { WithoutData } from 'http/withData'
import { Button, Card, Col, Container, Figure, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'

import _ from 'lodash'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periodFromAbbreviation, Periods } from 'common/period'

type Props = {
  signName: string
  data: CroppedAnnotation[]
  signService: SignService
}

export default withData<
  WithoutData<Props>,
  { signName: string; signService: SignService },
  CroppedAnnotation[]
>(
  ({ data }) =>
    data.length ? <SignImagePagination croppedAnnotations={data} /> : null,
  (props) => props.signService.getImages(props.signName)
)
function SignImage({
  croppedAnnotation,
}: {
  croppedAnnotation: CroppedAnnotation
}): JSX.Element {
  const label = croppedAnnotation.label ? `${croppedAnnotation.label} ` : ''
  return (
    <Col>
      <Figure>
        <Figure.Image
          className={'sign-images__sign-image'}
          src={`data:image/png;base64, ${croppedAnnotation.image}`}
        />
        <Figure.Caption>
          <Link to={`/fragmentarium/${croppedAnnotation.fragmentNumber}`}>
            {croppedAnnotation.fragmentNumber}&nbsp;
          </Link>
          {label}
        </Figure.Caption>
      </Figure>
    </Col>
  )
}
function SignImagePagination({
  croppedAnnotations,
}: {
  croppedAnnotations: CroppedAnnotation[]
}) {
  const scripts = _.groupBy(
    croppedAnnotations,
    (croppedAnnotation) => croppedAnnotation.script
  )
  const periodsKeys = ['', _.keysIn(Periods)]
  const scriptsSorted_ = _.sortBy(
    Object.entries(scripts),
    (elem) => -periodsKeys.indexOf(elem[0])
  )
  const scriptsSorted = [
    ...scriptsSorted_.slice(1, scriptsSorted_.length),
    scriptsSorted_[0],
  ]

  return (
    <Container>
      <Row>
        <Col>
          <h3>&#8548;. Palaeography</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'mb-5 pb-5'}>
          {scriptsSorted.map((elem, index) => {
            const [scriptAbbr, croppedAnnotation] = elem
            let script = 'Unclassified'
            if (scriptAbbr !== '') {
              const stage = periodFromAbbreviation(scriptAbbr)
              script = `${stage.name} ${stage.description}`
            }

            return (
              <Accordion defaultActiveKey={index == 0 ? '0' : ''} key={index}>
                <Card>
                  <Accordion.Toggle
                    as={Button}
                    variant="link"
                    eventKey={index.toString()}
                  >
                    {script}
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={index.toString()}>
                    <Card.Body>
                      <Row>
                        {_.sortBy(
                          croppedAnnotation,
                          (elem) => elem.fragmentNumber
                        ).map((croppedAnnotation, index) => (
                          <SignImage
                            key={index}
                            croppedAnnotation={croppedAnnotation}
                          />
                        ))}
                      </Row>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            )
          })}
          <div className={'border-top'} />
        </Col>
      </Row>
    </Container>
  )
}
