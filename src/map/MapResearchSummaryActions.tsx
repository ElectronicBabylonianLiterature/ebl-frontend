import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import { researchSummaryFileName } from 'map/mapResearchSummaryText'

export const MARKDOWN_MEDIA_TYPE = 'text/markdown;charset=utf-8'

type ActionStatus = 'idle' | 'copying' | 'copied' | 'copy-failed' | 'downloaded'

const STATUS_MESSAGES: Readonly<Record<ActionStatus, string>> = {
  idle: '',
  copying: 'Copying research summary…',
  copied: 'Research summary copied to clipboard.',
  'copy-failed': 'Copying failed. Download the summary instead.',
  downloaded: 'Research summary downloaded.',
}

async function writeToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is unavailable')
  }
  await navigator.clipboard.writeText(text)
}

interface Props {
  readonly title: string
  readonly selectionKey: string
  readonly buildSummary: () => { markdown: string; generatedAt: string }
}
export default function MapResearchSummaryActions({
  title,
  selectionKey,
  buildSummary,
}: Props): JSX.Element {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const attemptRef = useRef(0)

  useEffect(() => {
    attemptRef.current += 1
    setStatus('idle')
    return () => {
      attemptRef.current += 1
    }
  }, [buildSummary, selectionKey, title])

  const copy = (): void => {
    const attempt = ++attemptRef.current
    setStatus('copying')
    Promise.resolve()
      .then(() => writeToClipboard(buildSummary().markdown))
      .then(
        () => {
          if (attemptRef.current === attempt) setStatus('copied')
        },
        () => {
          if (attemptRef.current === attempt) setStatus('copy-failed')
        },
      )
  }

  const download = (): void => {
    attemptRef.current += 1
    const { markdown, generatedAt } = buildSummary()
    saveAs(
      new Blob([markdown], { type: MARKDOWN_MEDIA_TYPE }),
      researchSummaryFileName(title, generatedAt),
    )
    setStatus('downloaded')
  }

  return (
    <div className="map-research-actions">
      <Button type="button" variant="outline-primary" size="sm" onClick={copy}>
        Copy research summary
      </Button>
      <Button
        type="button"
        variant="outline-secondary"
        size="sm"
        onClick={download}
      >
        Download .md
      </Button>
      <span
        className="map-research-actions__status"
        data-testid="research-summary-status"
        aria-live="polite"
        aria-atomic="true"
      >
        {STATUS_MESSAGES[status]}
      </span>
    </div>
  )
}
