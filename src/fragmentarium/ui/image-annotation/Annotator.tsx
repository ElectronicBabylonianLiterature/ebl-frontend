import React, { useEffect, useState } from 'react'

import AnnotationComponent from './Annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { uuid4 } from '@sentry/utils'
import _ from 'lodash'
import { Col, Row } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import { AnnotationToken, createAnnotationTokens } from './annotation-token'
import produce from 'immer'
import Editor, { EditorProps } from './Editor'
import Content, { ContentProps } from './Content'
import useObjectUrl from 'common/useObjectUrl'
import Bluebird from 'bluebird'
import { usePrevious } from 'common/usePrevious'
import SignService from 'signs/application/SignService'

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

function FragmentAnnotation({
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

function isBlob(image: Blob | Record<string, never>): image is Blob {
  return (image as Blob).size !== undefined
}

function AnnotatorDisplay({
  image,
  fragment,
  annotations,
  fragmentService,
  signService,
}: {
  image: Blob
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
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
          signService={signService}
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
  signService,
}: {
  image: Blob | Record<string, never>
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
  signService: SignService
}): JSX.Element {
  if (isBlob(image)) {
    return (
      <AnnotatorDisplay
        image={image}
        fragment={fragment}
        annotations={annotations}
        fragmentService={fragmentService}
        signService={signService}
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
    signService: SignService
  },
  unknown,
  readonly Annotation[]
>(
  ({ data, ...props }) => <Annotator {...props} annotations={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.findAnnotations(fragment.number)
)

const WithPhoto = withData<
  {
    fragment: Fragment
    fragmentService: FragmentService
    signService: SignService
  },
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
    signService: SignService
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
