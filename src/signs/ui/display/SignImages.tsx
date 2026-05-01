import SignService from 'signs/application/SignService'
import React, { useState } from 'react'
import withData, { WithoutData } from 'http/withData'
import { Col, Container, Figure, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'

import _ from 'lodash'
import { Link } from 'react-router-dom'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import './SignImages.css'
import { periodFromAbbreviation, periods } from 'common/utils/period'
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
  const label = croppedAnnotation.label ? `${croppedAnnotation.label} ` : ''

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

function sortVariants(annotations: CroppedAnnotation[]): CroppedAnnotation[] {
  return _.sortBy(annotations, [
    (annotation) => (annotation.date ? 0 : 1),
    (annotation) => annotation.fragmentNumber,
  ])
}

function sortGroupsByClusterRank(
  annotations: CroppedAnnotation[],
): [string, CroppedAnnotation[]][] {
  return _.sortBy(
    Object.entries(
      _.groupBy(
        annotations,
        (annotation) => annotation.pcaClustering?.clusterId || 'no-cluster',
      ),
    ),
    ([, group]) => group[0].pcaClustering?.clusterRank ?? 999,
  )
}

function formatFormLabel(form: string): string {
  if (form.startsWith('canonical')) {
    const number = form.replace('canonical', '')
    return number ? `Canonical ${number}` : 'Canonical'
  }
  if (form.startsWith('variant')) {
    const number = form.replace('variant', '')
    return number ? `Variant ${number}` : 'Variant'
  }
  return form
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
  const periodsAbbr = [...periods.map((period) => period.abbreviation), '']

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
          {scriptsSorted.map((elem, index) => {
            const [scriptAbbr, croppedAnnotationsForScript] = elem

            return (
              <PeriodAccordion
                key={index}
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
  scriptAbbr,
  croppedAnnotations,
  signService,
  signName,
}: {
  scriptAbbr: string
  croppedAnnotations: CroppedAnnotation[]
  signService: SignService
  signName: string
}) {
  const [loadedAnnotations, setLoadedAnnotations] = useState<
    CroppedAnnotation[] | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)

  let script = 'Unclassified'
  if (scriptAbbr !== '') {
    const stage = periodFromAbbreviation(scriptAbbr)
    script = `${stage.name} ${stage.description}`
  }

  async function handleEnter() {
    if (loadedAnnotations || isLoading) {
      return
    }

    const clusterIds = _.uniq(
      croppedAnnotations
        .map((annotation) => annotation.pcaClustering?.clusterId)
        .filter((clusterId): clusterId is string => Boolean(clusterId)),
    )

    if (!clusterIds.length) {
      setLoadedAnnotations(croppedAnnotations)
      return
    }

    setIsLoading(true)

    const results = await globalThis.Promise.allSettled(
      clusterIds.map((clusterId) =>
        signService.getClusterVariants(signName, clusterId, scriptAbbr),
      ),
    )

    const successfulAnnotations = results
      .filter(
        (result): result is PromiseFulfilledResult<CroppedAnnotation[]> =>
          result.status === 'fulfilled',
      )
      .flatMap((result) => result.value)

    setLoadedAnnotations(
      successfulAnnotations.length ? successfulAnnotations : croppedAnnotations,
    )
    setIsLoading(false)
  }

  const annotationsToRender = loadedAnnotations ?? croppedAnnotations
  const sortedGroups = sortGroupsByClusterRank(annotationsToRender)

  return (
    <Accordion defaultActiveKey={undefined}>
      <Accordion.Item eventKey="0">
        <Accordion.Header onClick={handleEnter}>
          <span className="sign-images__period-title">{script}</span>
          <PeriodPreview annotations={croppedAnnotations} />
        </Accordion.Header>

        <Accordion.Body>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
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
                    form={group[0].pcaClustering?.form || 'Unknown form'}
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
