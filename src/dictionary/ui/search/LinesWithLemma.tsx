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
import { EmptySection } from 'dictionary/ui/display/EmptySection'
import InlineMarkdown from 'common/InlineMarkdown'
import { createColumns, maxColumns } from 'transliteration/domain/columns'

function LemmaLineHeader({
  lemmaLine,
}: {
  lemmaLine: DictionaryLineDisplay
}): JSX.Element {
  return (
    <tr>
      <th scope="col" colSpan={2} className="lines-with-lemma__header">
        <span className="lines-with-lemma__textname">
          <InlineMarkdown source={lemmaLine.textName} />
        </span>
        &nbsp;
        <span>
          ({lemmaLine.textId.genre} {textIdToString(lemmaLine.textId)})
        </span>
        &nbsp;
        <span>{lemmaLine.chapterName}</span>
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

function getTokensWithLemma(
  tokens: readonly Token[],
  lemmaId: string
): number[] {
  return tokens.reduce(
    (tokenIndexes: number[], token: Token, index: number) => {
      if (token.uniqueLemma?.includes(lemmaId)) {
        tokenIndexes.push(index)
      }
      return tokenIndexes
    },
    []
  )
}

function LemmaLine({
  variant,
  variantNumber,
  lemmaLine,
  lemmaId,
  maxColumns,
}: {
  variant: LineVariantDisplay
  variantNumber: number
  lemmaLine: DictionaryLineDisplay
  lemmaId: string
  maxColumns: number
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
          <LineTokens
            content={variant.reconstruction}
            highlightTokens={getTokensWithLemma(
              variant.reconstruction,
              lemmaId
            )}
          />
        </td>
      </tr>
      {variant.manuscripts.map((manuscriptLine, index) => {
        return (
          manuscriptLine.line.type === 'TextLine' && (
            <tr key={index}>
              <td></td>
              <td>
                {/* <LineColumns
                  columns={manuscriptLine.line.columns}
                  maxColumns={maxColumns}
                  isInLineGroup={false}
                /> */}
              </td>
            </tr>
          )
        )
      })}
      {!_.isEmpty(translation) && (
        <tr>
          <td></td>
          <Markup parts={translation[0].parts} container="td" />
        </tr>
      )}
    </LineLemmasContext.Provider>
  )
}

function LemmaLineTable({
  lines,
  lemmaId,
}: {
  lines: DictionaryLineDisplay[]
  lemmaId: string
}): JSX.Element {
  const columns = lines.map((dictionaryLine) =>
    createColumns(dictionaryLine.line.variants[0].reconstruction)
  )
  return (
    <table>
      <tbody>
        {_.isEmpty(lines) ? (
          <tr>
            <EmptySection as={'td'} />
          </tr>
        ) : (
          _(lines)
            .groupBy('stage')
            .map((lemmaLines, index) => {
              return (
                <React.Fragment key={index}>
                  <tr>
                    <th
                      scope="col"
                      colSpan={2}
                      className={'lines-with-lemma__genre'}
                    >
                      {lemmaLines[0].stage}
                    </th>
                  </tr>
                  {_(lemmaLines)
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
                                lemmaId={lemmaId}
                                maxColumns={maxColumns(columns)}
                                key={index}
                              />
                            ))
                          )}
                        </React.Fragment>
                      )
                    })
                    .value()}
                </React.Fragment>
              )
            })
            .value()
        )}
      </tbody>
    </table>
  )
}

export default withData<
  { lemmaId: string },
  { lemmaId: string; genre?: string; textService: TextService },
  DictionaryLineDisplay[]
>(
  ({ data, lemmaId }): JSX.Element => {
    return (
      <Row>
        <Col>
          <LemmaLineTable lines={data} lemmaId={lemmaId} />
        </Col>
      </Row>
    )
  },
  (props) => props.textService.searchLemma(props.lemmaId, props.genre)
)
