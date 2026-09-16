import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { saveAs } from 'file-saver'
import { researchSummaryFileName } from './mapResearchSummaryText'

export const MARKDOWN_MEDIA_TYPE = 'text/markdown;charset=utf-8'

type ActionStatus = 'idle' | 'copied' | 'copy-failed' | 'downloaded'

const STATUS_MESSAGES: Readonly<Record<ActionStatus, string>> = {
  idle: '',
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
  readonly buildSummary: () => { markdown: string; generatedAt: string }
}

/**
 * Copy and download share one builder, so the file and the clipboard can
 * never disagree about what the view contained at the moment of the action.
 */
export default function MapResearchSummaryActions({
  title,
  buildSummary,
}: Props): JSX.Element {
  const [status, setStatus] = useState<ActionStatus>('idle')

  const copy = (): void => {
    writeToClipboard(buildSummary().markdown).then(
      () => setStatus('copied'),
      () => setStatus('copy-failed'),
    )
  }

  const download = (): void => {
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
        role="status"
        aria-live="polite"
      >
        {STATUS_MESSAGES[status]}
      </span>
    </div>
  )
}
