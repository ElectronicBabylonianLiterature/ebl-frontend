import React, { useMemo, useState } from 'react'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import { isIdToken, isTextLine } from 'transliteration/domain/type-guards'
import { AnyWord } from 'transliteration/domain/token'
import './TextAnnotation.sass'
import './NamedEntities.sass'
import AnnotationContext, {
  useAnnotationContext,
} from 'fragmentarium/ui/text-annotation/TextAnnotationContext'
import { ApiEntityAnnotationSpan } from 'fragmentarium/ui/text-annotation/EntityType'
import AnnotationInstructions from 'fragmentarium/ui/text-annotation/AnnotationInstructions'
import SpanAnnotationDisplay from 'fragmentarium/ui/text-annotation/SpanAnnotationDisplay'

function TextAnnotationView({
  fragment,
  annotations,
  fragmentService,
}: {
  fragment: Fragment
  annotations: readonly ApiEntityAnnotationSpan[]
  fragmentService: FragmentService
}): JSX.Element {
  const words: readonly string[] = useMemo(() => {
    return fragment.text.lines
      .filter((line) => isTextLine(line))
      .flatMap((line) =>
        line.content
          .filter((token) => isIdToken(token))
          .map((token) => (token as AnyWord).id || ''),
      )
  }, [fragment.text])
  const [initialAnnotations, setInitialAnnotations] =
    useState<readonly ApiEntityAnnotationSpan[]>(annotations)
  const annotationContext = useAnnotationContext(words, initialAnnotations)

  return (
    <AnnotationContext.Provider value={annotationContext}>
      <AnnotationInstructions />
      <SpanAnnotationDisplay
        fragment={fragment}
        initialAnnotations={initialAnnotations}
        setInitialAnnotations={setInitialAnnotations}
        fragmentService={fragmentService}
      />
    </AnnotationContext.Provider>
  )
}

export default withData<
  { fragmentService: FragmentService },
  { number: string; fragmentService: FragmentService },
  { fragment: Fragment; annotations: readonly ApiEntityAnnotationSpan[] }
>(
  ({ data, fragmentService }) => (
    <TextAnnotationView
      fragment={data.fragment}
      annotations={data.annotations}
      fragmentService={fragmentService}
    />
  ),
  (props, signal) =>
    props.fragmentService.find(props.number).then((fragment) =>
      props.fragmentService
        .fetchNamedEntityAnnotations(props.number, signal)
        .then((annotations) => ({
          fragment,
          annotations,
        })),
    ),
)
