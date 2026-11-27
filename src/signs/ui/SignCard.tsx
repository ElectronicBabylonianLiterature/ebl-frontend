import React, { Fragment, ReactNode } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import Sign from 'signs/domain/Sign'
import 'signs/ui/display/CuneiformFonts.css'
import 'signs/ui/SignCard.sass'

function mesZlLabel(sign: Sign): string | null {
  const numbers = sign.mesZlNumbers
  return numbers.length > 0 ? `MesZL ${numbers.join(', ')}` : null
}

function codePoints(sign: Sign): string[] {
  return sign.unicode.map(
    (codePoint) => `U+${codePoint.toString(16).toUpperCase()}`,
  )
}

function Caption({
  sign,
  renderMesZl,
}: {
  sign: Sign
  renderMesZl?: (label: string) => ReactNode
}): JSX.Element {
  const label = mesZlLabel(sign)
  const parts: { key: string; content: ReactNode }[] = [
    ...(label
      ? [{ key: label, content: renderMesZl ? renderMesZl(label) : label }]
      : []),
    ...codePoints(sign).map((codePoint) => ({
      key: codePoint,
      content: codePoint,
    })),
  ]
  return (
    <span className="SignCard__caption">
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 && ' · '}
          {part.content}
        </Fragment>
      ))}
    </span>
  )
}

export default function SignCard({
  sign,
  compact = false,
  renderMesZl,
}: {
  sign: Sign
  compact?: boolean
  renderMesZl?: (label: string) => ReactNode
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
      <Caption sign={sign} renderMesZl={renderMesZl} />
    </div>
  )
}
