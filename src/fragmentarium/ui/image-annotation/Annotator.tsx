import React, { ReactElement, useState } from 'react'
import AnnotationComponent from 'react-image-annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { uuid4 } from '@sentry/utils'
import _ from 'lodash'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AnnotationToken, createAnnotationTokens } from './annotation-token'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import produce from 'immer'
import Editor, { EditorProps } from './Editor'
import Content, { ContentProps } from './Content'
import useObjectUrl from 'common/useObjectUrl'
import Bluebird from 'bluebird'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

const contentWithOnDelete = (onDelete: (annotation: Annotation) => void) =>
  function ContentWithOnDelete({
    annotation,
  }: Omit<ContentProps, 'onDelete'>): JSX.Element {
    return <Content annotation={annotation} onDelete={onDelete} />
  }

const editorWithTokens = (
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
  zoom: number
) =>
  function EditorWithTokens(
    props: Omit<EditorProps, 'tokens' | 'zoom'>
  ): JSX.Element {
    return <Editor zoom={zoom} tokens={tokens} {...props} />
  }

interface Props {
  image: URL | string
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
}
function FragmentAnnotation({
  fragment,
  image,
  initialAnnotations,
  fragmentService,
}: Props): React.ReactElement {
  const [zoom, setZoom] = useState(1)
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

  const onSubmit = (annotation: Annotation): void => {
    const { geometry, data } = annotation
    console.log(geometry)
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
  const onZoom = (onZoomEvent) => {
    console.log(onZoomEvent.state.scale)
    setZoom(1 / onZoomEvent.state.scale)
  }

  return (
    <>
      <Row>
        <Col>
          <TransformWrapper
            onZoom={(onZoomEvent) => onZoom(onZoomEvent)}
            panning={{ activationKeys: ['Shift'] }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <React.Fragment>
                <Row className={'my-3'}>
                  <Col xs={'auto'}>
                    <ButtonGroup>
                      <Button variant="outline-dark" onClick={() => zoomIn()}>
                        ZOOM IN +
                      </Button>
                      <Button variant="outline-dark" onClick={() => zoomOut()}>
                        ZOOM OUT -
                      </Button>
                      <Button
                        variant="outline-dark"
                        onClick={() => resetTransform()}
                      >
                        RESET
                      </Button>
                    </ButtonGroup>
                  </Col>
                  <Col xs={'auto'}>
                    <SessionContext.Consumer>
                      {(session: Session): ReactElement => (
                        <Button
                          variant="success"
                          onClick={onSave}
                          disabled={!session.isAllowedToAnnotateFragments()}
                        >
                          Save
                        </Button>
                      )}
                    </SessionContext.Consumer>
                  </Col>
                  <Col className={'text-center my-auto'}>
                    Zoom with Mouse wheel. Pan while holding shift
                  </Col>
                </Row>
                <TransformComponent>
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
                    onSubmit={onSubmit}
                    renderEditor={editorWithTokens(tokens, zoom)}
                    renderContent={contentWithOnDelete(onDelete)}
                    onClick={onClick}
                  />
                </TransformComponent>
              </React.Fragment>
            )}
          </TransformWrapper>
        </Col>
      </Row>
    </>
  )
}
function isBlob(image: Blob | Record<string, never>): image is Blob {
  return (image as Blob).size !== undefined
}

function AnnotatorDisplay({
  image,
  fragment,
  annotations,
  fragmentService,
}: {
  image: Blob
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
}): JSX.Element {
  const objectUrl = useObjectUrl(image as Blob)
  return (
    <>
      {objectUrl && (
        <FragmentAnnotation
          image={objectUrl}
          fragment={fragment}
          initialAnnotations={annotations}
          fragmentService={fragmentService}
        />
      )}
    </>
  )
}

function Annotator({
  image,
  fragment,
  annotations,
  fragmentService,
}: {
  image: Blob | Record<string, never>
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
}): JSX.Element {
  if (isBlob(image)) {
    return (
      <AnnotatorDisplay
        image={image}
        fragment={fragment}
        annotations={annotations}
        fragmentService={fragmentService}
      />
    )
  } else {
    return (
      <Row>
        <Col className={'text-center mt-5'}>
          <h3>{`Fragment ${fragment.number} doesn't have a Photo`}</h3>
        </Col>
      </Row>
    )
  }
}

const WithAnnotations = withData<
  {
    fragment: Fragment
    image: Blob | Record<string, never>
    fragmentService: FragmentService
  },
  unknown,
  readonly Annotation[]
>(
  ({ data, ...props }) => <Annotator {...props} annotations={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.findAnnotations(fragment.number)
)

const WithPhoto = withData<
  { fragment: Fragment; fragmentService: FragmentService },
  unknown,
  Blob | Record<string, never>
>(
  ({ data, ...props }) => <WithAnnotations {...props} image={data} />,
  ({ fragment, fragmentService }) => {
    try {
      return fragmentService.findPhoto(fragment)
    } catch (e) {
      return Bluebird.resolve({})
    }
  }
)

export default withData<
  {
    fragmentService: FragmentService
  },
  { number: string },
  Fragment
>(
  ({ data, fragmentService, ...props }) => (
    <WithPhoto fragment={data} fragmentService={fragmentService} {...props} />
  ),
  (props) => props.fragmentService.find(props.number),
  {
    watch: (props) => [props.number],
  }
)
