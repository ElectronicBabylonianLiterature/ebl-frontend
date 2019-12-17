import React, { useEffect, useState } from 'react'
import AnnotationComponent from 'react-image-annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { uuid4 } from '@sentry/utils'
import _ from 'lodash'
import { Button, Card } from 'react-bootstrap'
import Annotation from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import { createAnnotationTokens, AnnotationToken } from './annotation-token'

type AnnotationProps = {
  annotation: Annotation
}

type OnDelete = (annotation: Annotation) => void
type RenderContent = (props: AnnotationProps) => React.ReactNode

const renderContent = (onDelete: OnDelete): RenderContent => ({
  annotation
}: AnnotationProps): React.ReactNode => {
  const { geometry, data } = annotation
  if (geometry) {
    return (
      <div
        key={data && data.id}
        style={{
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y + geometry.height}%`
        }}
      >
        <Card>
          <Card.Body>{data && data.value}</Card.Body>
          <Card.Footer>
            <Button onClick={(): void => onDelete(annotation)}>Delete</Button>
          </Card.Footer>
        </Card>
      </div>
    )
  } else {
    return null
  }
}

type EditorProps = {
  onChange(annotation: Annotation): void
  onSubmit(): void
}
type RenderEditor = (props: AnnotationProps & EditorProps) => React.ReactNode
const renderEditor = (
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
): RenderEditor => (props: AnnotationProps & EditorProps): React.ReactNode => {
  const { geometry } = props.annotation
  if (geometry) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y + geometry.height}%`
        }}
      >
        <Card>
          <Card.Body>
            {tokens.map((line, index) => (
              <div key={index}>
                {line.map(token => (
                  <span key={token.path.join(',')}>
                    {token.enabled ? (
                      <React.Fragment key={token.path.join(',')}>
                        <Button
                          size="sm"
                          variant={
                            _.isEqual(
                              token.path,
                              props.annotation.data &&
                                props.annotation.data.path
                            )
                              ? 'dark'
                              : 'outline-dark'
                          }
                          onClick={(): void => {
                            props.onChange({
                              ...props.annotation,
                              data: {
                                ...props.annotation.data,
                                value: `${token.value}`,
                                path: token.path
                              }
                            })
                          }}
                        >
                          {token.value}
                        </Button>{' '}
                      </React.Fragment>
                    ) : (
                      token.value
                    )}{' '}
                  </span>
                ))}
              </div>
            ))}
          </Card.Body>
          <Card.Footer>
            <Button onClick={props.onSubmit}>Submit</Button>
          </Card.Footer>
        </Card>
      </div>
    )
  } else {
    return null
  }
}

interface Props {
  image: URL
  fragment: Fragment
  initialAnnotations: readonly Annotation[]
  fragmentService: FragmentService
}
function FragmentAnnotation({
  fragment,
  image,
  initialAnnotations,
  fragmentService
}: Props): React.ReactElement {
  const [annotation, setAnnotation] = useState<Annotation | {}>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initialAnnotations
  )

  const tokens = createAnnotationTokens(fragment)

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
    const newAnnotation: Annotation = {
      geometry: geometry,
      data: {
        ...data,
        id: uuid4()
      }
    }
    setAnnotation({})
    setAnnotations([...annotations, newAnnotation])
  }

  return (
    <>
      <AnnotationComponent
        src={image}
        alt={fragment.number}
        annotations={annotations}
        type={RectangleSelector.TYPE}
        value={annotation}
        onChange={onChange}
        onSubmit={onSubmit}
        renderEditor={renderEditor(tokens)}
        renderContent={renderContent(onDelete)}
        allowTouch
      />
      <Button
        onClick={() =>
          fragmentService.updateAnnotations(fragment.number, annotations)
        }
      >
        Save
      </Button>
    </>
  )
}

function Annotator({
  image,
  fragment,
  annotations,
  fragmentService
}: {
  image: Blob
  fragment: Fragment
  annotations: readonly Annotation[]
  fragmentService: FragmentService
}): React.ReactElement {
  const [objectUrl, setObjectUrl] = useState()
  useEffect(() => {
    const url = URL.createObjectURL(image)
    setObjectUrl(url)
    return (): void => URL.revokeObjectURL(url)
  }, [image])

  return (
    <FragmentAnnotation
      image={objectUrl}
      fragment={fragment}
      initialAnnotations={annotations}
      fragmentService={fragmentService}
    />
  )
}

const WithAnnotations = withData<
  { fragment: Fragment; image: Blob; fragmentService: FragmentService },
  {},
  readonly Annotation[]
>(
  ({ data, ...props }) => <Annotator {...props} annotations={data} />,
  ({ fragment, fragmentService }) =>
    fragmentService.findAnnotations(fragment.number)
)

const WithPhoto = withData<
  { fragment: Fragment; fragmentService: FragmentService },
  {},
  Blob
>(
  ({ data, ...props }) => <WithAnnotations {...props} image={data} />,
  ({ fragment, fragmentService }) => fragmentService.findPhoto(fragment)
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
  props => props.fragmentService.find(props.number)
)
