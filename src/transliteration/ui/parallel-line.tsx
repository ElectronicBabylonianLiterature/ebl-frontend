import { Stages } from 'corpus/domain/period'
import React from 'react'
import romans from 'romans'
import { statusAbbreviation } from 'transliteration/domain/labels'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  ParallelComposition,
  ParallelFragment,
  ParallelText,
} from 'transliteration/domain/parallel-line'
import { LineProps } from './LineProps'
import TransliterationTd from './TransliterationTd'

function Cf({
  parallel: { hasCf },
}: {
  parallel: { hasCf: boolean }
}): JSX.Element {
  return <>{hasCf ? <span className="Transliteration__cf">cf. </span> : null}</>
}

export function DisplayParallelFragment({
  line,
  columns,
}: LineProps): JSX.Element {
  const fragment = line as ParallelFragment
  return (
    <>
      <TransliterationTd type={fragment.type}>
        {fragment.prefix}
      </TransliterationTd>
      <TransliterationTd colSpan={columns} type={fragment.type}>
        <Cf parallel={fragment} />F {fragment.hasDuplicates ? '&d ' : ''}
        {fragment.surface &&
          `${fragment.surface.abbreviation}${fragment.surface.status
            .map(statusAbbreviation)
            .join('')} `}
        {lineNumberToString(fragment.lineNumber)}
      </TransliterationTd>
    </>
  )
}

export function DisplayParallelText({ line, columns }: LineProps): JSX.Element {
  const text = line as ParallelText
  return (
    <>
      <TransliterationTd type={text.type}>{text.prefix}</TransliterationTd>
      <TransliterationTd colSpan={columns} type={text.type}>
        <Cf parallel={text} />
        {text.text.genre} {romans.romanize(text.text.category)}.
        {text.text.index}{' '}
        {text.chapter?.stage && `${Stages[text.chapter.stage].abbreviation} `}
        {text.chapter?.version && `${text.chapter.version} `}
        {text.chapter?.name && `${text.chapter.name} `}
        {lineNumberToString(text.lineNumber)}
      </TransliterationTd>
    </>
  )
}

export function DisplayParallelComposition({
  line,
  columns,
}: LineProps): JSX.Element {
  const composition = line as ParallelComposition
  return (
    <>
      <TransliterationTd type={composition.type}>
        {composition.prefix}
      </TransliterationTd>
      <TransliterationTd colSpan={columns} type={composition.type}>
        <Cf parallel={composition} /> ({composition.name}{' '}
        {lineNumberToString(composition.lineNumber)})
      </TransliterationTd>
    </>
  )
}
