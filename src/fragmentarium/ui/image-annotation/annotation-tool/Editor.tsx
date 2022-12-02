import React, { ReactElement, useEffect, useRef, useState } from 'react'
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
  const verticalRef = useRef<HTMLInputElement>(null)
  const [paddingTop, setPaddingTop] = useState(0)
  const [signOfHoveringButton, setSignOfHoveringButton] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (verticalRef.current) {
      verticalRef.current.setAttribute('orient', 'vertical')
    }
  }, [verticalRef])

  function onInput(event) {
    if (event.target) {
      setPaddingTop((100 - event.target.value) * 10)
    }
  }

  return (
    <Row className="mt-5 pt-4">
      <Col xs={1} className="p-0 ml-0" style={{ marginRight: '-5%' }}>
        <input
          type="range"
          ref={verticalRef}
          className="h-100"
          defaultValue={100}
          onInput={onInput}
        />
      </Col>
      <Col className="ml-0 pl-0" style={{ paddingTop: `${paddingTop}px` }}>
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
                  token={AnnotationToken.unclear()}
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
      </Col>
    </Row>
  )
}
