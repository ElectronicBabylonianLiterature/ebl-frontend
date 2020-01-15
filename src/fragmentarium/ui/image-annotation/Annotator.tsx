import React, { useEffect, useState, ReactElement } from 'react'
import AnnotationComponent from 'react-image-annotation'
import { RectangleSelector } from 'react-image-annotation/lib/selectors'
import withData from 'http/withData'
import { Fragment } from 'fragmentarium/domain/fragment'
import { uuid4 } from '@sentry/utils'
import _ from 'lodash'
import { Button, Card } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import FragmentService from 'fragmentarium/application/FragmentService'
import { createAnnotationTokens, AnnotationToken } from './annotation-token'
import SessionContext from 'auth/SessionContext'
import Session from 'auth/Session'
import produce from 'immer'

type AnnotationProps = {
  annotation: Annotation
}

type OnDelete = (annotation: Annotation) => void
type RenderContent = (props: AnnotationProps) => React.ReactNode

const renderContent = (onDelete: OnDelete): RenderContent => ({
  annotation
}: AnnotationProps): React.ReactNode => {
  const { geometry, data, outdated } = annotation
  const cardStyle = outdated ? 'warning' : 'light'
  const textStyle = outdated ? 'white' : undefined
  return (
    <div
      key={data.id}
      style={{
        position: 'absolute',
        left: `${geometry.x}%`,
        top: `${geometry.y + geometry.height}%`
      }}
    >
      <Card bg={cardStyle} text={textStyle}>
        <Card.Body>{data.value}</Card.Body>
        <Card.Footer>
          <Button onClick={(): void => onDelete(annotation)}>Delete</Button>
        </Card.Footer>
      </Card>
    </div>
  )
}

type SubmitAnnotationButtonProps = {
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
}
function SubmitAnnotationButton({
  token,
  annotation,
  onClick
}: SubmitAnnotationButtonProps): ReactElement {
  return (
    <Button
      size="sm"
      variant={token.hasMatchingPath(annotation) ? 'dark' : 'outline-dark'}
      onClick={(): void => {
        onClick({
          ...annotation,
          data: {
            ...annotation.data,
            value: `${token.value}`,
            path: token.path
          }
        })
      }}
    >
      {token.value}
    </Button>
  )
}

type EditorProps = {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  onChange(annotation: RawAnnotation): void
  onSubmit(): void
}
function Editor({
  annotation,
  onChange,
  onSubmit,
  tokens
}: EditorProps): ReactElement | null {
  const { geometry } = annotation
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
                      <SubmitAnnotationButton
                        token={token}
                        annotation={annotation}
                        onClick={onChange}
                      />
                    ) : (
                      token.value
                    )}{' '}
                  </span>
                ))}
              </div>
            ))}
          </Card.Body>
          <Card.Footer>
            <Button onClick={onSubmit}>Submit</Button>
          </Card.Footer>
        </Card>
      </div>
    )
  } else {
    return null
  }
}

const editorWithTokens = (
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
) => (props: Omit<EditorProps, 'tokens'>): JSX.Element => (
  <Editor tokens={tokens} {...props} />
)

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
  const tokens = createAnnotationTokens(fragment)
  const [annotation, setAnnotation] = useState<RawAnnotation>({})
  const [annotations, setAnnotations] = useState<readonly Annotation[]>(
    initialAnnotations.map(annotation => {
      const token = tokens
        .flat()
        .find(
          token =>
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
    const newAnnotation = new Annotation(geometry, {
      ...data,
      id: uuid4()
    })
    setAnnotation({})
    setAnnotations([...annotations, newAnnotation])
  }

  const onSave = (): void => {
    fragmentService.updateAnnotations(fragment.number, annotations)
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
        renderEditor={editorWithTokens(tokens)}
        renderContent={renderContent(onDelete)}
        allowTouch
      />
      <SessionContext.Consumer>
        {(session: Session): ReactElement => (
          <Button
            onClick={onSave}
            disabled={!session.isAllowedToAnnotateFragments()}
          >
            Save
          </Button>
        )}
      </SessionContext.Consumer>
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
