// Prepares Borger's MesZL text (Kapitel II and III) for MarkdownAndHtmlToHtml:
// wraps cuneiform in spans so Borger's font can be applied, and turns his
// cross-references to other MesZL entries ("siehe n94", "wechselt mit n596",
// "Kap. II n10, 293 und 579") into links. A number is not linked when the
// word before it names another catalogue ("Rosengarten n348", "HethZL n20"),
// a publication ("LKA n…") or a volume or page ("SAA 11 n80", "SpTU II n51"),
// nor when it is a numbered list item ("n3)").

const CUNEIFORM =
  /[\u{12000}-\u{1254F}\u{100000}-\u{10FFFD}]+(?:\s+[\u{12000}-\u{1254F}\u{100000}-\u{10FFFD}]+)*/gu

const OTHER_CATALOGUES = new Set([
  'ASy',
  'BL',
  'Cate',
  'Choix',
  'Deimel',
  'El-Amarna',
  'Emesal-Studien',
  'EmesalStudien',
  'Fossey',
  'Gelb',
  'HethZI',
  'HethZL',
  'LIḪ',
  'aBZL',
  'LAK',
  'LKA',
  'LTTN',
  'RÉC',
  'Rosengarten',
  'SBH',
  'SLOBA',
  'Schneider',
  'Supplément',
  'ŠL',
  'p',
])

// "n" + number not glued to more digits, letters, primes, "." + digit or ")".
const REFERENCE =
  /(?<=^|[\s(;])n(\d{1,3})(?![\d\p{L}′')]|[.,]\d)((?:\s*(?:,|und|bzw\.)\s*\d{1,3}(?![\d\p{L}′')]|[.,]\d))*)/gu

export function mesZlSearchUrl(number: string): string {
  return `/tools/signs?listsName=MZL&listsNumber=${encodeURIComponent(number)}`
}

function referenceLink(label: string, number: string): string {
  return `<a class="MesZl__reference" href="${mesZlSearchUrl(number)}">${label}</a>`
}

function precedingWord(text: string, offset: number): string {
  const words = text.slice(0, offset).trimEnd().split(/\s+/)
  return (words[words.length - 1] ?? '').replace(/^[(“"]+|[,;:]+$/g, '')
}

function isOtherCatalogue(word: string): boolean {
  return (
    OTHER_CATALOGUES.has(word) ||
    /\d/.test(word) ||
    /^[IVX]+$/.test(word) ||
    /^[A-Z]{2,6}$/.test(word)
  )
}

function isMesZlChapter(text: string, offset: number): boolean {
  return /Kap\.\s+II\s*$/.test(text.slice(0, offset))
}

export function linkMesZlReferences(text: string): string {
  return text.replace(
    REFERENCE,
    (match: string, number: string, more: string, offset: number) =>
      !isMesZlChapter(text, offset) &&
      isOtherCatalogue(precedingWord(text, offset))
        ? match
        : referenceLink(`n${number}`, number) +
          more.replace(/\d{1,3}/g, (next) => referenceLink(next, next)),
  )
}

export function wrapCuneiform(text: string): string {
  return text.replace(
    CUNEIFORM,
    (signs) => `<span class="MesZl__cuneiform">${signs}</span>`,
  )
}

function escapeMarkdown(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/]/g, '\\]')
}

function formatLine(line: string, linkReferences: boolean): string {
  const escaped = wrapCuneiform(escapeMarkdown(line.replace(/\t/g, '  ')))
  return linkReferences ? linkMesZlReferences(escaped) : escaped
}

export interface MesZlMarkup {
  readonly head: string
  readonly paragraphs: readonly string[]
}

export function mesZlToMarkup(
  text: string,
  { linkReferences = true }: { linkReferences?: boolean } = {},
): MesZlMarkup {
  const [head = '', ...body] = text
    .split('\n')
    .filter((line) => line.trim() !== '---')
  return {
    head: formatLine(head, false),
    paragraphs: body
      .filter((line) => line.trim() !== '')
      .map((line) => formatLine(line, linkReferences)),
  }
}
