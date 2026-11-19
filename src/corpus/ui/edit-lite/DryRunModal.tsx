import React, { useId } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly payload: LinesUpdateDto | Readonly<Record<string, unknown>> | null
  readonly onHide: () => void
  readonly target?: string
  readonly notice?: string
}

export const dryRunTarget = 'POST …/lines'
export const dryRunNotice =
  'Dry run: nothing was sent to the server. This is the request that saving would send.'

export default function DryRunModal({
  payload,
  onHide,
  target = dryRunTarget,
  notice = dryRunNotice,
}: Props): JSX.Element {
  const titleId = useId()

  return (
    <Modal
      show={payload !== null}
      onHide={onHide}
      size="lg"
      animation={false}
      aria-labelledby={titleId}
    >
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>Request preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="edit-lite-dry-run__notice">{notice}</p>
        <p>
          Target: <code>{target}</code>
        </p>
        <pre className="edit-lite-dry-run__body" aria-label="Request body">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
