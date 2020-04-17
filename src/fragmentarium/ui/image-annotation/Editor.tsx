import React, { ReactElement } from 'react'
import { Button, Card } from 'react-bootstrap'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from './annotation-token'
type SubmitAnnotationButtonProps = {
  token: AnnotationToken
  annotation: RawAnnotation
  onClick(annotation: RawAnnotation): void
}
function SubmitAnnotationButton({
  token,
  annotation,
  onClick,
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
            path: token.path,
          },
        })
      }}
    >
      {token.value}
    </Button>
  )
}
export type EditorProps = {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  onChange(annotation: RawAnnotation): void
  onSubmit(): void
}
export default function Editor({
  annotation,
  onChange,
  onSubmit,
  tokens,
}: EditorProps): ReactElement | null {
  const { geometry } = annotation
  if (geometry) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${geometry.x}%`,
          top: `${geometry.y + geometry.height}%`,
        }}
      >
        <Card>
          <Card.Body>
            {tokens.map((line, index) => (
              <div key={index}>
                {line.map((token) => (
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
