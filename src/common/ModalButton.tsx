import React from 'react'
import { Modal, Button } from 'react-bootstrap'

export default function ModalButton({
  dialog,
  toggle,
  onToggle,
  show,
}: {
  dialog: React.ReactNode
  toggle: React.ReactNode
  onToggle: (show: boolean) => void
  show: boolean
}): JSX.Element {
  return (
    <>
      <Button
        size="sm"
        variant="outline-dark"
        active={show}
        onClick={() => onToggle(true)}
      >
        {toggle}
      </Button>

      <Modal
        show={show}
        onHide={() => onToggle(false)}
        animation={false}
        size="lg"
        centered
        backdrop={true}
        enforceFocus={false}
        restoreFocus={false}
        container={typeof document !== 'undefined' ? document.body : undefined}
      >
        <Modal.Body>{dialog}</Modal.Body>
      </Modal>
    </>
  )
}
