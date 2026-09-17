import React, { useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import SignService from 'signs/application/SignService'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import { periodFromAbbreviation } from 'common/utils/period'
import PeriodPreview from 'signs/ui/display/PeriodPreview'
import VariantGroup from 'signs/ui/display/VariantGroup'
import loadClusterAnnotations from 'signs/ui/display/loadClusterAnnotations'
import {
  sortGroupsByClusterRank,
  sortVariants,
} from 'signs/ui/display/signImageGrouping'

export default function PeriodAccordion({
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
}): JSX.Element {
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
