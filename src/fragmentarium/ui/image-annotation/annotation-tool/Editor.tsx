import React, { ReactElement, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import SubmitAnnotationButton from 'fragmentarium/ui/image-annotation/annotation-tool/SubmitAnnotationButton'
import './editor.css'

export type EditorProps = {
  disabled: boolean
  hoveringAnnotation: Annotation | null
  annotations: readonly Annotation[]
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  onChange(annotation: RawAnnotation): void
  handleSelection(annotation: Annotation): void
}

export default function Editor({
  disabled,
  hoveringAnnotation,
  annotations,
  annotation,
  onChange,
  handleSelection,
  tokens,
}: EditorProps): ReactElement | null {
  const [signOfHoveringButton, setSignOfHoveringButton] = useState<
    string | null
  >(null)

  return (
    <Row className="mt-5 pt-4">
      <Card>
        <Card.Body>
          <Row>
            <Col xs={1}>
              <SubmitAnnotationButton
                disabled={disabled}
                isHoveringOverAnnotation={
                  hoveringAnnotation?.data.value === null
                }
                alreadySelected={false}
                setSignOfHoveringButton={setSignOfHoveringButton}
                token={AnnotationToken.blank()}
                annotation={annotation}
                onClick={onChange}
                handleSelection={handleSelection}
              />
            </Col>
            <Col xs={1}>
              <SubmitAnnotationButton
                disabled={disabled}
                isHoveringOverAnnotation={
                  hoveringAnnotation?.data.value === null
                }
                alreadySelected={false}
                setSignOfHoveringButton={setSignOfHoveringButton}
                token={AnnotationToken.struct()}
                annotation={annotation}
                onClick={onChange}
                handleSelection={handleSelection}
              />
            </Col>
            <Col xs={1}>
              <SubmitAnnotationButton
                disabled={disabled}
                isHoveringOverAnnotation={
                  hoveringAnnotation?.data.value === null
                }
                alreadySelected={false}
                setSignOfHoveringButton={setSignOfHoveringButton}
                token={AnnotationToken.unclear([])}
                annotation={annotation}
                onClick={onChange}
                handleSelection={handleSelection}
              />
            </Col>

            <Col xs={{ span: 4, offset: 4 }}>
              {signOfHoveringButton && <div>{signOfHoveringButton}</div>}
            </Col>
          </Row>
          <hr />
          {tokens.map((line, index) => (
            <div key={index}>
              {line.map((token) => (
                <span key={token.path.join(',')}>
                  {token.enabled ? (
                    <SubmitAnnotationButton
                      disabled={disabled}
                      isHoveringOverAnnotation={token.isEqualPath(
                        hoveringAnnotation
                      )}
                      setSignOfHoveringButton={setSignOfHoveringButton}
                      handleSelection={handleSelection}
                      alreadySelected={token.isPathInAnnotations(annotations)}
                      token={token}
                      annotation={annotation}
                      onClick={onChange}
                    />
                  ) : (
                    token.displayValue
                  )}{' '}
                </span>
              ))}
            </div>
          ))}
        </Card.Body>
      </Card>
    </Row>
  )
}
