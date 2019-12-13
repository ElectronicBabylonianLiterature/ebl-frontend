import React, { useEffect, useState } from 'react'
import AnnotationComponent from 'react-image-annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { uuid4 } from '@sentry/utils'
import { Button, Card } from 'react-bootstrap'
import Promise from 'bluebird'
import Annotation from 'fragmentarium/domain/annotation'

interface AnnotationToken {
  value: string
  path: readonly number[]
  enabled: boolean
}

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
                            token.path ===
                            (props.annotation.data &&
                              props.annotation.data.path)
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

interface Token {
  type: string
  value: string
  parts?: readonly Token[]
}

function mapToken(
  token: Token,
  path: readonly number[]
): AnnotationToken | AnnotationToken[] {
  if (['Reading', 'Logogram', 'CompoundGrapheme'].includes(token.type)) {
    return {
      value: token.value,
      path: path,
      enabled: true
    }
  } else if (token.parts) {
    return token.parts.flatMap((part: Token, index: number) =>
      mapToken(part, [...path, index])
    )
  } else {
    return {
      value: token.value,
      path: path,
      enabled: false
    }
  }
}

function createAnnotationTokens(
  fragment: Fragment
): ReadonlyArray<ReadonlyArray<AnnotationToken>> {
  return fragment.text.lines.map((line, lineNumber) => [
    {
      id: String(lineNumber),
      path: [lineNumber],
      value: line.prefix || '',
      enabled: false
    },
    ...line.content.flatMap((token, index) =>
      mapToken(token, [lineNumber, index])
    )
  ])
}

interface Props {
  image: URL
  fragment: Fragment
}
function FragmentAnnotation({ fragment, image }: Props): React.ReactElement {
  const [annotation, setAnnotation] = useState<Annotation | {}>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>([])

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
    setAnnotation([...annotations, newAnnotation])
  }

  return (
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
  )
}

function Annotator({
  image,
  fragment
}: {
  image: Blob
  fragment: Fragment
}): React.ReactElement {
  const [objectUrl, setObjectUrl] = useState()
  useEffect(() => {
    const url = URL.createObjectURL(image)
    setObjectUrl(url)
    return (): void => URL.revokeObjectURL(url)
  }, [image])

  return <FragmentAnnotation image={objectUrl} fragment={fragment} />
}

interface PhotoSource {
  findPhoto(fragment: Fragment): Promise<Blob>
}

export default withData<
  { fragment: Fragment },
  {
    fragmentService: PhotoSource
  },
  Blob
>(
  ({ data, ...props }) => <Annotator {...props} image={data} />,
  ({ fragment, fragmentService }) => fragmentService.findPhoto(fragment)
)
