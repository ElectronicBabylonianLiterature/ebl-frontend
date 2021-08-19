import React, { ReactElement, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import { RawAnnotation } from 'fragmentarium/domain/annotation'
import { AnnotationToken } from './annotation-token'
import SignService from 'signs/application/SignService'
import SubmitAnnotationButton, {
  SubmitAnnotationButton as BlankAnnotationButton,
} from 'fragmentarium/ui/image-annotation/SubmitAnnotationButton'
import Sign from 'signs/domain/Sign'

export type EditorProps = {
  tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  annotation: RawAnnotation
  zoom: number
  onChange(annotation: RawAnnotation): void
  handleSelection(annotation: any): void
  signService: SignService
}
export default function Editor({
  annotation,
  onChange,
  handleSelection,
  tokens,
  signService,
}: EditorProps): ReactElement | null {
  const [hoveringReading, setHoveringReading] = useState<Sign | undefined>(
    undefined
  )
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
            <Row>
              <Col>
                <BlankAnnotationButton
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
                        setHoveringReading={setHoveringReading}
                        signService={signService}
                        handleSelection={handleSelection}
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
  } else {
    return null
  }
}
