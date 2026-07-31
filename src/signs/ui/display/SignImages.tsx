import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Figure, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'

import _ from 'lodash'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periodFromAbbreviation } from 'common/utils/period'
import DateDisplay from 'chronology/ui/DateDisplay'
import {
  formatFormLabel,
  runWithConcurrencyLimit,
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

function SignImage({
  croppedAnnotation,
  isCentroid = false,
}: {
  croppedAnnotation: CroppedAnnotation
  isCentroid?: boolean
}): JSX.Element {
  const label = croppedAnnotation.label ?? ''

  return (
    <div className={isCentroid ? 'sign-images__centroid-col' : undefined}>
      <Figure className={isCentroid ? 'sign-images__centroid' : undefined}>
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
    </div>
  )
}

function VariantGroup({
  form,
  centroid,
  variants,
}: {
  form: string
  centroid?: CroppedAnnotation
  variants: CroppedAnnotation[]
}) {
  return (
    <div className="sign-images__variant-group">
      <div className="sign-images__variant-header">
        {formatFormLabel(form)}:
      </div>

      <div className="sign-images__variant-layout">
        <div className="sign-images__variant-representative">
          {centroid && <SignImage croppedAnnotation={centroid} isCentroid />}
        </div>

        <div className="sign-images__variant-examples">
          {variants.length === 0 ? (
            <div className="text-muted">No additional variants</div>
          ) : (
            variants.map((annotation, index) => (
              <div key={index} className="sign-images__variant-example-item">
                <SignImage croppedAnnotation={annotation} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function PeriodPreview({
  annotations,
}: {
  annotations: CroppedAnnotation[]
}): JSX.Element {
  const previewGroups = sortGroupsByClusterRank(annotations)

  return (
    <div className="sign-images__period-preview">
      {previewGroups.map(([clusterId, group]) => {
        const centroid =
          group.find((annotation) => annotation.pcaClustering?.isCentroid) ??
          group[0]

        return (
          <div key={clusterId} className="sign-images__period-preview-item">
            <Figure.Image
              className="sign-images__period-preview-image"
              src={`data:image/png;base64, ${centroid.image}`}
              title={formatFormLabel(
                centroid.pcaClustering?.form || 'Unknown form',
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

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

async function loadClusterAnnotations({
  croppedAnnotations,
  signService,
  signName,
  scriptAbbr,
}: {
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
  scriptAbbr: string
}): Promise<{
  annotations: CroppedAnnotation[]
  hasFailures: boolean
}> {
  const clusterIds = _.uniq(
    croppedAnnotations
      .map((annotation) => annotation.pcaClustering?.clusterId)
      .filter((clusterId): clusterId is string => Boolean(clusterId)),
  )

  if (!clusterIds.length) {
    return {
      annotations: croppedAnnotations,
      hasFailures: false,
    }
  }

  const results = await runWithConcurrencyLimit<string, CroppedAnnotation[]>(
    clusterIds,
    4,
    (clusterId) =>
      signService.getClusterVariants(signName, clusterId, scriptAbbr),
  )

  const fallbackClusterIds = results
    .map((result, index) =>
      result.status === 'rejected' ||
      (result.status === 'fulfilled' && result.value.length === 0)
        ? clusterIds[index]
        : null,
    )
    .filter((clusterId): clusterId is string => Boolean(clusterId))

  const successfulAnnotations = results
    .filter(
      (result): result is PromiseFulfilledResult<CroppedAnnotation[]> =>
        result.status === 'fulfilled' && result.value.length > 0,
    )
    .flatMap((result) => result.value)

  const fallbackAnnotations = croppedAnnotations.filter((annotation) =>
    fallbackClusterIds.includes(annotation.pcaClustering?.clusterId || ''),
  )

  const nonPcaAnnotations = croppedAnnotations.filter(
    (annotation) => !annotation.pcaClustering?.clusterId,
  )

  return {
    // Every cluster id comes from these annotations, so a cluster that fails or
    // comes back empty always has its own annotations in fallbackAnnotations:
    // the three lists together can never be empty here.
    annotations: [
      ...successfulAnnotations,
      ...fallbackAnnotations,
      ...nonPcaAnnotations,
    ],
    hasFailures: fallbackClusterIds.length > 0,
  }
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
