import React, { useState } from 'react'
import { Button, Collapse } from 'react-bootstrap'
import { ReallexikonEntry, rlaArticleUrl } from 'realia/domain/RealiaEntry'
import ExternalLink from 'common/ui/ExternalLink'
import ReferenceList from 'bibliography/ui/ReferenceList'
import { rlaArticleId } from 'realia/ui/realiaSections'
import {
  RlaPageInfo,
  loadRlaPageIndex,
  rlaImageUrl,
} from 'realia/infrastructure/rlaPageIndex'

type Status = 'idle' | 'loading' | 'error' | 'unavailable' | 'ready'

function pageCaption(info: RlaPageInfo, scan: number): string {
  const pageNumber = scan - info.startScan + 1
  const pageCount = info.endScan - info.startScan + 1
  const start = info.pageLabel
    ? `Seite ${info.pageLabel}`
    : `Volume ${info.volume}`
  return pageCount > 1 ? `${start} ff. — ${pageNumber} / ${pageCount}` : start
}

function RlaPage({
  info,
  scan,
  title,
  onStep,
  onHide,
}: {
  info: RlaPageInfo
  scan: number
  title: string
  onStep: (delta: number) => void
  onHide: () => void
}): JSX.Element {
  const pageNumber = scan - info.startScan + 1
  const pageCount = info.endScan - info.startScan + 1
  return (
    <div className="Realia__rla-page">
      <div className="Realia__rla-page-controls">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={scan <= info.startScan}
          aria-label="Previous page"
          onClick={(): void => onStep(-1)}
        >
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </Button>
        <span className="Realia__rla-page-caption">
          {pageCaption(info, scan)}
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={scan >= info.endScan}
          aria-label="Next page"
          onClick={(): void => onStep(1)}
        >
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={onHide}>
          Hide
        </Button>
      </div>
      <img
        className="Realia__rla-page-image"
        src={rlaImageUrl(info.volume, scan)}
        alt={`${title}, page ${pageNumber} of ${pageCount}`}
        loading="lazy"
      />
    </div>
  )
}

export function ReallexikonArticle({
  entry,
}: {
  entry: ReallexikonEntry
}): JSX.Element {
  const [status, setStatus] = useState<Status>('idle')
  const [info, setInfo] = useState<RlaPageInfo | null>(null)
  const [scan, setScan] = useState(0)
  const [open, setOpen] = useState(false)

  const show = (): void => {
    if (info) {
      setOpen(true)
      return
    }
    setStatus('loading')
    loadRlaPageIndex().then(
      (index) => {
        const found = index.get(entry.id)
        if (found) {
          setInfo(found)
          setScan(found.startScan)
          setStatus('ready')
          setOpen(true)
        } else {
          setStatus('unavailable')
        }
      },
      () => setStatus('error'),
    )
  }

  return (
    <div id={rlaArticleId(entry.title)} className="Realia__rla-article">
      <div className="Realia__rla-title">
        <div className="Realia__rla-title-head">
          <h3 className="Realia__rla-title-heading">
            {entry.title}
            <ExternalLink
              href={rlaArticleUrl(entry.id)}
              className="Realia__rla-title-link"
              aria-label={`Open ${entry.title} on the online RlA`}
            >
              <i className="fas fa-external-link-alt" aria-hidden="true" />
            </ExternalLink>
          </h3>
          {!open && status !== 'loading' && (
            <Button
              variant="outline-secondary"
              size="sm"
              className="Realia__rla-page-toggle"
              onClick={show}
            >
              Show RlA page
            </Button>
          )}
        </div>
        {entry.reference && (
          <div className="Realia__rla-references">
            <ReferenceList references={[entry.reference]} />
          </div>
        )}
      </div>
      {status === 'loading' && (
        <p className="Realia__rla-page-status">Loading the RlA page…</p>
      )}
      {status === 'error' && (
        <p className="Realia__rla-page-status">
          The RlA page could not be loaded.
        </p>
      )}
      {status === 'unavailable' && (
        <p className="Realia__rla-page-status">
          No RlA page image is available for this article.
        </p>
      )}
      {info && (
        <Collapse in={open}>
          <div>
            <RlaPage
              info={info}
              scan={scan}
              title={entry.title}
              onStep={(delta): void => setScan(scan + delta)}
              onHide={(): void => setOpen(false)}
            />
          </div>
        </Collapse>
      )}
    </div>
  )
}
