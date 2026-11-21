import React, { useId } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { ChapterRequest } from 'corpus/application/edit-lite/ChapterEditSource'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly request: ChapterRequest | null
  readonly onHide: () => void
  readonly notice?: string
}

export function createDryRunNotice(action: string): string {
  return `Dry run: nothing was sent to the server. This is the request that ${action} would send.`
}

export const dryRunNotice = createDryRunNotice('saving')

export function formatRequestTarget(request: ChapterRequest): string {
  return `${request.method} ${request.url}`
}

export default function DryRunModal({
  request,
  onHide,
  notice = dryRunNotice,
}: Props): JSX.Element {
  const titleId = useId()

  return (
    <Modal
      show={request !== null}
      onHide={onHide}
      size="lg"
      animation={false}
      aria-labelledby={titleId}
    >
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>Request preview</Modal.Title>
      </Modal.Header>
      {request !== null && (
        <Modal.Body>
          <p className="edit-lite-dry-run__notice">{notice}</p>
          <p>
            Target: <code>{formatRequestTarget(request)}</code>
          </p>
          <pre className="edit-lite-dry-run__body" aria-label="Request body">
            {JSON.stringify(request.body, null, 2)}
          </pre>
        </Modal.Body>
      )}
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
