import React from 'react'
import ExternalLink from 'common/ui/ExternalLink'
import { MesZlChapter } from 'signs/ui/display/MesZlText'
import 'signs/ui/display/MesZlSource.sass'

export const mesZlChapters: Readonly<
  Record<MesZlChapter, { tab: string; label: string }>
> = {
  kap3: { tab: 'Kap. Ⅲ · Lautwerte', label: 'Kapitel Ⅲ' },
  kap2: { tab: 'Kap. Ⅱ · Zeichenübersicht', label: 'Kapitel Ⅱ' },
}

export const ugaritVerlagUrl =
  'https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514'
export const borgerFontsUrl = '/fonts/BorgerAkkadian.ttc'

export function MesZlSourceCard({
  chapter,
}: {
  chapter: MesZlChapter
}): JSX.Element {
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
          <sup>2</sup>2010; <strong>{mesZlChapters[chapter].label}</strong>.
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

export function BorgerFontCredit(): JSX.Element {
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
