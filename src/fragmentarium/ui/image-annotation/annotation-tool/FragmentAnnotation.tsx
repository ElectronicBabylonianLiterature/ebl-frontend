import Content, {
  ContentProps,
} from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import {
  AnnotationToken,
  createAnnotationTokens,
} from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import SignService from 'signs/application/SignService'
import AnnotationComponent from 'fragmentarium/ui/image-annotation/annotation-tool/Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import Editor, {
  EditorProps,
} from 'fragmentarium/ui/image-annotation/annotation-tool/Editor'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import produce from 'immer'
import { usePrevious } from 'common/usePrevious'
import { uuid4 } from '@sentry/utils'

const contentWithOnDelete = (onDelete, setHovering) =>
  function ContentWithOnDelete({
    annotation,
  }: Omit<ContentProps, 'onDelete' | 'setHovering'>): JSX.Element {
    return (
      <Content
        setHovering={setHovering}
        annotation={annotation}
        onDelete={onDelete}
      />
    )
  }

const editorWithTokens = (
  hoveredAnnotation: any,
  annotations: any,
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
  handleSelection: any,
  signService: SignService
) =>
  function EditorWithTokens(
    props: Omit<
      EditorProps,
      | 'tokens'
      | 'handleSelection'
      | 'signService'
      | 'annotations'
      | 'hoveredAnnotation'
    >
  ): JSX.Element {
    return (
      <Editor
        hoveredAnnotation={hoveredAnnotation}
        annotations={annotations}
        handleSelection={handleSelection}
        signService={signService}
        tokens={tokens}
        {...props}
      />
    )
  }

interface Props {
  image: URL | string
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}

export default function FragmentAnnotation({
  fragment,
  image,
  initialAnnotations,
  fragmentService,
  signService,
}: Props): React.ReactElement {
  const [hovering, setHovering] = useState(undefined)
  const tokens = createAnnotationTokens(fragment)
  const [isDisableSelector, setIsDisableSelector] = useState(false)
  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initialAnnotations.map((annotation) => {
      const token = tokens
        .flat()
        .find(
          (token) =>
            _.isEqual(token.path, annotation.data.path) &&
            token.value === annotation.data.value
        )
      return token
        ? annotation
        : produce(annotation, (draft): void => {
            draft.outdated = true
          })
    })
  )
  const prevAnnotations = usePrevious(annotations)

  useEffect(() => {
    if (
      !_.isEqual(prevAnnotations, annotations) &&
      prevAnnotations !== undefined
    ) {
      onSave()
    }
  }, [annotations, prevAnnotations])

  const onDelete = (annotation: Annotation): void => {
    setAnnotations(
      annotations.filter(
        (other: Annotation) => annotation.data.id !== other.data.id
      )
    )
    setAnnotation({})
  }

  const onChange = (annotation: Annotation): void => {
    setAnnotation(annotation)
  }

  const handleSelection = (annotation): void => {
    const { geometry, data } = annotation
    const newAnnotation = new Annotation(geometry, {
      ...data,
      id: uuid4(),
    })
    setAnnotation({})
    setAnnotations([...annotations, newAnnotation])
  }

  const onSave = (): void => {
    fragmentService.updateAnnotations(fragment.number, annotations)
  }

  const onClick = (event) => {
    if (event.shiftKey) {
      setIsDisableSelector(true)
    } else {
      setIsDisableSelector(false)
    }
  }

  return (
    <AnnotationComponent
      disableSelector={isDisableSelector}
      disableEditor={isDisableSelector}
      disableOverlay={isDisableSelector}
      src={image}
      alt={fragment.number}
      annotations={annotations}
      type={RectangleSelector.TYPE}
      value={annotation}
      onChange={onChange}
      renderEditor={editorWithTokens(
        hovering,
        annotations,
        tokens,
        handleSelection,
        signService
      )}
      renderContent={contentWithOnDelete(onDelete, setHovering)}
      onClick={onClick}
    />
  )
}
