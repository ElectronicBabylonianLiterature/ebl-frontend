import React, { PropsWithChildren } from 'react'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TextId, textIdToString } from 'transliteration/domain/text-id'
import _ from 'lodash'

import './LinesWithLemma.sass'
import Markup from 'transliteration/ui/markup'
import { stageToAbbreviation } from 'common/period'
import InlineMarkdown from 'common/InlineMarkdown'
import { createColumns, maxColumns } from 'transliteration/domain/columns'
import { isAnyWord, isTextLine } from 'transliteration/domain/type-guards'
import ManuscriptPopOver from 'corpus/ui/ManuscriptPopover'
import { parallelLinePrefix } from 'transliteration/domain/parallel-line'
import DictionaryLineVariant from 'dictionary/ui/search/DictionaryLineVariant'
import { Token } from 'transliteration/domain/token'
import WordInfoWithPopover from 'transliteration/ui/WordInfo'

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

function DictionaryManuscriptLines({
  variant,
  maxColumns,
  lemmaId,
}: {
  variant: LineVariantDisplay
  maxColumns: number
  lemmaId: string
}): JSX.Element {
  const WordInfoPopover = ({
    token,
    children,
  }: PropsWithChildren<{
    token: Token
  }>): JSX.Element => {
    return isAnyWord(token) ? (
      <WordInfoWithPopover word={token}>{children}</WordInfoWithPopover>
    ) : (
      <>{children}</>
    )
  }
  return (
    <>
      {variant.manuscripts.map((manuscript, index) => {
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
                        highlightLemmas={[lemmaId]}
                        TokenActionWrapper={WordInfoPopover}
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
      })}
    </>
  )
}

export default function DictionaryLineGroup({
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
              <React.Fragment key={index}>
                <DictionaryLineVariant
                  variant={variant}
                  variantNumber={index}
                  dictionaryLine={dictionaryLine}
                  lemmaId={lemmaId}
                />
                <DictionaryManuscriptLines
                  variant={dictionaryLine.lineDetails.variants[index]}
                  maxColumns={maxColumns(columns)}
                  lemmaId={lemmaId}
                />
              </React.Fragment>
            ))}

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
