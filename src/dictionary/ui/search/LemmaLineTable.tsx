import React, { useState } from 'react'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineColumns, LineTokens } from 'transliteration/ui/line-tokens'
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
import Markup from 'transliteration/ui/markup'
import { stageToAbbreviation } from 'corpus/domain/period'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import { EmptySection } from 'dictionary/ui/display/EmptySection'
import InlineMarkdown from 'common/InlineMarkdown'
import { createColumns, maxColumns } from 'transliteration/domain/columns'
import { LineVariantDetails } from 'corpus/domain/line-details'
import { isTextLine } from 'transliteration/domain/type-guards'
import ManuscriptPopOver from 'corpus/ui/ManuscriptPopover'
import { parallelLinePrefix } from 'transliteration/domain/parallel-line'

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

function createCorpusChapterUrl(
  textId: TextId,
  stage: string,
  name: string
): string {
  const urlParts = [
    textId.genre,
    textId.category,
    textId.index,
    stageToAbbreviation(stage),
    name,
  ]

  return `https://www.ebl.lmu.de/corpus/${urlParts
    .map(encodeURIComponent)
    .join('/')}`
}

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
          (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={createCorpusChapterUrl(
              lemmaLine.textId,
              lemmaLine.stage,
              lemmaLine.chapterName
            )}
          >
            {lemmaLine.textId.genre} {textIdToString(lemmaLine.textId)}
          </a>
          )
        </span>
        &nbsp;
        <span>{lemmaLine.chapterName}</span>
      </th>
    </tr>
  )
}

function LemmaLineNumber({
  dictionaryLine,
}: {
  dictionaryLine: DictionaryLineDisplay
}): JSX.Element {
  const lineNumber = lineNumberToString(dictionaryLine.line.number)

  return (
    <a
      href={`${createCorpusChapterUrl(
        dictionaryLine.textId,
        dictionaryLine.stage,
        dictionaryLine.chapterName
      )}#${encodeURIComponent(lineNumber)}`}
    >
      {lineNumber}
    </a>
  )
}

function DictionaryManuscriptLines({
  variants,
  maxColumns,
  lemmaId,
}: {
  variants: readonly LineVariantDetails[]
  maxColumns: number
  lemmaId: string
}): JSX.Element {
  return (
    <>
      {variants.map((variant) =>
        variant.manuscripts.map((manuscript, index) => {
          return (
            <tr key={index} className="lines-with-lemma__manuscript-line">
              <td>
                {manuscript.isParallelText && parallelLinePrefix}
                <ManuscriptPopOver manuscript={manuscript} />
              </td>
              {isTextLine(manuscript.line) ? (
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <LineColumns
                          columns={manuscript.line.columns}
                          maxColumns={maxColumns}
                          isInLineGroup={false}
                          highlightLemma={lemmaId}
                        />
                      </tr>
                    </tbody>
                  </table>
                </td>
              ) : (
                <td colSpan={maxColumns}></td>
              )}
            </tr>
          )
        })
      )}
    </>
  )
}

function DictionaryLineVariant({
  variant,
  variantNumber,
  dictionaryLine,
  lemmaId,
}: {
  variant: LineVariantDisplay
  variantNumber: number
  dictionaryLine: DictionaryLineDisplay
  lemmaId: string
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
      <tr className="lines-with-lemma__textline">
        <td>
          {variantNumber === 0 ? (
            <LemmaLineNumber dictionaryLine={dictionaryLine} />
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
    </LineLemmasContext.Provider>
  )
}

function DictionaryLineGroup({
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
    <>
      <LemmaLineHeader lemmaLine={lines[0]} />
      {lines.map((dictionaryLine, index) => {
        const translation = dictionaryLine.line.translation.filter(
          (translation) => translation.language === 'en'
        )
        return (
          <React.Fragment key={index}>
            {dictionaryLine.line.variants.map((variant, index) => (
              <DictionaryLineVariant
                variant={variant}
                variantNumber={index}
                dictionaryLine={dictionaryLine}
                lemmaId={lemmaId}
                key={index}
              />
            ))}
            <DictionaryManuscriptLines
              variants={dictionaryLine.lineDetails.variants}
              maxColumns={maxColumns(columns)}
              lemmaId={lemmaId}
            />
            {!_.isEmpty(translation) && (
              <tr className="lines-with-lemma__translation">
                <td></td>
                <Markup parts={translation[0].parts} container="td" />
              </tr>
            )}
          </React.Fragment>
        )
      })}
    </>
  )
}

export default function LemmaLineTable({
  lines,
  lemmaId,
}: {
  lines: DictionaryLineDisplay[]
  lemmaId: string
}): JSX.Element {
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
                    .map((dictionaryLines, index) => (
                      <DictionaryLineGroup
                        lemmaId={lemmaId}
                        lines={dictionaryLines}
                        key={index}
                      />
                    ))
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
