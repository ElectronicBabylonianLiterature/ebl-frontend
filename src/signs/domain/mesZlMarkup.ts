const CUNEIFORM_SIGN = '[\\u{12000}-\\u{1254F}\\u{100000}-\\u{10FFFD}]'
const CUNEIFORM = new RegExp(
  `${CUNEIFORM_SIGN}+(?:[ \\t\\u00A0]+${CUNEIFORM_SIGN}+)*`,
  'gu',
)

const OTHER_CATALOGUES = new Set([
  'ABC',
  'ABL',
  'ABUK',
  'ABZ',
  'ADD',
  'ARU',
  'ASy',
  'ATHE',
  'AV',
  'BAK',
  'BBR',
  'BDHP',
  'BL',
  'BMS',
  'Cate',
  'Choix',
  'Deimel',
  'ECTJ',
  'El-Amarna',
  'Emesal-Studien',
  'Fossey',
  'GPA',
  'Gelb',
  'HAU',
  'HethZL',
  'ITN',
  'KADP',
  'KAV',
  'KTH',
  'LAK',
  'LIḪ',
  'LKA',
  'LTTN',
  'NLDK',
  'NRGD',
  'OAIC',
  'RMA',
  'RÉC',
  'Rosengarten',
  'SAI',
  'SBH',
  'SBKI',
  'SFS',
  'SLOBA',
  'SRU',
  'STT',
  'SVJAD',
  'Schneider',
  'Supplément',
  'TBP',
  'TMB',
  'TUT',
  'UAZP',
  'aBZL',
  'ŠL',
])

const NUMBER_END = String.raw`(?![\d\p{L}′']|[.,]\d)`
const FOLLOWING_NUMBER = String.raw`(?:\s*(?:,|und|bzw\.)\s*|[-–])\d{1,3}${NUMBER_END}(?!\s+\p{Lu}\p{Ll})`
const REFERENCE = new RegExp(
  String.raw`(?<=^|[\s(;])n(\d{1,3})${NUMBER_END}((?:${FOLLOWING_NUMBER})*)`,
  'gu',
)

export function mesZlSearchUrl(number: string): string {
  return `/tools/signs?listsName=MZL&listsNumber=${encodeURIComponent(number)}`
}

function referenceLink(label: string, number: string): string {
  return `<a class="MesZl__reference" href="${mesZlSearchUrl(number)}">${label}</a>`
}

function precedingWord(text: string, offset: number): string {
  const words = text.slice(0, offset).trimEnd().split(/\s+/)
  return words[words.length - 1].replace(/^[(“"]+|[,;:.]+$/g, '')
}

function isOtherCatalogue(word: string): boolean {
  return OTHER_CATALOGUES.has(word) || /\d/.test(word) || /^[IVX]+$/.test(word)
}

function isMesZlChapter(text: string, offset: number): boolean {
  return /Kap\.\s+II\s*$/.test(text.slice(0, offset))
}

function isListItem(text: string, offset: number, match: string): boolean {
  return (
    text.slice(0, offset).trim() === '' && text[offset + match.length] === ')'
  )
}

function isReference(text: string, offset: number, match: string): boolean {
  if (isListItem(text, offset, match)) {
    return false
  }
  return (
    isMesZlChapter(text, offset) ||
    !isOtherCatalogue(precedingWord(text, offset))
  )
}

export function linkMesZlReferences(text: string): string {
  return text.replace(
    REFERENCE,
    (match: string, number: string, more: string, offset: number) =>
      isReference(text, offset, match)
        ? referenceLink(`n${number}`, number) +
          more.replace(/\d{1,3}/g, (next) => referenceLink(next, next))
        : match,
  )
}

export function wrapCuneiform(text: string): string {
  return text.replace(
    CUNEIFORM,
    (signs) => `<span class="MesZl__cuneiform">${signs}</span>`,
  )
}

export function escapeMarkdown(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/]/g, '\\]')
}

function escapeBlockMarkers(line: string): string {
  return line
    .replace(/^(\d+)([.)])(?=\s|$)/, '$1\\$2')
    .replace(/^([*_-])(?=(?:\s*\1){2,}\s*$)/, '\\$1')
    .replace(/^([#>+-]|\*(?=\s))/, '\\$1')
}

const TAB = '<span class="MesZl__tab"></span>'

function formatLine(line: string, linkReferences: boolean): string {
  const content = line.replace(/^[\t ]+/, '')
  const indentation = line.slice(0, line.length - content.length)
  const tabs = indentation.replace(/ /g, '').length
  const escaped = wrapCuneiform(escapeBlockMarkers(escapeMarkdown(content)))
  const linked = linkReferences ? linkMesZlReferences(escaped) : escaped
  return TAB.repeat(tabs) + linked.replace(/\t/g, TAB)
}

export interface MesZlMarkup {
  readonly head: string
  readonly paragraphs: readonly string[]
}

export function mesZlToMarkup(
  text: string,
  { linkReferences = true }: { linkReferences?: boolean } = {},
): MesZlMarkup {
  const [head, ...body] = text
    .split('\n')
    .filter((line) => line.trim() !== '---')
  return {
    head: formatLine(head, false),
    paragraphs: body
      .filter((line) => line.trim() !== '')
      .map((line) => formatLine(line, linkReferences)),
  }
}

export function mesZlParagraphsMarkup(paragraphs: readonly string[]): string {
  return ['<div class="MesZl__body">', ...paragraphs, '</div>'].join('\n\n')
}
