import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import {
  AnnotationToken,
  createAnnotationTokens,
} from 'fragmentarium/domain/annotation-token'
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
import { uuid4 } from '@sentry/utils'
import Highlight from 'fragmentarium/ui/image-annotation/annotation-tool/Highlight'
import withData from 'http/withData'
import { Button, ButtonGroup } from 'react-bootstrap'
import useObjectUrl from 'common/useObjectUrl'
import automaticAlignment from 'fragmentarium/ui/image-annotation/annotation-tool/automatic-alignment'
import HelpTrigger from 'common/HelpTrigger'
import Help from 'fragmentarium/ui/image-annotation/annotation-tool/Help'
import Spinner from 'common/Spinner'
import Bluebird from 'bluebird'
import ErrorAlert from 'common/ErrorAlert'
import { Prompt } from 'react-router-dom'

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

  const [
    isChangeExistingModeButtonPressed,
    setIsChangeExistingModeButtonPressed,
  ] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [
    isGenerateAnnotationsLoading,
    setIsGenerateAnnotationsLoading,
  ] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isChangeExistingMode, setIsChangeExistingMode] = useState(false)
  const [isDisableSelector, setIsDisableSelector] = useState(false)
  const [isDisableContent, setIsDisableContent] = useState(false)
  const [isAutomaticSelected, setIsAutomaticSelected] = useState(false)

  const [contentScale, setContentScale] = useState(1)

  const [toggled, setToggled] = useState<Annotation | null>(null)
  const [hovering, setHovering] = useState<Annotation | null>(null)

  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initializeAnnotations(initialAnnotations, tokens)
  )
  const [savedAnnotations, setSavedAnnotations] = useState(annotations)

  const buttonY = 89
  const buttonEscape = 27

  const reset = () => {
    setToggled(null)
    setIsChangeExistingMode(false)
    setIsAutomaticSelected(false)
    setAnnotation({})
  }

  const onPressingDown = useCallback(
    (event) => {
      switch (event.keyCode) {
        case buttonEscape:
          reset()
          break
        case buttonY:
          setIsChangeExistingModeButtonPressed(true)
          break
        default:
          break
      }
    },
    [setIsChangeExistingModeButtonPressed]
  )

  const onReleaseButton = useCallback(
    (event) => {
      if (event.keyCode === buttonY) {
        setIsChangeExistingModeButtonPressed(false)
      }
    },
    [setIsChangeExistingModeButtonPressed]
  )

  const alertUser = (event) => {
    if (!_.isEqual(savedAnnotations, annotations)) {
      event.preventDefault()
      return (event.returnValue = false)
    } else {
      return null
    }
  }
  const disableContent = (event) =>
    event.code === 'KeyD' && setIsDisableContent(!isDisableContent)

  useEffect(() => {
    window.addEventListener('beforeunload', alertUser, {
      capture: true,
      once: true,
    })
    document.addEventListener('keypress', disableContent, false)
    document.addEventListener('keydown', onPressingDown, false)
    document.addEventListener('keyup', onReleaseButton, false)
    return () => {
      document.removeEventListener('keypress', disableContent, false)
      document.removeEventListener('keydown', onPressingDown, false)
      window.removeEventListener('beforeunload', alertUser)
      document.addEventListener('keyup', onReleaseButton, false)
    }
  }, [
    alertUser,
    annotations,
    fragment.number,
    fragmentService,
    onPressingDown,
    onReleaseButton,
    disableContent,
  ])

  const saveAnnotations = async (annotations: readonly Annotation[]) => {
    setAnnotations(annotations)
    return fragmentService
      .updateAnnotations(fragment.number, annotations)
      .then(() => setSavedAnnotations(annotations))
      .catch(() => setIsError(true))
  }

  const onDelete = async (annotation: Annotation): Bluebird<void> => {
    const updatedAnnotations = annotations.filter(
      (other: Annotation) => annotation.data.id !== other.data.id
    )
    return saveAnnotations(updatedAnnotations)
  }

  const onChange = (annotation: RawAnnotation): void => {
    if (isChangeExistingMode && annotation.selection && !hovering) {
      setToggled(null)
      setIsChangeExistingMode(false)
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
        const newAnnotations = [
          ...annotations.filter(
            (annotation) => annotation.data.id !== newAnnotation.data.id
          ),
          newAnnotation,
        ]
        setAnnotations(newAnnotations)
        if (isAutomaticSelected && isChangeExistingMode) {
          setAnnotations(
            automaticAlignment(tokens, newAnnotation, newAnnotations)
          )
        }
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
    if (isChangeExistingModeButtonPressed && isChangeExistingMode) {
      setToggled(hovering)
    }
    if (isChangeExistingModeButtonPressed) {
      setToggled(hovering)
      setIsChangeExistingMode(true)
    } else {
      if (event.shiftKey) {
        setIsDisableSelector(true)
      } else {
        setIsDisableSelector(false)
      }
    }
    if (isAutomaticSelected && annotation.selection && annotation.geometry) {
      const token = AnnotationToken.blank()
      const automaticAnnotation = {
        ...annotation,
        data: {
          ...annotation.data,
          value: token.value,
          type: token.type,
          path: token.path,
          signName: '',
        },
      }
      handleSelection(automaticAnnotation)
    }
  }

  return (
    <>
      <Prompt
        when={!_.isEqual(savedAnnotations, annotations)}
        message={'Changes you made may not be saved.'}
      />
      {isError && (
        <ErrorAlert
          error={
            new Error(
              'There was an issue with the server. Your changes could not be saved.'
            )
          }
        />
      )}
      <ButtonGroup>
        <Button
          variant="outline-dark"
          onClick={() => {
            setIsGenerateAnnotationsLoading(true)
            fragmentService
              .generateAnnotations(fragment.number)
              .then((generatedAnnotations) =>
                setAnnotations([...annotations, ...generatedAnnotations])
              )
              .catch(() => setIsError(true))
              .finally(() => setIsGenerateAnnotationsLoading(false))
          }}
        >
          {isGenerateAnnotationsLoading ? (
            <Spinner loading={true} />
          ) : (
            'Generate Annotations'
          )}
        </Button>
        <Button
          variant="outline-dark"
          active={isAutomaticSelected}
          onClick={() => setIsAutomaticSelected(!isAutomaticSelected)}
        >
          Automatic Selection
        </Button>
        <Button
          variant="outline-dark"
          onClick={() => {
            const confirmation = window.confirm(
              'Sure you want to delete everything ?'
            )
            if (confirmation) {
              setIsDeleting(true)
              saveAnnotations([])
                .then(() => reset())
                .finally(() => setIsDeleting(false))
            }
          }}
        >
          {isDeleting ? <Spinner loading={true} /> : 'Delete everything'}
        </Button>
        <Button
          variant="outline-dark"
          onClick={() => {
            setIsSaving(true)
            saveAnnotations(annotations).finally(() => setIsSaving(false))
          }}
        >
          {isSaving ? <Spinner loading={true} /> : 'Save'}
        </Button>
      </ButtonGroup>

      <ButtonGroup className={'ml-3 '} vertical size={'sm'}>
        <Button variant="outline-dark" disabled>
          Mode: {isChangeExistingMode ? 'change existing' : 'default'}
        </Button>
        <Button variant="outline-dark" disabled>
          Show Content: {isDisableContent ? 'yes' : 'no'}
        </Button>
      </ButtonGroup>
      <HelpTrigger overlay={Help()} className={'m-2'} />
      <AnnotationTool
        disableOverlay={true}
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
            scale={contentScale}
            isToggled={_.isEqual(toggled, props.annotation)}
          />
        )}
        renderContent={(props) =>
          !isDisableContent && (
            <Content
              {...props}
              setHovering={setHovering}
              contentScale={contentScale}
              onDelete={onDelete}
            />
          )
        }
        onClick={onClick}
      />
    </>
  )
}
