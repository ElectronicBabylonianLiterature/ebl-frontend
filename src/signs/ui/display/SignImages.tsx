import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Row } from 'react-bootstrap'

import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import PeriodAccordion from 'signs/ui/display/PeriodAccordion'
import { sortScriptsByPeriod } from 'signs/ui/display/signImageGrouping'

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
  ({ data, signService, signName }) =>
    data.length ? (
      <SignImagePagination
        croppedAnnotations={data}
        signService={signService}
        signName={signName}
      />
    ) : null,
  (props, signal) =>
    props.signService.getCentroidImages(props.signName, signal),
)

function SignImagePagination({
  croppedAnnotations,
  signService,
  signName,
}: {
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
}) {
  const scripts = _.groupBy(
    croppedAnnotations,
    (croppedAnnotation) => croppedAnnotation.script,
  )

  const [activePeriod, setActivePeriod] = useState<string | null>(null)

  const scriptsSorted = sortScriptsByPeriod(scripts)

  return (
    <Container>
      <Row className={'mt-5'}>
        <Col>
          <h3>&#8546;. Palaeography</h3>
        </Col>
      </Row>
      <Row>
        <Col className={'mb-5'}>
          {scriptsSorted.map((elem) => {
            const [scriptAbbr, croppedAnnotationsForScript] = elem

            return (
              <PeriodAccordion
                key={scriptAbbr || 'unclassified'}
                eventKey={scriptAbbr || 'unclassified'}
                activePeriod={activePeriod}
                setActivePeriod={setActivePeriod}
                scriptAbbr={scriptAbbr}
                croppedAnnotations={croppedAnnotationsForScript}
                signService={signService}
                signName={signName}
              />
            )
          })}
          <div className={'border-top'} />
        </Col>
      </Row>
    </Container>
  )
}
