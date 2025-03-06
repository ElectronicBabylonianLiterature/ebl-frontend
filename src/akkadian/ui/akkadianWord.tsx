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
import Ipa from 'akkadian/ui/ipa'
import {
  PhoneticProps,
  tokenToPhoneticSegments,
} from 'akkadian/application/phonetics/segments'

export default function AkkadianWordComponent({
  token,
  Wrapper,
  tokenClasses,
  lineGroup,
  isInPopover = false,
  showMeter = false,
  showIpa = false,
  phoneticProps = {},
}: TokenProps): JSX.Element {
  const word = addBreves(token as AkkadianWord)
  const lastParts = _.takeRightWhile(word.parts, isEnclosure)
  const parts = _.dropRight(word.parts, lastParts.length)
  const WordInfoComponent = isInPopover ? WordInfo : WordInfoWithPopover

  return (
    <>
      <WordInfoComponent
        word={word}
        tokenClasses={tokenClasses ?? []}
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
      <AkkadianWordAnalysis
        word={word}
        showMeter={showMeter}
        showIpa={showIpa}
        phoneticProps={phoneticProps}
      />
    </>
  )
}

function AkkadianWordAnalysis({
  word,
  showMeter,
  showIpa,
  phoneticProps,
}: {
  word: AkkadianWord
  showMeter: boolean
  showIpa: boolean
  phoneticProps?: PhoneticProps
}): JSX.Element {
  try {
    const segments = tokenToPhoneticSegments(word, phoneticProps)
    return (
      <>
        {showMeter && <Meter segments={segments} />}
        {showIpa && <Ipa segments={segments} enclose={false} />}
      </>
    )
  } catch (error) {
    return <></>
  }
}
