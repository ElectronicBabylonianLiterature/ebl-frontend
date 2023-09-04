import Content from 'fragmentarium/ui/image-annotation/annotation-tool/Content'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import SignService from 'signs/application/SignService'
import AnnotationTool from 'fragmentarium/ui/image-annotation/annotation-tool/Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import Editor from 'fragmentarium/ui/image-annotation/annotation-tool/Editor'
import { Fragment } from 'fragmentarium/domain/fragment'
import Annotation, {
  isBoundingBoxTooSmall,
  RawAnnotation,
} from 'fragmentarium/domain/annotation'
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
import { createAnnotationTokens } from 'fragmentarium/ui/image-annotation/annotation-tool/mapTokensToAnnotationTokens'

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
  const [error, setError] = useState<Error | null>(null)
  const [isChangeExistingMode, setIsChangeExistingMode] = useState(false)
  const [isDisableAnnotating, setIsDisableAnnotating] = useState(false)
  const [isAutomaticSelected, setIsAutomaticSelected] = useState(false)
  const [displayCards, setDisplayCards] = useState(false)

  const [contentScale, setContentScale] = useState(0.3)

  const [toggled, setToggled] = useState<Annotation | null>(null)
  const [hovering, setHovering] = useState<Annotation | null>(null)

  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initializeAnnotations(initialAnnotations, tokens)
  )
  const [savedAnnotations, setSavedAnnotations] = useState(annotations)

  const buttonY = 89
  const buttonEscape = 27
  const buttonShift = 16

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
        case buttonShift:
          setIsDisableAnnotating(true)
          break
        default:
          break
      }
    },
    [setIsChangeExistingModeButtonPressed, setIsDisableAnnotating]
  )

  const onReleaseButton = useCallback(
    (event) => {
      if (event.keyCode === buttonY) {
        setIsChangeExistingModeButtonPressed(false)
      } else if (event.keyCode === buttonShift) {
        setIsDisableAnnotating(false)
      }
    },
    [setIsChangeExistingModeButtonPressed]
  )

  useEffect(() => {
    const alertUser = (event) => {
      if (!_.isEqual(savedAnnotations, annotations)) {
        event.preventDefault()
        return (event.returnValue = false)
      } else {
        return null
      }
    }

    window.addEventListener('beforeunload', alertUser, {
      capture: true,
      once: true,
    })
    document.addEventListener('keydown', onPressingDown, false)
    document.addEventListener('keyup', onReleaseButton, false)
    return () => {
      document.removeEventListener('keydown', onPressingDown, false)
      window.removeEventListener('beforeunload', alertUser)
      document.addEventListener('keyup', onReleaseButton, false)
    }
  }, [
    annotations,
    fragment.number,
    savedAnnotations,
    fragmentService,
    onPressingDown,
    onReleaseButton,
  ])

  const saveAnnotations = async (annotations: readonly Annotation[]) => {
    setAnnotations(annotations)
    return fragmentService
      .updateAnnotations(fragment.number, annotations)
      .then(() => setSavedAnnotations(annotations))
      .catch(setError)
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
        if (isBoundingBoxTooSmall(geometry)) {
          const newAnnotation = new Annotation(geometry, {
            ...data,
            id: uuid4(),
          })
          setAnnotation({})
          setAnnotations([...annotations, newAnnotation])
        }
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
      {error && <ErrorAlert error={error} />}
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
              .catch(setError)
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
          {isDeleting ? <Spinner loading={true} /> : 'Delete all'}
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
        <Button
          active={displayCards}
          variant="outline-dark"
          onClick={() => {
            setDisplayCards(!displayCards)
          }}
        >
          Show Card
        </Button>
      </ButtonGroup>

      <ButtonGroup className={'ml-3 '} vertical size={'sm'}>
        <Button variant="outline-dark" disabled>
          Mode: {isChangeExistingMode ? 'change existing' : 'default'}
        </Button>
      </ButtonGroup>
      <HelpTrigger overlay={Help()} className={'m-2'} />
      <span className="text-danger">&#8592; Please read this!</span>
      <AnnotationTool
        allowTouch
        onZoom={onZoom}
        disableAnnotation={isDisableAnnotating}
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
        renderContent={(props) => (
          <Content
            {...props}
            displayCards={displayCards}
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
