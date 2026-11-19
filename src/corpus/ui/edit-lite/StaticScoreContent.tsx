import React from 'react'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line, ManuscriptLine } from 'corpus/domain/line'
import { unknownSiglum } from 'corpus/ui/edit-lite/LazySiglumSelect'
import { stripTranslationPrefix } from 'corpus/ui/edit-lite/lineSummary'
import 'corpus/ui/edit-lite/edit-lite.sass'
import 'corpus/ui/edit-lite/StaticScoreLine.sass'

export type SiglumLookup = ReadonlyMap<number, string>

interface Props {
  readonly line: LineOutline
  readonly draft: Line | null
  readonly sigla: SiglumLookup
  readonly isDirty: boolean
  readonly error: string | null
}

interface ScoreRow {
  readonly siglum: string
  readonly text: string
}

interface ScoreVariant {
  readonly reconstruction: string
  readonly rows: readonly ScoreRow[]
}

interface Score {
  readonly number: string
  readonly translation: string
  readonly variants: readonly ScoreVariant[]
}

export const pendingText = '…'

export function splitRows(text: string): string[] {
  return text === '' ? [] : text.split('\n')
}

export function formatManuscriptLine(manuscriptLine: ManuscriptLine): string {
  const number = manuscriptLine.number === '' ? '' : `${manuscriptLine.number}.`
  return [...manuscriptLine.labels, number, manuscriptLine.atf]
    .filter((part) => part !== '')
    .join(' ')
}

function findSiglum(sigla: SiglumLookup, manuscriptId: number): string {
  return sigla.get(manuscriptId) ?? unknownSiglum
}

function toOutlineScore(line: LineOutline, sigla: SiglumLookup): Score {
  return {
    number: line.number,
    translation: line.translation,
    variants: line.variants.map((variant) => ({
      reconstruction: variant.reconstruction,
      rows: variant.manuscriptIds.map((manuscriptId) => ({
        siglum: findSiglum(sigla, manuscriptId),
        text: pendingText,
      })),
    })),
  }
}

function toDraftScore(draft: Line, sigla: SiglumLookup): Score {
  return {
    number: draft.number,
    translation: draft.translation,
    variants: draft.variants.map((variant) => ({
      reconstruction: variant.reconstruction,
      rows: variant.manuscripts.map((manuscriptLine) => ({
        siglum: findSiglum(sigla, manuscriptLine.manuscriptId),
        text: formatManuscriptLine(manuscriptLine),
      })),
    })),
  }
}

function ScoreVariantBlock({
  variant,
}: {
  readonly variant: ScoreVariant
}): JSX.Element {
  const [reconstruction, ...annotations] = variant.reconstruction.split('\n')
  return (
    <div className="edit-lite-score-line__variant">
      <div className="edit-lite-score-line__reconstruction" dir="auto">
        {reconstruction}
      </div>
      {annotations.length > 0 && (
        <div className="edit-lite-score-line__annotation" dir="auto">
          {annotations.join('\n')}
        </div>
      )}
      {variant.rows.map((row, index) => (
        <div key={index} className="edit-lite-score-line__row">
          <span className="edit-lite-score-line__siglum">{row.siglum}</span>
          {` ${row.text}`}
        </div>
      ))}
    </div>
  )
}

export default function StaticScoreContent({
  line,
  draft,
  sigla,
  isDirty,
  error,
}: Props): JSX.Element {
  const score =
    draft === null ? toOutlineScore(line, sigla) : toDraftScore(draft, sigla)
  return (
    <>
      <div className="edit-lite-score-line__aside">
        <div className="edit-lite-score-line__number">{score.number}</div>
        {isDirty && (
          <span className="edit-lite-badge edit-lite-badge--edited">
            edited
          </span>
        )}
      </div>
      <div className="edit-lite-score-line__body">
        {splitRows(score.translation).map((row, index) => (
          <div
            key={index}
            className="edit-lite-score-line__translation"
            dir="auto"
          >
            {stripTranslationPrefix(row)}
          </div>
        ))}
        {score.variants.map((variant, index) => (
          <ScoreVariantBlock key={index} variant={variant} />
        ))}
        {error !== null && (
          <div className="edit-lite-score-line__error">{error}</div>
        )}
      </div>
    </>
  )
}
