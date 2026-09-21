import React, { useRef, useState } from 'react'
import { Button } from 'react-bootstrap'

type CopyStatus = 'idle' | 'copied' | 'failed'

const STATUS_MESSAGES: Readonly<Record<CopyStatus, string>> = {
  idle: '',
  copied: 'Map link copied to clipboard.',
  failed: 'Copying failed. Copy the address bar URL instead.',
}

async function writeToClipboard(link: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is unavailable')
  }
  await navigator.clipboard.writeText(link)
}

export default function MapShareLink(): JSX.Element {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const latestCopyAttemptRef = useRef(0)

  const copyLink = (): void => {
    const copyAttempt = latestCopyAttemptRef.current + 1
    latestCopyAttemptRef.current = copyAttempt
    writeToClipboard(window.location.href).then(
      () => {
        if (copyAttempt === latestCopyAttemptRef.current) setStatus('copied')
      },
      () => {
        if (copyAttempt === latestCopyAttemptRef.current) setStatus('failed')
      },
    )
  }

  return (
    <div className="map-share-link">
      <Button
        type="button"
        variant="outline-secondary"
        size="sm"
        onClick={copyLink}
      >
        Copy map link
      </Button>
      <span className="map-share-link__status" role="status" aria-live="polite">
        {STATUS_MESSAGES[status]}
      </span>
    </div>
  )
}
