import { Stages } from 'corpus/domain/period'
import React from 'react'
import romans from 'romans'
import { statusAbbreviation } from 'transliteration/domain/labels'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  ParallelComposition,
  ParallelFragment,
  parallelLinePrefix,
  ParallelText,
} from 'transliteration/domain/parallel-line'
import { LineProps } from './LineProps'
import TransliterationTd from './TransliterationTd'

function Prefix({ type }: { type: string }): JSX.Element {
  return <TransliterationTd type={type}>{parallelLinePrefix}</TransliterationTd>
}

function Cf({
  parallel: { hasCf },
}: {
  parallel: { hasCf: boolean }
}): JSX.Element {
  return <>{hasCf ? <span className="Transliteration__cf">cf. </span> : null}</>
}

export function DisplayParallelFragmentLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const fragment = line as ParallelFragment
  return (
    <>
      <Prefix type={fragment.type} />
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

export function DisplayParallelTextLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const text = line as ParallelText
  return (
    <>
      <Prefix type={text.type} />
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

export function DisplayParallelCompositionLine({
  line,
  columns,
}: LineProps): JSX.Element {
  const composition = line as ParallelComposition
  return (
    <>
      <Prefix type={composition.type} />
      <TransliterationTd colSpan={columns} type={composition.type}>
        <Cf parallel={composition} /> ({composition.name}{' '}
        {lineNumberToString(composition.lineNumber)})
      </TransliterationTd>
    </>
  )
}
