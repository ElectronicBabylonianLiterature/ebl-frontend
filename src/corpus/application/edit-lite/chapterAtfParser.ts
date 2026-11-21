import _ from 'lodash'
import {
  isHeaderRow,
  isParatextRow,
  isReconstructionExtensionRow,
  isTranslationRow,
  parseManuscriptRow,
  parseReconstructionRow,
} from 'corpus/application/edit-lite/chapterAtfRows'

export interface ParsedManuscriptLine {
  readonly siglum: string
  readonly labels: readonly string[]
  readonly number: string
  readonly atf: string
}

export interface ParsedVariant {
  readonly number: string
  readonly translation: string
  readonly reconstruction: string
  readonly manuscripts: readonly ParsedManuscriptLine[]
}

export interface ParsedLine {
  readonly number: string
  readonly translation: string
  readonly variants: readonly ParsedVariant[]
}

export interface ParsedChapterAtf {
  readonly lines: readonly ParsedLine[]
  readonly diagnostics: readonly string[]
}

interface ManuscriptLineDraft {
  readonly siglum: string
  readonly labels: readonly string[]
  readonly number: string
  readonly rows: string[]
}

interface BlockDraft {
  number: string | null
  readonly translationRows: string[]
  readonly reconstructionRows: string[]
  readonly manuscripts: ManuscriptLineDraft[]
  readonly unrecognisedRows: string[]
}

interface ParsedBlock {
  readonly variant: ParsedVariant | null
  readonly diagnostics: readonly string[]
}

function splitIntoBlocks(atf: string): string[][] {
  const blocks: string[][] = [[]]
  atf.split(/\r?\n/).forEach((row) => {
    if (row.trim() === '') {
      blocks.push([])
    } else {
      blocks[blocks.length - 1].push(row)
    }
  })
  return blocks.filter((rows) => rows.length > 0)
}

function consumeLeadingRow(draft: BlockDraft, row: string): void {
  const reconstruction = parseReconstructionRow(row)
  if (isTranslationRow(row)) {
    draft.translationRows.push(row)
  } else if (reconstruction) {
    draft.number = reconstruction.number
    draft.reconstructionRows.push(reconstruction.text)
  } else {
    draft.unrecognisedRows.push(row)
  }
}

function consumeVariantRow(draft: BlockDraft, row: string): void {
  const lastManuscript = _.last(draft.manuscripts)
  const manuscriptRow = parseManuscriptRow(row)
  if (lastManuscript && isParatextRow(row)) {
    lastManuscript.rows.push(row)
  } else if (!lastManuscript && isReconstructionExtensionRow(row)) {
    draft.reconstructionRows.push(row)
  } else if (manuscriptRow) {
    draft.manuscripts.push({
      siglum: manuscriptRow.siglum,
      labels: manuscriptRow.labels,
      number: manuscriptRow.number,
      rows: [manuscriptRow.text],
    })
  } else {
    draft.unrecognisedRows.push(row)
  }
}

function consumeRow(draft: BlockDraft, row: string): BlockDraft {
  if (draft.number === null) {
    consumeLeadingRow(draft, row)
  } else {
    consumeVariantRow(draft, row)
  }
  return draft
}

function createBlockDraft(): BlockDraft {
  return {
    number: null,
    translationRows: [],
    reconstructionRows: [],
    manuscripts: [],
    unrecognisedRows: [],
  }
}

function describeRows(place: string, rows: readonly string[]): string[] {
  return rows.map((row) => `${place}: unrecognised row "${row}"`)
}

function parseBlock(rows: readonly string[], blockNumber: number): ParsedBlock {
  const draft = rows
    .filter((row) => !isHeaderRow(row))
    .reduce(consumeRow, createBlockDraft())
  return draft.number === null
    ? {
        variant: null,
        diagnostics: describeRows(`Block ${blockNumber}`, [
          ...draft.translationRows,
          ...draft.unrecognisedRows,
        ]),
      }
    : {
        variant: {
          number: draft.number,
          translation: draft.translationRows.join('\n'),
          reconstruction: draft.reconstructionRows.join('\n'),
          manuscripts: draft.manuscripts.map(
            ({ rows: manuscriptRows, ...manuscript }) => ({
              ...manuscript,
              atf: manuscriptRows.join('\n'),
            }),
          ),
        },
        diagnostics: describeRows(
          `Line ${draft.number}`,
          draft.unrecognisedRows,
        ),
      }
}

function joinTranslations(variants: readonly ParsedVariant[]): string {
  return variants
    .map((variant) => variant.translation)
    .filter((translation) => translation !== '')
    .join('\n')
}

function groupIntoLines(variants: readonly ParsedVariant[]): ParsedLine[] {
  const groups: ParsedVariant[][] = []
  variants.forEach((variant) => {
    const lastGroup = _.last(groups)
    if (lastGroup && lastGroup[0].number === variant.number) {
      lastGroup.push(variant)
    } else {
      groups.push([variant])
    }
  })
  return groups.map((group) => ({
    number: group[0].number,
    translation: joinTranslations(group),
    variants: group,
  }))
}

export function parseChapterAtf(atf: string): ParsedChapterAtf {
  const blocks = splitIntoBlocks(atf).map((rows, index) =>
    parseBlock(rows, index + 1),
  )
  return {
    lines: groupIntoLines(
      blocks.flatMap((block) => (block.variant ? [block.variant] : [])),
    ),
    diagnostics: blocks.flatMap((block) => block.diagnostics),
  }
}
