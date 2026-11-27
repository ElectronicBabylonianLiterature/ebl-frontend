import React from 'react'
import _ from 'lodash'
import Sign from 'signs/domain/Sign'
import { getDisplayName } from 'signs/domain/signListNames'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import ExternalLink from 'common/ui/ExternalLink'
import { signSectionIds } from 'signs/ui/display/signSections'
import SignCard from 'signs/ui/SignCard'

const scriptForms: readonly { readonly className: string; label: string }[] = [
  {
    className: 'CuneiformFonts__heading-old-babylonian-monumental',
    label: 'Old Babylonian (Monumental)',
  },
  {
    className: 'CuneiformFonts__heading-old-babylonian-literature',
    label: 'Old Babylonian (Literature)',
  },
  {
    className: 'CuneiformFonts__heading-old-babylonian-cursive',
    label: 'Old Babylonian Cursive',
  },
  { className: 'CuneiformFonts__heading-hittite', label: 'Hittite' },
  { className: '', label: 'Neo-Assyrian' },
  {
    className: 'CuneiformFonts__heading-neo-babylonian',
    label: 'Neo-Babylonian',
  },
]

function ScriptForms({
  sign,
  onShowMesZl,
}: {
  sign: Sign
  onShowMesZl: (() => void) | null
}): JSX.Element {
  return (
    <>
      <ul className="SignPage__forms" aria-label="Sign forms by period">
        {scriptForms.map(({ className, label }) => (
          <li key={label} className="SignPage__form">
            <div className={`SignPage__form-glyph ${className}`}>
              {sign.displayCuneiformSigns}
            </div>
            <div className="SignPage__form-label">{label}</div>
          </li>
        ))}
      </ul>
      <p className="SignPage__font-credits">
        <span className="SignPage__font-credits-label">Fonts</span>
        <span>
          Old Babylonian (Literature):{' '}
          <ExternalLink href="http://dx.doi.org/10.17169/refubium-44983">
            C. Ziegeler
          </ExternalLink>
        </span>
        <span>
          Other periods:{' '}
          <ExternalLink href="https://www.hethport.uni-wuerzburg.de/cuneifont/">
            S. Vanseveren
          </ExternalLink>
        </span>
        {onShowMesZl && (
          <span>
            MesZL:{' '}
            <a
              href={`#${signSectionIds.meszl}`}
              onClick={(event): void => {
                event.preventDefault()
                onShowMesZl()
              }}
            >
              R. Borger (see below)
            </a>
          </span>
        )}
      </p>
    </>
  )
}

export default function SignOverview({
  sign,
  onShowMesZl,
}: {
  sign: Sign
  onShowMesZl: (() => void) | null
}): JSX.Element {
  return (
    <div className="SignPage__overview">
      <SignCard sign={sign} />
      <div>
        <ScriptForms sign={sign} onShowMesZl={onShowMesZl} />
        <dl className="SignPage__facts">
          {sign.lists.length > 0 && (
            <>
              <dt>Sign lists</dt>
              <dd>
                {_.sortBy(sign.lists, ['name', 'number']).map((record) => (
                  <span
                    key={`${record.name}-${record.number}`}
                    className="SignPage__list-record"
                  >
                    <em>{getDisplayName(record.name)}</em> {record.number}
                  </span>
                ))}
              </dd>
            </>
          )}
          {sign.values.length > 0 && (
            <>
              <dt>Readings</dt>
              <dd>
                <InlineMarkdown source={sign.displayValuesMarkdown} />
              </dd>
            </>
          )}
          {sign.LaBaSi && (
            <>
              <dt>LaBaSi</dt>
              <dd>
                <ExternalLink
                  href={`https://labasi.acdh.oeaw.ac.at/tablets/sign/detail/${encodeURIComponent(
                    sign.LaBaSi,
                  )}`}
                  aria-label={`Open LaBaSi entry ${sign.LaBaSi}`}
                >
                  {sign.LaBaSi}{' '}
                  <i
                    className="fas fa-external-link-square-alt"
                    aria-hidden="true"
                  />
                </ExternalLink>
              </dd>
            </>
          )}
        </dl>
      </div>
    </div>
  )
}
