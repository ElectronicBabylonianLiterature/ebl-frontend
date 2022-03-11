import classNames from 'classnames'
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
      <td className={classNames([`Transliteration__${fragment.type}`])}>
        {fragment.prefix}
      </td>
      <td
        colSpan={columns}
        className={classNames([`Transliteration__${fragment.type}`])}
      >
        <Cf parallel={fragment} />F {fragment.hasDuplicates ? '&d ' : ''}
        {fragment.surface &&
          `${fragment.surface.abbreviation}${fragment.surface.status
            .map(statusAbbreviation)
            .join('')} `}
        {lineNumberToString(fragment.lineNumber)}
      </td>
    </>
  )
}

export function DisplayParallelText({ line, columns }: LineProps): JSX.Element {
  const text = line as ParallelText
  return (
    <>
      <td className={classNames([`Transliteration__${text.type}`])}>
        {text.prefix}
      </td>
      <td
        colSpan={columns}
        className={classNames([`Transliteration__${text.type}`])}
      >
        <Cf parallel={text} />
        {text.text.genre} {romans.romanize(text.text.category)}.
        {text.text.index}{' '}
        {text.chapter?.stage && `${Stages[text.chapter.stage].abbreviation} `}
        {text.chapter?.version && `${text.chapter.version} `}
        {text.chapter?.name && `${text.chapter.name} `}
        {lineNumberToString(text.lineNumber)}
      </td>
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
      <td className={classNames([`Transliteration__${composition.type}`])}>
        {composition.prefix}
      </td>
      <td
        colSpan={columns}
        className={classNames([`Transliteration__${composition.type}`])}
      >
        <Cf parallel={composition} /> ({composition.name}{' '}
        {lineNumberToString(composition.lineNumber)})
      </td>
    </>
  )
}
