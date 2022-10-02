import React, { useState } from 'react'
import withData from 'http/withData'
import TextService from 'corpus/application/TextService'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
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
import { Token } from 'transliteration/domain/token'
import Markup from 'transliteration/ui/markup'
import { Col, Row } from 'react-bootstrap'
import LineNumber from 'corpus/ui/LineNumber'

function LemmaLine({
  variant,
  lemmaLine,
}: {
  variant: LineVariantDisplay
  lemmaLine: DictionaryLineDisplay
}): JSX.Element {
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(
      _.flatten(
        variant.reconstruction.map((token: Token) => token.uniqueLemma ?? [])
      )
    )
  )
  const translation = lemmaLine.line.translation.filter(
    (translation) => translation.language === 'en'
  )
  return (
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      <tr>
        <th scope="col" colSpan={2}>
          <span className="lines-with-lemma__textname">
            {lemmaLine.textName}
          </span>
          &nbsp;
          <span>
            ({lemmaLine.textId.genre} {textIdToString(lemmaLine.textId)})
          </span>
          &nbsp;
          <span>{lemmaLine.chapterName}</span>
          &nbsp;
          {lineNumberToString(lemmaLine.line.number)}:
        </th>
      </tr>
      <tr className="lines-with-lemma__textline">
        <LineNumber
          line={lemmaLine.line}
          activeLine={''}
          showOldLineNumbers={false}
        />
        <td>
          <LineTokens content={variant.reconstruction} />
        </td>
      </tr>
      {!_.isEmpty(translation) && (
        <tr>
          <Markup parts={translation[0].parts} container="td" colSpan={2} />
        </tr>
      )}
    </LineLemmasContext.Provider>
  )
}

export default withData<
  unknown,
  { lemmaId: string; genre?: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data }): JSX.Element => {
    return (
      <Row>
        <Col>
          <table>
            <tbody>
              {data.map((lemmaLine) =>
                lemmaLine.line.variants.map((variant, index) => (
                  <LemmaLine
                    variant={variant}
                    lemmaLine={lemmaLine}
                    key={index}
                  />
                ))
              )}
            </tbody>
          </table>
        </Col>
      </Row>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId, props.genre)
)
