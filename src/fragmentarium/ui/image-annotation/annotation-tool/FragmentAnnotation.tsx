import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import {
  AnnotationToken,
  createAnnotationTokens,
} from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import SignService from 'signs/application/SignService'
import AnnotationTool from 'fragmentarium/ui/image-annotation/annotation-tool/Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import Editor from 'fragmentarium/ui/image-annotation/annotation-tool/Editor'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import React, { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import produce from 'immer'
import { usePrevious } from 'common/usePrevious'
import { uuid4 } from '@sentry/utils'
import Highlight from 'fragmentarium/ui/image-annotation/annotation-tool/Highlight'
import withData from 'http/withData'

interface Props {
  tokens: readonly AnnotationToken[][]
  image: URL | string
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}
export default withData<
  Omit<Props, 'tokens'>,
  { fragment: Fragment; signService: SignService },
  readonly AnnotationToken[][]
>(
  ({ data, ...props }) => <FragmentAnnotation {...props} tokens={data} />,
  ({ fragment, signService }) =>
    createAnnotationTokens(fragment.text, signService)
)
function FragmentAnnotation({
  tokens,
  fragment,
  image,
  initialAnnotations,
  fragmentService,
}: Props): React.ReactElement {
  console.log(tokens)
  const [isChangeExistingMode, setIsChangeExistingMode] = useState(false)
  const [contentScale, setContentScale] = useState(1)
  const [toggled, setToggled] = useState<Annotation | undefined>(undefined)
  const [hovering, setHovering] = useState<Annotation | undefined>(undefined)

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

  const onPressingEsc = useCallback((event) => {
    if (event.keyCode === 27) {
      setToggled(undefined)
      setIsChangeExistingMode(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onPressingEsc, false)
    if (
      !_.isEqual(prevAnnotations, annotations) &&
      prevAnnotations !== undefined
    ) {
      ;(async () => {
        await fragmentService.updateAnnotations(fragment.number, annotations)
      })()
    }
    return () => document.removeEventListener('keydown', onPressingEsc, false)
  }, [
    annotations,
    prevAnnotations,
    fragment.number,
    fragmentService,
    onPressingEsc,
  ])

  const onDelete = (annotation: Annotation): void => {
    setAnnotations(
      annotations.filter(
        (other: Annotation) => annotation.data.id !== other.data.id
      )
    )
    setAnnotation({})
  }

  const onChange = (annotation: RawAnnotation): void => {
    if (isChangeExistingMode && annotation.selection && !hovering) {
      setToggled(undefined)
      setIsChangeExistingMode(false)
    }
    setAnnotation(annotation)
  }

  const handleSelection = (annotation: RawAnnotation): void => {
    const { geometry, data } = annotation
    if (data) {
      const toggledAnnotation = annotations.filter(
        (annotation) => annotation.data.id === data.id
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
        setToggled(undefined)
        setIsChangeExistingMode(false)
      } else if (geometry) {
        const newAnnotation = new Annotation(geometry, {
          ...data,
          id: uuid4(),
        })
        setAnnotation({})
        setAnnotations([...annotations, newAnnotation])
      }
    }
  }
  const onZoom = (event) => {
    setContentScale(1 / event.state.scale)
  }

  const onClick = (event: MouseEvent) => {
    if (event.ctrlKey && isChangeExistingMode) {
      setToggled(hovering)
    }
    if (event.ctrlKey) {
      setToggled(hovering)
      setIsChangeExistingMode(true)
    } else {
      if (event.shiftKey) {
        setIsDisableSelector(true)
      } else {
        setIsDisableSelector(false)
      }
    }
  }

  return (
    <>
      <div>Mode: {isChangeExistingMode ? 'change existing' : 'default'}</div>
      <AnnotationTool
        onZoom={onZoom}
        disableSelector={isDisableSelector}
        src={image}
        alt={fragment.number}
        annotations={annotations}
        type={RectangleSelector.TYPE}
        value={annotation}
        onChange={onChange}
        renderEditor={(props: {
          annotation: RawAnnotation
          onChange: (annotation: RawAnnotation) => void
        }) => (
          <Editor
            {...props}
            annotation={toggled ? toggled : props.annotation}
            handleSelection={handleSelection}
            hoveredAnnotation={hovering}
            annotations={annotations}
            tokens={tokens}
          />
        )}
        renderHighlight={(props: {
          annotation: RawAnnotation
          active: boolean
        }) => (
          <Highlight
            {...props}
            isToggled={_.isEqual(toggled, props.annotation)}
          />
        )}
        renderContent={(props) => (
          <Content
            {...props}
            setHovering={setHovering}
            contentScale={contentScale}
            onDelete={onDelete}
          />
        )}
        onClick={onClick}
      />
    </>
  )
}
