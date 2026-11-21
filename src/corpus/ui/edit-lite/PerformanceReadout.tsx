import React, { useEffect, useId, useState } from 'react'
import { ChapterEditSourceKind } from 'corpus/application/edit-lite/ChapterEditSource'
import { pluralize } from 'corpus/ui/edit-lite/lineSummary'
import 'corpus/ui/edit-lite/edit-lite.sass'

interface Props {
  readonly loadMilliseconds: number
  readonly kind: ChapterEditSourceKind
  readonly lineCount: number
  readonly manuscriptCount: number
  readonly diagnostics: readonly string[]
  readonly recountKey?: string
}

interface DocumentCounts {
  readonly elements: number
  readonly aceEditors: number
  readonly options: number
}

interface MetricProps {
  readonly label: string
  readonly testId: string
  readonly value: string | number
  readonly milliseconds?: number
}

const emptyCounts: DocumentCounts = { elements: 0, aceEditors: 0, options: 0 }

function countDocument(): DocumentCounts {
  return {
    elements: document.getElementsByTagName('*').length,
    aceEditors: document.querySelectorAll('.ace_editor').length,
    options: document.getElementsByTagName('option').length,
  }
}

export function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1000).toFixed(1)} s`
}

function Metric({
  label,
  testId,
  value,
  milliseconds,
}: MetricProps): JSX.Element {
  return (
    <div className="edit-lite-performance__metric">
      <dt>{label}</dt>
      <dd data-testid={testId} data-milliseconds={milliseconds}>
        {value}
      </dd>
    </div>
  )
}

export default function PerformanceReadout({
  loadMilliseconds,
  kind,
  lineCount,
  manuscriptCount,
  diagnostics,
  recountKey,
}: Props): JSX.Element {
  const diagnosticsId = useId()
  const [counts, setCounts] = useState<DocumentCounts>(emptyCounts)
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false)

  useEffect(() => {
    setCounts(countDocument())
  }, [recountKey])

  return (
    <section
      className="edit-lite-performance"
      data-testid="edit-lite-performance"
      aria-label="Performance"
    >
      <dl className="edit-lite-performance__metrics">
        <Metric
          label="Outline loaded in"
          testId="edit-lite-load-ms"
          value={formatSeconds(loadMilliseconds)}
          milliseconds={Math.round(loadMilliseconds)}
        />
        <Metric label="Source" testId="edit-lite-source-kind" value={kind} />
        <Metric label="Lines" testId="edit-lite-line-count" value={lineCount} />
        <Metric
          label="Manuscripts"
          testId="edit-lite-manuscript-count"
          value={manuscriptCount}
        />
        <Metric
          label="DOM elements"
          testId="edit-lite-dom-nodes"
          value={counts.elements}
        />
        <Metric
          label="Ace editors"
          testId="edit-lite-ace-editors"
          value={counts.aceEditors}
        />
        <Metric
          label="Option elements"
          testId="edit-lite-options"
          value={counts.options}
        />
        <Metric
          label="Diagnostics"
          testId="edit-lite-diagnostics"
          value={diagnostics.length}
        />
      </dl>
      <div className="edit-lite-performance__controls">
        <button
          type="button"
          className="edit-lite-performance__button"
          onClick={(): void => setCounts(countDocument())}
        >
          Refresh
        </button>
        {diagnostics.length > 0 && (
          <button
            type="button"
            className="edit-lite-performance__button"
            aria-expanded={isDiagnosticsOpen}
            aria-controls={diagnosticsId}
            onClick={(): void => setIsDiagnosticsOpen(!isDiagnosticsOpen)}
          >
            {isDiagnosticsOpen ? 'Hide' : 'Show'}{' '}
            {pluralize(diagnostics.length, 'diagnostic')}
          </button>
        )}
      </div>
      {diagnostics.length > 0 && (
        <ul
          id={diagnosticsId}
          className="edit-lite-performance__diagnostics"
          hidden={!isDiagnosticsOpen}
        >
          {isDiagnosticsOpen &&
            diagnostics.map((diagnostic, index) => (
              <li key={index}>{diagnostic}</li>
            ))}
        </ul>
      )}
    </section>
  )
}
