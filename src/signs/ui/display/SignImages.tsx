import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Row } from 'react-bootstrap'

import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periods } from 'common/utils/period'
import PeriodAccordion from 'signs/ui/display/PeriodAccordion'

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
}): JSX.Element {
  const scripts = _.groupBy(
    croppedAnnotations,
    (croppedAnnotation) => croppedAnnotation.script,
  )
  const periodsAbbr = [...periods.map((period) => period.abbreviation), '']

  const [activePeriod, setActivePeriod] = useState<string | null>(null)

  const scriptsSorted = _.sortBy(Object.entries(scripts), (elem) => {
    const index = periodsAbbr.indexOf(elem[0])
    if (index === -1) {
      throw new Error(`${elem[0]} has to be one of ${periodsAbbr}`)
    } else {
      return index
    }
  })

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
