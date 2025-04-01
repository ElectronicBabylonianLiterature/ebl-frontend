import React from 'react'
import _ from 'lodash'
import { AkkadianWord } from 'transliteration/domain/token'
import DisplayToken, {
  DamagedFlag,
  TokenProps,
} from 'transliteration/ui/DisplayToken'
import { addBreves } from 'transliteration/domain/accents'
import { isEnclosure } from 'transliteration/domain/type-guards'
import EnclosureFlags from 'transliteration/ui/EnclosureFlags'
import Flags from 'transliteration/ui/Flags'

export default function AkkadianWordComponent({
  token,
  Wrapper,
}: TokenProps): JSX.Element {
  const word = addBreves(token as AkkadianWord)
  const lastParts = _.takeRightWhile(word.parts, isEnclosure)
  const parts = _.dropRight(word.parts, lastParts.length)

  return (
    <>
      <DamagedFlag sign={{ flags: word.modifiers }} Wrapper={Wrapper}>
        <EnclosureFlags token={word}>
          {parts.map((token, index) => (
            <DisplayToken key={index} token={token} Wrapper={Wrapper} />
          ))}
          <Wrapper>
            <Flags flags={word.modifiers} />
          </Wrapper>
          {lastParts.map((token, index) => (
            <DisplayToken key={index} token={token} Wrapper={Wrapper} />
          ))}
        </EnclosureFlags>
      </DamagedFlag>
    </>
  )
}
