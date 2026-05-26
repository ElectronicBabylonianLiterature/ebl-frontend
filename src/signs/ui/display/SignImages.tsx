import SignService from 'signs/application/SignService'
import React from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Figure, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'

import _ from 'lodash'
import Bluebird from 'bluebird'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periods } from 'common/utils/period'
import DateDisplay from 'chronology/ui/DateDisplay'

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
  ({ signName, signService }) => findImagesForSign(signService, signName),
)

function findImagesForSign(
  signService: SignService,
  signName: string,
): Bluebird<CroppedAnnotation[]> {
  const normalizedSignName = signName.replace(/\|/g, '')
  const candidates = _.uniq([
    signName,
    normalizedSignName,
    signName.toUpperCase(),
    signName.toLowerCase(),
    normalizedSignName.toUpperCase(),
    normalizedSignName.toLowerCase(),
  ]).filter(Boolean)

  const lookupImages = (
    candidateIndex: number,
  ): Bluebird<CroppedAnnotation[]> => {
    if (candidateIndex >= candidates.length) {
      return Bluebird.resolve([])
    }

    return signService
      .getImages(candidates[candidateIndex])
      .then((images) =>
        images.length > 0 ? images : lookupImages(candidateIndex + 1),
      )
  }

  return lookupImages(0)
}

function SignImage({
  croppedAnnotation,
}: {
  croppedAnnotation: CroppedAnnotation
}): JSX.Element {
  if (!croppedAnnotation.image) {
    return <></>
  }

  const label = croppedAnnotation.label ? `${croppedAnnotation.label} ` : ''
  return (
    <Col>
      <Figure>
        <Figure.Image
          className={'sign-images__sign-image'}
          src={`data:image/png;base64, ${croppedAnnotation.image}`}
        />
        <Figure.Caption>
          <Link to={`/library/${croppedAnnotation.fragmentNumber}`}>
            {croppedAnnotation.fragmentNumber}&nbsp;
          </Link>
          {label}
          {croppedAnnotation.date && (
            <DateDisplay date={croppedAnnotation.date} />
          )}
          {croppedAnnotation.provenance && (
            <span className="provenance">{`${croppedAnnotation.provenance}`}</span>
          )}
        </Figure.Caption>
      </Figure>
    </Col>
  )
}

function getScriptLabel(scriptAbbr: string): string {
  if (scriptAbbr === '') {
    return 'Unclassified'
  }

  const stage = periods.find((period) => period.abbreviation === scriptAbbr)

  return stage ? `${stage.name} ${stage.description}`.trim() : scriptAbbr
}

function getScriptSortOrder(scriptAbbr: string): number {
  const scriptIndex = periods.findIndex(
    (period) => period.abbreviation === scriptAbbr,
  )

  return scriptIndex === -1 ? periods.length : scriptIndex
}

function SignImagePagination({
  croppedAnnotations,
}: {
  croppedAnnotations: CroppedAnnotation[]
}) {
  const scripts = _.groupBy(
    croppedAnnotations,
    (croppedAnnotation) => croppedAnnotation.script,
  )

  const scriptsSorted = _.sortBy(Object.entries(scripts), ([scriptAbbr]) =>
    getScriptSortOrder(scriptAbbr),
  )

  return (
    <Container>
      <Row className={'mt-5'}>
        <Col>
          <h3>&#8546;. Palaeography</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'mb-5'}>
          {scriptsSorted.map((elem, index) => {
            const [scriptAbbr, croppedAnnotation] = elem
            const script = getScriptLabel(scriptAbbr)

            return (
              <Accordion
                defaultActiveKey={index === 0 ? '0' : undefined}
                key={index}
              >
                <Accordion.Item eventKey={index.toString()}>
                  <Accordion.Header>{script}</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {_.sortBy(
                        croppedAnnotation,
                        (elem) => elem.fragmentNumber,
                      ).map((croppedAnnotation, index) => (
                        <SignImage
                          key={index}
                          croppedAnnotation={croppedAnnotation}
                        />
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )
          })}
          <div className={'border-top'} />
        </Col>
      </Row>
    </Container>
  )
}
