import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import { LineTokens } from 'transliteration/ui/line-tokens'
import { textIdToString } from 'transliteration/domain/text-id'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'
import _ from 'lodash'

import './LinesWithLemma.sass'

export default withData<
  unknown,
  { lemmaId: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data }): JSX.Element => {
    return (
      <>
        {data.map((line, index) => {
          const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
            createLemmaMap(
              _.flatten(
                line.line.variants[0].reconstruction.map(
                  (token) => token.uniqueLemma ?? []
                )
              )
            )
          )
          return (
            <LineLemmasContext.Provider
              value={{
                lemmaMap: lemmaMap,
                lemmaSetter: lemmaSetter,
              }}
              key={index}
            >
              <span className="lines-with-lemma__textname">
                {line.textName}
              </span>
              &nbsp;
              <span>
                ({line.textId.genre} {textIdToString(line.textId)})
              </span>
              &nbsp;
              <span>{line.name}</span>
              &nbsp;
              {lineNumberToString(line.line.number)}:
              <br />
              <span className="lines-with-lemma__line">
                <LineTokens content={line.line.variants[0].reconstruction} />
              </span>
              <br />
            </LineLemmasContext.Provider>
          )
        })}
      </>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId)
)
