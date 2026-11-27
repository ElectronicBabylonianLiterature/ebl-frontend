import React from 'react'
import Sign from 'signs/domain/Sign'
import InlineMarkdown from 'common/ui/InlineMarkdown'
import SignCard from 'signs/ui/SignCard'
import MesZL from 'signs/ui/search/MesZL'
import { MES_ZL_LIST } from 'signs/domain/mesZlNumber'

export default function SignSearchResult({
  sign,
}: {
  sign: Sign
}): JSX.Element {
  const mesZlRecords = sign.lists.filter(
    (listElem) => listElem.name === MES_ZL_LIST,
  )
  const mesZlDash =
    sign.mesZl && sign.displayValuesMarkdown[0] ? (
      <span>&nbsp;&mdash;&nbsp;</span>
    ) : null

  return (
    <div className="signs__sign">
      <SignCard sign={sign} compact />
      <div className="signs__sign__details">
        {sign.values.length > 0 ? (
          <InlineMarkdown source={`(${sign.displayValuesMarkdown})`} />
        ) : null}
        {mesZlDash}
        {sign.mesZl && (
          <MesZL
            mesZl={sign.mesZl}
            mesZlRecords={mesZlRecords}
            signName={sign.name}
          />
        )}
      </div>
    </div>
  )
}
