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
import WordInfoWithPopover, { WordInfo } from 'transliteration/ui/WordInfo'
import Meter from 'akkadian/ui/meter'
//import Ipa from 'akkadian/ui/ipa'

// ToDo:
// * Add meter component here
//  - Convert `variant.reconstruction` to string and pass it to the meter component.
//  - Use the `manuscript.isStandardText` for scholia chapters (if include scholia?).
//  - Make table conditional, i.e. to display meter. Phps, use existing wrapper.
//  - Make sure this works everywhere as expected (popovers etc.).
//  - Align with meter tokens.
//  - Solve issue with combinable acute that is not in the middle (font?).
//  - Adjust word download.
// * Add IPA component.
//  (same as meter)
//  - Add display setting controls

export default function AkkadianWordComponent({
  token,
  Wrapper,
  tokenClasses: modifierClasses,
  lineGroup,
  isInPopover = false,
  showMeter = false,
}: TokenProps): JSX.Element {
  const word = addBreves(token as AkkadianWord)
  const lastParts = _.takeRightWhile(word.parts, isEnclosure)
  const parts = _.dropRight(word.parts, lastParts.length)
  const WordInfoComponent = isInPopover ? WordInfo : WordInfoWithPopover

  return (
    <span style={{ display: 'inline-grid', gridTemplateRows: '1fr 1fr' }}>
      <WordInfoComponent
        word={word}
        tokenClasses={modifierClasses ?? []}
        lineGroup={lineGroup}
      >
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
      </WordInfoComponent>
      {showMeter && (
        <span style={{ color: 'red', fontStyle: 'normal' }}>
          <Meter transcription={[word.cleanValue]} />
        </span>
      )}
    </span>
  )
}
