import React, { PropsWithChildren, useState } from 'react'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineColumns } from 'transliteration/ui/line-tokens'
import { TextId } from 'transliteration/domain/text-id'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from 'transliteration/ui/LineLemmasContext'
import _ from 'lodash'

import './LinesWithLemma.sass'
import { Token } from 'transliteration/domain/token'
import { stageToAbbreviation } from 'common/period'
import { numberToUnicodeSubscript } from 'transliteration/application/SubIndex'
import { isAnyWord } from 'transliteration/domain/type-guards'
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

export default function DictionaryLineVariant({
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
  const isVariant = variantNumber !== 0

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
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      <tr
        className={`lines-with-lemma__textline ${
          isVariant ? '' : 'lines-with-lemma__textline--reconstruction'
        }`}
      >
        {isVariant ? (
          <td className={'lines-with-lemma__line-number--variant'}>
            {`variant${numberToUnicodeSubscript(variantNumber)}:`}&nbsp;
          </td>
        ) : (
          <td className={'lines-with-lemma__line-number'}>
            <LemmaLineNumber dictionaryLine={dictionaryLine} />
          </td>
        )}
        <LineColumns
          columns={[{ span: 1, content: [...variant.reconstruction] }]}
          maxColumns={1}
          highlightLemmas={[lemmaId]}
          TokenActionWrapper={WordInfoPopover}
        />
      </tr>
    </LineLemmasContext.Provider>
  )
}
