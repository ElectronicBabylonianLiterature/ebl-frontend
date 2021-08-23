import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import { createAnnotationTokens } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import SignService from 'signs/application/SignService'
import AnnotationTool from 'fragmentarium/ui/image-annotation/annotation-tool/Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import Editor from 'fragmentarium/ui/image-annotation/annotation-tool/Editor'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import produce from 'immer'
import { usePrevious } from 'common/usePrevious'
import { uuid4 } from '@sentry/utils'
import Highlight from 'fragmentarium/ui/image-annotation/annotation-tool/Highlight'

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
  const [toggled, setToggled] = useState<Annotation | undefined>(undefined)
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
      ;(async () => {
        await fragmentService.updateAnnotations(fragment.number, annotations)
      })()
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

  const onChange = (annotation: any): void => {
    if (annotation.selection) {
      setToggled(undefined)
      setHovering(undefined)
    }
    setAnnotation(annotation)
  }

  const handleSelection = (annotation): void => {
    const { geometry, data } = annotation
    const toggledAnnotation = annotations.filter(
      (annotation) => annotation.data.id == data.id
    )[0]
    if (toggledAnnotation) {
      const newAnnotation = new Annotation(toggledAnnotation.geometry, {
        id: toggledAnnotation.data.id,
        ...data,
      })
      setAnnotation({})
      setAnnotations([
        ...annotations.filter(
          (annotation) => annotation.data.id !== newAnnotation.data.id
        ),
        newAnnotation,
      ])
      setHovering(undefined)
    } else if (geometry) {
      const newAnnotation = new Annotation(geometry, {
        ...data,
        id: uuid4(),
      })
      setAnnotation({})
      setAnnotations([...annotations, newAnnotation])
    }
  }

  const onClick = (event) => {
    if (event.shiftKey) {
      setIsDisableSelector(true)
    } else {
      setIsDisableSelector(false)
    }
  }
  return (
    <AnnotationTool
      disableSelector={isDisableSelector}
      disableEditor={isDisableSelector}
      disableOverlay={isDisableSelector}
      src={image}
      alt={fragment.number}
      annotations={annotations}
      type={RectangleSelector.TYPE}
      value={annotation}
      onChange={onChange}
      renderEditor={(props) => (
        <Editor
          {...props}
          annotation={toggled ? toggled : props.annotation}
          handleSelection={handleSelection}
          hoveredAnnotation={hovering}
          annotations={annotations}
          tokens={tokens}
          signService={signService}
        />
      )}
      renderHighlight={(props) => {
        const isChecked = _.isEqual(toggled, props.annotation)
        isChecked && setHovering(props.annotation)
        return <Highlight {...props} isChecked={isChecked} />
      }}
      renderContent={(props) => {
        return (
          <Content
            {...props}
            toggled={toggled}
            setToggled={setToggled}
            setHovering={setHovering}
            onDelete={onDelete}
          />
        )
      }}
      onClick={onClick}
    />
  )
}
