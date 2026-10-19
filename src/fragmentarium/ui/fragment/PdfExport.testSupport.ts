import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { pdfExport } from 'fragmentarium/ui/fragment/PdfExport'
import { pdfMarkup } from 'fragmentarium/ui/fragment/PdfExport.markup.testSupport'
import { createWordService } from 'fragmentarium/ui/fragment/exportWordService.testSupport'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Text } from 'transliteration/domain/text'

export type PdfMarkup = Partial<typeof pdfMarkup>

export async function exportMarkup(markup: PdfMarkup): Promise<jsPDF> {
  Object.assign(pdfMarkup, { lines: '', notes: '', glossary: '' }, markup)
  const container = $('<div id="jQueryContainer"></div>').appendTo(
    document.body,
  )
  const fragment = fragmentFactory.build(
    { number: 'Test.1' },
    { associations: { text: new Text({ lines: [] }), record: [] } },
  )
  try {
    return await pdfExport(fragment, createWordService(), container)
  } finally {
    container.remove()
  }
}

export function pageStreams(doc: jsPDF): string[] {
  return [...doc.output().matchAll(/stream\n([\s\S]*?)\nendstream/g)]
    .map((match) => match[1])
    .slice(0, doc.getNumberOfPages())
}

export function glyphCount(stream: string): number {
  return stream.split('\n').filter((line) => line.endsWith(' Tj')).length
}

export function rowCount(doc: jsPDF): number {
  return pageStreams(doc)
    .map((stream) => new Set(stream.match(/ \S+ Td$/gm)).size)
    .reduce((total, rows) => total + rows, 0)
}

export function usesFontSize(doc: jsPDF, size: number): boolean {
  return pageStreams(doc).some((stream) => stream.includes(` ${size} Tf\n`))
}

export function usesColor(doc: jsPDF, color: string): boolean {
  return pageStreams(doc).some((stream) => stream.includes(`\n${color} rg\n`))
}

export function fontResource(doc: jsPDF, fontName: string): string {
  doc.setFont(fontName, 'normal')
  return `/${doc.getFont().id} `
}

export function word(text: string, attributes = ''): string {
  return `<span class="Transliteration__Word"${attributes}>${text}</span>`
}

export function words(count: number): string {
  return Array.from(
    { length: count },
    () => `${word('kur')}<span class="Transliteration__wordSeparator"> </span>`,
  ).join('')
}

export function cell(content: string, attributes = ''): string {
  return `<td${attributes}>${content}</td>`
}

export function textLine(number: number, ...cells: string[]): string {
  return `<tr><td class="Transliteration__TextLine">${number}.</td>${cells.join(
    '',
  )}</tr>`
}

export function table(...rows: string[]): string {
  return `<table><tbody>${rows.join('')}</tbody></table>`
}

export function repeat(count: number, markup: string): string {
  return Array.from({ length: count }, () => markup).join('')
}
