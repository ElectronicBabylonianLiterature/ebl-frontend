import React from 'react'
import Sign from 'signs/domain/Sign'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import SignCard from 'signs/ui/SignCard'
import MesZL from 'signs/ui/search/MesZL'

export default function SignSearchResult({
  sign,
}: {
  sign: Sign
}): JSX.Element {
  const renderMesZl = sign.mesZl
    ? (label: string): JSX.Element => (
        <MesZL mesZl={sign.mesZl} signName={sign.name} label={label} />
      )
    : undefined

  return (
    <div className="signs__sign">
      <SignCard sign={sign} compact renderMesZl={renderMesZl} />
      <div className="signs__sign__details">
        {sign.values.length > 0 ? (
          <InlineMarkdown source={`(${sign.displayValuesMarkdown})`} />
        ) : null}
      </div>
    </div>
  )
}
