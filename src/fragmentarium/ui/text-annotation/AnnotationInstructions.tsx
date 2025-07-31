import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import type { ModalProps } from 'react-bootstrap'

function AnnotationInfo(props: ModalProps) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          How to Annotate Named Entities
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ol>
          <li>
            Select a text span to mark a name
            <ul>
              <li>
                Hold down the <code>alt</code>-key to add or remove words from
                the selection
              </li>
              <li>Names can be discontinuous and nested</li>
            </ul>
          </li>
          <li>Pick a suitable category</li>
          <li>
            Modify existing annotations by clicking on a span label
            <ul>
              <li>You can change the label or delete the annotation</li>
              <li>
                The span <em>cannot</em> be modified once the annotation is set
                (remove it and set a new annotation instead)
              </li>
            </ul>
          </li>
          <li>Click Save once the annotation is complete</li>
        </ol>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default function AnnotationInstructions(): JSX.Element {
  const [show, setShow] = React.useState(false)
  return (
    <div className={'text-annotation__instruction-trigger'}>
      <Button variant="link" onClick={() => setShow(true)}>
        <i className="fas fa-info-circle" aria-label="How to Use" />
      </Button>
      <AnnotationInfo show={show} onHide={() => setShow(false)} />
    </div>
  )
}
