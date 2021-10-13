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
import { Button, ButtonGroup } from 'react-bootstrap'
import useObjectUrl from 'common/useObjectUrl'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'
import HelpTrigger from 'common/HelpTrigger'
import Help from 'fragmentarium/ui/image-annotation/annotation-tool/Help'

interface Props {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  image: Blob
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}
export default withData<
  Omit<Props, 'tokens'>,
  { fragment: Fragment; signService: SignService },
  ReadonlyArray<ReadonlyArray<AnnotationToken>>
>(
  ({ data, ...props }) => <FragmentAnnotation {...props} tokens={data} />,
  ({ fragment, signService }) =>
    signService.associateSigns(createAnnotationTokens(fragment.text))
)

function initializeAnnotations(
  initialAnnotations: readonly Annotation[],
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
): readonly Annotation[] {
  return initialAnnotations.map((annotation) => {
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
}

function FragmentAnnotation({
  tokens,
  fragment,
  image,
  initialAnnotations,
  fragmentService,
}: Props): React.ReactElement {
  const imageUrl = useObjectUrl(image)

  const [isChangeExistingMode, setIsChangeExistingMode] = useState(false)
  const [isDisableSelector, setIsDisableSelector] = useState(false)
  const [isAutomaticSelected, setIsAutomaticSelected] = useState(false)

  const [contentScale, setContentScale] = useState(1)

  const [toggled, setToggled] = useState<Annotation | null>(null)
  const [hovering, setHovering] = useState<Annotation | null>(null)

  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initializeAnnotations(initialAnnotations, tokens)
  )
  const prevAnnotations = usePrevious(annotations)

  const onPressingEsc = useCallback((event) => {
    if (event.keyCode === 27) {
      setToggled(null)
      setIsChangeExistingMode(false)
      setIsAutomaticSelected(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', onPressingEsc, false)
    if (!_.isEqual(prevAnnotations, annotations) && !_.isNil(prevAnnotations)) {
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
  }

  const onChange = (annotation: RawAnnotation): void => {
    if (isChangeExistingMode && annotation.selection && !hovering) {
      setToggled(null)
      setIsChangeExistingMode(false)
    } else if (annotation.selection && hovering && isAutomaticSelected) {
      setAnnotations(automaticAlignment(tokens, hovering, annotations))
    }
    setAnnotation(annotation)
  }

  const getSelectionById = (
    id: string | undefined,
    annotations: readonly Annotation[]
  ): Annotation | null => {
    const toggledAnnotation = annotations.filter(
      (annotation) => annotation.data.id === id
    )[0]
    if (toggledAnnotation) {
      return toggledAnnotation
    } else {
      return null
    }
  }

  const handleSelection = (annotation: RawAnnotation | Annotation): void => {
    const { geometry, data } = annotation
    if (data) {
      const selectedAnnotation = getSelectionById(data.id, annotations)
      if (selectedAnnotation) {
        const newAnnotation = new Annotation(selectedAnnotation.geometry, {
          id: selectedAnnotation.data.id,
          ...data,
        })
        setAnnotation({})
        setAnnotations([
          ...annotations.filter(
            (annotation) => annotation.data.id !== newAnnotation.data.id
          ),
          newAnnotation,
        ])
        setToggled(null)
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
  const generateAnnotations = async () => {
    const generatedAnnotations = await fragmentService.generateAnnotations(
      fragment.number
    )
    setAnnotations([...annotations, ...generatedAnnotations])
  }

  return (
    <>
      <ButtonGroup>
        <Button
          disabled
          variant="outline-dark"
          onClick={async () => await generateAnnotations()}
        >
          Generate
        </Button>
        <Button
          variant="outline-dark"
          active={isAutomaticSelected}
          onClick={() => setIsAutomaticSelected(!isAutomaticSelected)}
        >
          Automatic Selection
        </Button>
        <Button variant="outline-dark" onClick={() => setAnnotations([])}>
          Delete everything
        </Button>
        <Button variant="outline-dark" disabled>
          Mode: {isChangeExistingMode ? 'change existing' : 'default'}
        </Button>
      </ButtonGroup>
      <HelpTrigger overlay={Help()} className={'m-2'} />
      <AnnotationTool
        allowTouch
        onZoom={onZoom}
        disableSelector={isDisableSelector}
        src={imageUrl}
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
            disabled={
              !((annotation && annotation.geometry) || isChangeExistingMode)
            }
            annotation={toggled ? toggled : props.annotation}
            handleSelection={handleSelection}
            hoveringAnnotation={hovering}
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
