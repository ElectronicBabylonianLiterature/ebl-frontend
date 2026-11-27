import React from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Sign from 'signs/domain/Sign'
import 'signs/ui/display/CuneiformFonts.css'
import 'signs/ui/SignCard.sass'

function caption(sign: Sign): string {
  const numbers = sign.mesZlNumbers
  return [
    numbers.length > 0 && `MesZL ${numbers.join(', ')}`,
    ...sign.unicode.map(
      (codePoint) => `U+${codePoint.toString(16).toUpperCase()}`,
    ),
  ]
    .filter(Boolean)
    .join(' · ')
}

export default function SignCard({
  sign,
  compact = false,
}: {
  sign: Sign
  compact?: boolean
}): JSX.Element {
  return (
    <div className={classNames('SignCard', { 'SignCard--compact': compact })}>
      <span className="SignCard__glyph" aria-hidden="true">
        {sign.displayCuneiformSigns}
      </span>
      {compact ? (
        <Link
          className="SignCard__name"
          to={`/signs/${encodeURIComponent(sign.name)}`}
        >
          {sign.displaySignName}
        </Link>
      ) : (
        <h1 className="SignCard__name">{sign.displaySignName}</h1>
      )}
      <span className="SignCard__caption">{caption(sign)}</span>
    </div>
  )
}
