import React, { useId } from 'react'
import { Button, Modal } from 'react-bootstrap'

interface Props {
  readonly show: boolean
  readonly title: string
  readonly confirmLabel: string
  readonly confirmVariant?: 'danger' | 'primary'
  readonly restoreFocus?: boolean
  readonly children: React.ReactNode
  readonly onConfirm: () => void
  readonly onCancel: () => void
}

export default function ConfirmModal({
  show,
  title,
  confirmLabel,
  confirmVariant = 'danger',
  restoreFocus = true,
  children,
  onConfirm,
  onCancel,
}: Props): JSX.Element {
  const titleId = useId()

  return (
    <Modal
      show={show}
      onHide={onCancel}
      animation={false}
      restoreFocus={restoreFocus}
      aria-labelledby={titleId}
    >
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
