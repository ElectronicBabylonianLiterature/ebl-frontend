import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineTokens } from 'transliteration/ui/line-tokens'
import { TextId, textIdToString } from 'transliteration/domain/text-id'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'
import _ from 'lodash'

import './LinesWithLemma.sass'
import { Token } from 'transliteration/domain/token'
import { LineNumber } from 'transliteration/domain/line-number'

function LemmaLine({
  variant,
  lineNumber,
  textId,
  textName,
  chapterName,
}: {
  variant: LineVariantDisplay
  lineNumber: LineNumber
  textId: TextId
  textName: string
  chapterName: string
}): JSX.Element {
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(
      _.flatten(
        variant.reconstruction.map((token: Token) => token.uniqueLemma ?? [])
      )
    )
  )
  return (
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      <span className="lines-with-lemma__textname">{textName}</span>
      &nbsp;
      <span>
        ({textId.genre} {textIdToString(textId)})
      </span>
      &nbsp;
      <span>{chapterName}</span>
      &nbsp;
      {lineNumberToString(lineNumber)}:
      <br />
      <span className="lines-with-lemma__line">
        <LineTokens content={variant.reconstruction} />
      </span>
      <br />
    </LineLemmasContext.Provider>
  )
}

export default withData<
  unknown,
  { lemmaId: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data }): JSX.Element => {
    return (
      <>
        {data.map((line) =>
          line.line.variants.map((variant, index) => (
            <LemmaLine
              variant={variant}
              lineNumber={line.line.number}
              textId={line.textId}
              textName={line.textName}
              chapterName={line.chapterName}
              key={index}
            />
          ))
        )}
      </>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId)
)
