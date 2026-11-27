import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'
import ExternalLink from 'common/ui/ExternalLink'
import { mesZlToMarkup } from 'signs/domain/mesZlMarkup'
import {
  MesZlKap2Entry,
  MesZlKap2Section,
  mesZlKap2Sections,
} from 'signs/domain/Sign'
import SignService from 'signs/application/SignService'

type Chapter = 'kap3' | 'kap2'

const chapters: Readonly<Record<Chapter, { tab: string; label: string }>> = {
  kap3: { tab: 'Kap. Ⅲ · Lautwerte', label: 'Kapitel Ⅲ' },
  kap2: { tab: 'Kap. Ⅱ · Zeichenübersicht', label: 'Kapitel Ⅱ' },
}

export const ugaritVerlagUrl =
  'https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514'
export const borgerFontsUrl = '/fonts/BorgerAkkadian.ttc'

export function MesZlText({
  text,
  chapter,
}: {
  text: string
  chapter: Chapter
}): JSX.Element {
  const { head, paragraphs } = mesZlToMarkup(text)
  return (
    <div className={`MesZl MesZl--${chapter}`} lang="de">
      <MarkdownAndHtmlToHtml className="MesZl__head" markdownAndHtml={head} />
      {paragraphs.length > 0 && (
        <MarkdownAndHtmlToHtml markdownAndHtml={paragraphs.join('\n\n')} />
      )}
    </div>
  )
}

function SourceCard({ chapter }: { chapter: Chapter }): JSX.Element {
  return (
    <aside className="SignPage__source" aria-label="Source">
      <div className="SignPage__source-text">
        <span className="SignPage__source-label">From</span>
        <span>
          Borger, R.,{' '}
          <em>
            Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte
            Auflage
          </em>
          . Alter Orient und Altes Testament 305. Münster: Ugarit-Verlag,{' '}
          <sup>2</sup>2010; <strong>{chapters[chapter].label}</strong>.
        </span>
        <span className="SignPage__source-permission">
          By permission from Ugarit-Verlag
        </span>
      </div>
      <ExternalLink href={ugaritVerlagUrl} className="SignPage__source-link">
        <i className="fas fa-shopping-cart" aria-hidden="true" />
        Buy at Ugarit-Verlag
      </ExternalLink>
    </aside>
  )
}

function BorgerFontCredit(): JSX.Element {
  return (
    <p className="SignPage__borger-credit">
      <span>
        Cuneiform font by R. Borger, extracted from his computers by E. Jiménez,
        vectorized and encoded in Unicode by L. Sáenz. Used by kind permission
        of A. Zgoll (administrator of the Borger Nachlass), M. Worthington
        (holder of Borger’s written Nachlass) and E. Jiménez (recipient of his
        computers).
      </span>
      <a className="SignPage__download" href={borgerFontsUrl} download>
        <i className="fas fa-download" aria-hidden="true" />
        Download Borger fonts (.ttc)
      </a>
    </p>
  )
}

function useMesZlKap2(
  signName: string,
  signService: SignService,
  allowed: boolean,
): readonly MesZlKap2Entry[] {
  const [entries, setEntries] = useState<readonly MesZlKap2Entry[]>([])
  useEffect(() => {
    setEntries([])
    if (!allowed) {
      return
    }
    const controller = new AbortController()
    signService
      .findMesZlKap2(signName, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setEntries(result)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setEntries([])
        }
      })
    return () => controller.abort()
  }, [signName, signService, allowed])
  return entries
}

function Kap2SectionText({
  section,
  signService,
}: {
  section: MesZlKap2Section
  signService: SignService
}): JSX.Element {
  const [text, setText] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    setText(null)
    setFailed(false)
    const controller = new AbortController()
    signService
      .findMesZlKap2Section(section, controller.signal)
      .then((result) => !controller.signal.aborted && setText(result))
      .catch(() => !controller.signal.aborted && setFailed(true))
    return () => controller.abort()
  }, [section, signService])
  if (failed) {
    return <p className="SignPage__note">Could not load this section.</p>
  }
  return text === null ? (
    <p className="SignPage__note">Loading…</p>
  ) : (
    <MesZlText text={text} chapter="kap2" />
  )
}

function Kap2Sections({
  signService,
}: {
  signService: SignService
}): JSX.Element {
  const [open, setOpen] = useState<MesZlKap2Section | null>(null)
  const sections = Object.keys(mesZlKap2Sections) as MesZlKap2Section[]
  return (
    <div className="SignPage__meszl-sections">
      <span className="SignPage__source-label">Kapitel Ⅱ</span>
      {sections.map((section) => (
        <button
          key={section}
          type="button"
          className={classNames('btn btn-link SignPage__meszl-section-toggle', {
            active: open === section,
          })}
          aria-expanded={open === section}
          onClick={(): void => setOpen(open === section ? null : section)}
        >
          {mesZlKap2Sections[section]}
        </button>
      ))}
      {open && <Kap2SectionText section={open} signService={signService} />}
    </div>
  )
}

export default function MesZlSection({
  signName,
  kap3,
  signService,
  isAllowedToReadKap2,
}: {
  signName: string
  kap3: string
  signService: SignService
  isAllowedToReadKap2: boolean
}): JSX.Element {
  const kap2 = useMesZlKap2(signName, signService, isAllowedToReadKap2)
  const [selected, setSelected] = useState<Chapter>('kap3')
  const available: readonly Chapter[] = [
    ...(kap3 ? (['kap3'] as const) : []),
    ...(kap2.length > 0 ? (['kap2'] as const) : []),
  ]
  const chapter = available.includes(selected) ? selected : available[0]
  const showTabs = available.length > 1

  if (!chapter) {
    return <p className="SignPage__note">No MesZL entry for this sign.</p>
  }

  return (
    <>
      {showTabs && (
        <div
          className="nav nav-tabs SignPage__meszl-tabs"
          role="tablist"
          aria-label="MesZL chapters"
        >
          {available.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`sign-meszl-tab-${id}`}
              aria-selected={chapter === id}
              aria-controls="sign-meszl-panel"
              className={classNames('nav-link', { active: chapter === id })}
              onClick={(): void => setSelected(id)}
            >
              {chapters[id].tab}
            </button>
          ))}
        </div>
      )}
      <div
        id="sign-meszl-panel"
        role={showTabs ? 'tabpanel' : undefined}
        aria-labelledby={showTabs ? `sign-meszl-tab-${chapter}` : undefined}
        className={classNames('SignPage__meszl-body', {
          'SignPage__meszl-body--tabbed': showTabs,
        })}
      >
        {chapter === 'kap2' ? (
          <>
            {kap2.map((entry) => (
              <MesZlText key={entry.number} text={entry.text} chapter="kap2" />
            ))}
            <Kap2Sections signService={signService} />
          </>
        ) : (
          <MesZlText key={chapter} text={kap3} chapter={chapter} />
        )}
        <SourceCard chapter={chapter} />
        <BorgerFontCredit />
      </div>
    </>
  )
}
