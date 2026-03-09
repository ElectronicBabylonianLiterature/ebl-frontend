import React from 'react'
import { stageToAbbreviation } from 'common/period'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import FragmentLink from 'fragmentarium/ui/FragmentLink'
import { labelsAbbreviation } from 'transliteration/domain/labels'
import lineNumberToString, {
  lineNumberToAtf,
} from 'transliteration/domain/lineNumberToString'
import {
  ParallelComposition,
  ParallelFragment,
  ParallelLine,
  parallelLinePrefix,
  ParallelText,
} from 'transliteration/domain/parallel-line'
import { textIdToString } from 'transliteration/domain/text-id'
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
  const atfLineNumber = lineNumberToAtf(fragment.lineNumber)
  const labels = labelsAbbreviation(fragment.labels)
  const hash = labels ? `${labels} ${atfLineNumber}` : atfLineNumber

  const parallel = (
    <>
      <Cf parallel={fragment} />F {fragment.hasDuplicates ? '&d ' : ''}
      {museumNumberToString(fragment.museumNumber)} {labels}{' '}
      {lineNumberToString(fragment.lineNumber)}
    </>
  )
  return fragment.exists ? (
    <FragmentLink
      number={museumNumberToString(fragment.museumNumber)}
      hash={hash}
    >
      {parallel}
    </FragmentLink>
  ) : (
    parallel
  )
}

export function DisplayParallelText({
  text,
}: {
  text: ParallelText
}): JSX.Element {
  const linkChapter = text.chapter ?? text.implicitChapter
  const parallel = (
    <>
      <Cf parallel={text} />
      {text.text.genre} {textIdToString(text.text)}{' '}
      {text.chapter?.stage && `${stageToAbbreviation(text.chapter.stage)} `}
      {text.chapter?.version && `${text.chapter.version} `}
      {text.chapter?.name && `${text.chapter.name} `}
      {lineNumberToString(text.lineNumber)}
    </>
  )

  return text.exists && linkChapter ? (
    <a
      href={`/corpus/${encodeURIComponent(
        text.text.genre,
      )}/${encodeURIComponent(text.text.category)}/${encodeURIComponent(
        text.text.index,
      )}/${encodeURIComponent(
        stageToAbbreviation(linkChapter.stage),
      )}/${encodeURIComponent(linkChapter.name)}#${encodeURIComponent(
        lineNumberToAtf(text.lineNumber),
      )}`}
    >
      {parallel}
    </a>
  ) : (
    parallel
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
