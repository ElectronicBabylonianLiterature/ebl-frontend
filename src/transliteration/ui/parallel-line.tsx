import { Stages } from 'corpus/domain/period'
import React from 'react'
import romans from 'romans'
import { statusAbbreviation } from 'transliteration/domain/labels'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  ParallelComposition,
  ParallelFragment,
  ParallelLine,
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

export function DisplayParallel({ line }: { line: ParallelLine }): JSX.Element {
  if (line instanceof ParallelFragment) {
    return <DisplayParallelFragment fragment={line} />
  } else if (line instanceof ParallelText) {
    return <DisplayParallelText text={line} />
  } else if (line instanceof ParallelComposition) {
    return <DisplayParallelComposition composition={line} />
  } else {
    throw new Error(`Invalid type of line ${typeof line}.`)
  }
}

export function DisplayParallelLine({ line, columns }: LineProps): JSX.Element {
  return (
    <>
      <Prefix type={line.type} />
      <TransliterationTd colSpan={columns} type={line.type}>
        <DisplayParallel line={line as ParallelLine} />
      </TransliterationTd>
    </>
  )
}
