import React, { ReactElement, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import SubmitAnnotationButton, {
  SubmitBlankAnnotationButton,
} from 'fragmentarium/ui/image-annotation/annotation-tool/SubmitAnnotationButton'
import Sign from 'signs/domain/Sign'
import _ from 'lodash'

export type EditorProps = {
  hoveredAnnotation: Annotation | null
  annotations: readonly Annotation[]
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  onChange(annotation: RawAnnotation): void
  handleSelection(annotation: Annotation): void
}

export default function Editor({
  hoveredAnnotation,
  annotations,
  annotation,
  onChange,
  handleSelection,
  tokens,
}: EditorProps): ReactElement | null {
  const [signOfHoveringButton, setSignOfHoveringButton] = useState<Sign | null>(
    null
  )
  return (
    <div>
      <Card>
        <Card.Body>
          <Row>
            <Col>
              <SubmitBlankAnnotationButton
                hoveringOverAnnotation={hoveredAnnotation?.data.value === null}
                setSignOfHoveringButton={setSignOfHoveringButton}
                annotation={annotation}
                onClick={onChange}
                handleSelection={handleSelection}
              />
            </Col>
            <Col>
              {signOfHoveringButton && (
                <div>{signOfHoveringButton.displayCuneiformSigns}</div>
              )}
            </Col>
          </Row>
          <hr />
          {tokens.map((line, index) => (
            <div key={index}>
              {line.map((token) => (
                <span key={token.path.join(',')}>
                  {token.enabled ? (
                    <SubmitAnnotationButton
                      hoveringOverAnnotation={_.isEqual(
                        hoveredAnnotation?.data.path,
                        token.path
                      )}
                      setSignOfHoveringButton={setSignOfHoveringButton}
                      handleSelection={handleSelection}
                      alreadySelected={token.isInAnnotationTokens(annotations)}
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
      </Card>
    </div>
  )
}
