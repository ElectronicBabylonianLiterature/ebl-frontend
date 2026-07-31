import Promise from 'bluebird'
import React, { useMemo, useState } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import AnnotationContext, {
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import {
  AnnotationSpans,
  dedupeAnnotationSpans,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import RealiaInfoContext, {
  useRealiaInfoService,
} from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { emptyRealiaInfoEntries } from 'fragmentarium/ui/text-annotation/realiaInfo'
import { getWordIds } from 'fragmentarium/ui/text-annotation/fragmentSpans'
import AnnotationInstructions from 'fragmentarium/ui/text-annotation/AnnotationInstructions'
import SpanAnnotationDisplay from 'fragmentarium/ui/text-annotation/SpanAnnotationDisplay'
import { UpdateNamedEntityAnnotations } from 'fragmentarium/ui/text-annotation/annotationSave'
import './TextAnnotation.sass'
import './NamedEntities.sass'

function TextAnnotationView({
  fragment,
  annotations,
  updateNamedEntityAnnotations,
}: {
  fragment: Fragment
  annotations: AnnotationSpans
  updateNamedEntityAnnotations: UpdateNamedEntityAnnotations
}): JSX.Element {
  const words: readonly string[] = useMemo(
    () => getWordIds(fragment.text),
    [fragment.text],
  )
  const [initialAnnotations, setInitialAnnotations] = useState<AnnotationSpans>(
    () => dedupeAnnotationSpans(annotations),
  )
  const annotationContext = useAnnotationContext(words, initialAnnotations)
  const realiaInfoService = useRealiaInfoService(
    fragment.realiaInfo ?? emptyRealiaInfoEntries,
  )

  return (
    <RealiaInfoContext.Provider value={realiaInfoService}>
      <AnnotationContext.Provider value={annotationContext}>
        <AnnotationInstructions />
        <SpanAnnotationDisplay
          fragment={fragment}
          initialAnnotations={initialAnnotations}
          setInitialAnnotations={setInitialAnnotations}
          updateNamedEntityAnnotations={updateNamedEntityAnnotations}
        />
      </AnnotationContext.Provider>
    </RealiaInfoContext.Provider>
  )
}

export default withData<
  { updateNamedEntityAnnotations: UpdateNamedEntityAnnotations },
  {
    number: string
    fragmentService: FragmentService
    updateNamedEntityAnnotations: UpdateNamedEntityAnnotations
  },
  { fragment: Fragment; annotations: AnnotationSpans }
>(
  ({ data, updateNamedEntityAnnotations }) => (
    <TextAnnotationView
      fragment={data.fragment}
      annotations={data.annotations}
      updateNamedEntityAnnotations={updateNamedEntityAnnotations}
    />
  ),
  (props) =>
    Promise.all([
      props.fragmentService.find(props.number),
      props.fragmentService.fetchNamedEntityAnnotations(props.number),
    ]).then(([fragment, annotations]) => ({ fragment, annotations })),
  { watch: (props) => [props.number] },
)
