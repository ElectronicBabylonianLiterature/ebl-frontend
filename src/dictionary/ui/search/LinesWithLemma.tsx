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
import { stageToAbbreviation } from 'corpus/domain/period'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'

function LemmaLineHeader({
  lemmaLine,
}: {
  lemmaLine: DictionaryLineDisplay
}): JSX.Element {
  return (
    <tr>
      <th scope="col" colSpan={2} className="lines-with-lemma__header">
        <span className="lines-with-lemma__textname">{lemmaLine.textName}</span>
        &nbsp;
        <span>
          ({lemmaLine.textId.genre} {textIdToString(lemmaLine.textId)})
        </span>
        &nbsp;
        <span>{lemmaLine.chapterName}</span>:
      </th>
    </tr>
  )
}

function LemmaLineNumber({
  lemmaLine,
}: {
  lemmaLine: DictionaryLineDisplay
}): JSX.Element {
  const urlParts = [
    lemmaLine.textId.genre,
    lemmaLine.textId.category,
    lemmaLine.textId.index,
    stageToAbbreviation(lemmaLine.stage),
    lemmaLine.chapterName,
  ]

  return (
    <a
      href={`https://www.ebl.lmu.de/corpus/${urlParts
        .map(encodeURIComponent)
        .join('/')}#${encodeURIComponent(
        lineNumberToString(lemmaLine.line.number)
      )}`}
    >
      {lineNumberToString(lemmaLine.line.number)}
    </a>
  )
}

function LemmaLine({
  variant,
  variantNumber,
  lemmaLine,
}: {
  variant: LineVariantDisplay
  variantNumber: number
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
      <tr className="lines-with-lemma__textline">
        <td>
          {variantNumber === 0 ? (
            <LemmaLineNumber lemmaLine={lemmaLine} />
          ) : (
            <>{`variant${numberToUnicodeSubscript(variantNumber)}:`}&nbsp;</>
          )}
        </td>
        <td>
          <LineTokens content={variant.reconstruction} />
        </td>
      </tr>
      {!_.isEmpty(translation) && (
        <tr>
          <td></td>
          <Markup parts={translation[0].parts} container="td" />
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
              {_(data)
                .groupBy((line) => [line.textId, line.chapterName])
                .map((lemmaLines, index) => {
                  return (
                    <React.Fragment key={index}>
                      <LemmaLineHeader lemmaLine={lemmaLines[0]} />
                      {lemmaLines.map((lemmaLine) =>
                        lemmaLine.line.variants.map((variant, index) => (
                          <LemmaLine
                            variant={variant}
                            variantNumber={index}
                            lemmaLine={lemmaLine}
                            key={index}
                          />
                        ))
                      )}
                    </React.Fragment>
                  )
                })
                .value()}
            </tbody>
          </table>
        </Col>
      </Row>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId, props.genre)
)
