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

export function DisplayParallelFragment({
  fragment,
}: {
  fragment: ParallelFragment
}): JSX.Element {
  return (
    <>
      <Cf parallel={fragment} />F {fragment.hasDuplicates ? '&d ' : ''}
      {fragment.surface &&
        `${fragment.surface.abbreviation}${fragment.surface.status
          .map(statusAbbreviation)
          .join('')} `}
      {lineNumberToString(fragment.lineNumber)}
    </>
  )
}
export function DisplayParallelFragmentLine({
  line,
  columns,
}: LineProps): JSX.Element {
  return (
    <>
      <Prefix type={line.type} />
      <TransliterationTd colSpan={columns} type={line.type}>
        <DisplayParallelFragment fragment={line as ParallelFragment} />
      </TransliterationTd>
    </>
  )
}

export function DisplayParallelText({
  text,
}: {
  text: ParallelText
}): JSX.Element {
  return (
    <>
      <Cf parallel={text} />
      {text.text.genre} {romans.romanize(text.text.category)}.{text.text.index}{' '}
      {text.chapter?.stage && `${Stages[text.chapter.stage].abbreviation} `}
      {text.chapter?.version && `${text.chapter.version} `}
      {text.chapter?.name && `${text.chapter.name} `}
      {lineNumberToString(text.lineNumber)}
    </>
  )
}

export function DisplayParallelTextLine({
  line,
  columns,
}: LineProps): JSX.Element {
  return (
    <>
      <Prefix type={line.type} />
      <TransliterationTd colSpan={columns} type={line.type}>
        <DisplayParallelText text={line as ParallelText} />
      </TransliterationTd>
    </>
  )
}

export function DisplayParallelComposition({
  composition,
}: {
  composition: ParallelComposition
}): JSX.Element {
  return (
    <>
      <Cf parallel={composition} /> ({composition.name}{' '}
      {lineNumberToString(composition.lineNumber)})
    </>
  )
}

export function DisplayParallelCompositionLine({
  line,
  columns,
}: LineProps): JSX.Element {
  return (
    <>
      <Prefix type={line.type} />
      <TransliterationTd colSpan={columns} type={line.type}>
        <DisplayParallelComposition composition={line as ParallelComposition} />
      </TransliterationTd>
    </>
  )
}
