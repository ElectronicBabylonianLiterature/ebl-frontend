import React, { ReactElement, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import Annotation, { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from './annotation-token'
import SignService from 'signs/application/SignService'
import SubmitAnnotationButton, {
  SubmitAnnotationButton as BlankAnnotationButton,
} from 'fragmentarium/ui/image-annotation/SubmitAnnotationButton'
import Sign from 'signs/domain/Sign'
import _ from 'lodash'

export type EditorProps = {
  hoveredAnnotation: any
  annotations: readonly Annotation[]
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  onChange(annotation: RawAnnotation): void
  handleSelection(annotation: any): void
  signService: SignService
}
export default function Editor({
  hoveredAnnotation,
  annotations,
  annotation,
  onChange,
  handleSelection,
  tokens,
  signService,
}: EditorProps): ReactElement | null {
  const [hoveringReading, setHoveringReading] = useState<Sign | undefined>(
    undefined
  )
  return (
    <div>
      <Card>
        <Card.Body>
          <Row>
            <Col>
              <BlankAnnotationButton
                hoveringOverAnnotation={
                  hoveredAnnotation?.data.value === 'blank'
                }
                setHoveringReading={setHoveringReading}
                sign={undefined}
                token={new AnnotationToken('blank', [-1], '', true)}
                annotation={annotation}
                onClick={onChange}
                handleSelection={handleSelection}
              />
            </Col>
            <Col>
              {hoveringReading && (
                <div>{hoveringReading.displayCuneiformSigns}</div>
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
                      setHoveringReading={setHoveringReading}
                      signService={signService}
                      handleSelection={handleSelection}
                      alreadySelected={Boolean(
                        _.find(annotations, (annotation) =>
                          _.isEqual(annotation.data.path, token.path)
                        )
                      )}
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
