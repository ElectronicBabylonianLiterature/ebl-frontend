import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'

import _ from 'lodash'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periodFromAbbreviation } from 'common/utils/period'
import { loadClusterAnnotations } from 'signs/ui/display/signClusterAnnotations'
import { PeriodPreview, VariantGroup } from 'signs/ui/display/SignImageFigures'
import {
  sortGroupsByClusterRank,
  sortScriptsByPeriod,
  sortVariants,
} from 'signs/ui/display/signImageGrouping'

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
  (props) => props.signService.getCentroidImages(props.signName),
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

function PeriodAccordion({
  eventKey,
  activePeriod,
  setActivePeriod,
  scriptAbbr,
  croppedAnnotations,
  signService,
  signName,
}: {
  eventKey: string
  activePeriod: string | null
  setActivePeriod: React.Dispatch<React.SetStateAction<string | null>>
  scriptAbbr: string
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
}) {
  const [loadedAnnotations, setLoadedAnnotations] = useState<
    CroppedAnnotation[] | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadFailures, setHasLoadFailures] = useState(false)

  let script = 'Unclassified'
  if (scriptAbbr !== '') {
    const stage = periodFromAbbreviation(scriptAbbr)
    script = `${stage.name} ${stage.description}`
  }

  async function handleEnter() {
    if ((loadedAnnotations && !hasLoadFailures) || isLoading) {
      return
    }

    setIsLoading(true)
    setHasLoadFailures(false)

    const { annotations, hasFailures } = await loadClusterAnnotations({
      croppedAnnotations,
      signService,
      signName,
      scriptAbbr,
    })

    setLoadedAnnotations(annotations)
    setHasLoadFailures(hasFailures)
    setIsLoading(false)
  }

  const annotationsToRender = loadedAnnotations ?? croppedAnnotations
  const sortedGroups = sortGroupsByClusterRank(annotationsToRender)

  return (
    <Accordion activeKey={activePeriod}>
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header
          onClick={() => {
            setActivePeriod((current) =>
              current === eventKey ? null : eventKey,
            )
            handleEnter()
          }}
        >
          <span className="sign-images__period-title">{script}</span>
          <PeriodPreview annotations={croppedAnnotations} />
        </Accordion.Header>

        <Accordion.Body>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              {hasLoadFailures && (
                <div className="text-warning mb-3">
                  Some variants could not be loaded. Showing available centroid
                  data for the affected clusters.
                </div>
              )}

              {sortedGroups.map(([clusterId, group]) => {
                const centroid = group.find(
                  (annotation) => annotation.pcaClustering?.isCentroid,
                )
                const variants = sortVariants(
                  group.filter(
                    (annotation) => !annotation.pcaClustering?.isCentroid,
                  ),
                )

                return (
                  <VariantGroup
                    key={clusterId}
                    form={
                      clusterId === 'no-cluster'
                        ? 'Ungrouped instances'
                        : group[0].pcaClustering?.form || 'Unknown form'
                    }
                    centroid={centroid}
                    variants={variants}
                  />
                )
              })}
            </>
          )}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}
