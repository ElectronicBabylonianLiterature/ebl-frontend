import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Row } from 'react-bootstrap'

import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import 'signs/ui/display/SignImages.css'
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
    ) : (
      <p className="SignPage__note">No sign images available yet.</p>
    ),
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
    <div className="sign-images">
      <Row>
        <Col>
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
    </div>
  )
}
