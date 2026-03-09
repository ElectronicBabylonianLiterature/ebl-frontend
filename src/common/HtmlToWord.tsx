import {
  Document,
  Paragraph,
  Table,
  TextRun,
  AlignmentType,
  TableCell,
  BorderStyle,
} from 'docx'
import { IPropertiesOptions } from 'docx/build/file/core-properties/properties.d'
import $ from 'jquery'
import { fixHtmlParseOrder } from 'common/HtmlParsing'
import { getStyles, getHeading, getBottomStyle } from 'common/HtmlToWordUtils'

import rgbHex from 'rgb-hex'

export function generateWordDocument(
  footNotes: Paragraph[],
  docParts: Array<Paragraph | Table>,
  hyperlink: IPropertiesOptions['hyperlinks'],
): Document {
  const doc: Document = new Document({
    styles: getStyles(),
    footnotes: footNotes,
    hyperlinks: hyperlink,
  })

  doc.addSection({
    children: docParts,
  })

  return doc
}

export function getCreditForHead(records: JQuery): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: getCredit(records), size: 16, break: 1 }),
      new TextRun({ break: 1 }),
    ],
    alignment: AlignmentType.CENTER,
  })
}

export function getFootNotes(
  footNotesHtml: JQuery<HTMLElement>,
  jQueryRef: JQuery<HTMLElement>,
): Paragraph[] {
  footNotesHtml.hide()
  jQueryRef.append(footNotesHtml)
  fixHtmlParseOrder(footNotesHtml)
  const footNotes: Paragraph[] = []
  footNotesHtml.find('li').each((i, el) => {
    const runs: TextRun[] = []
    $(el)
      .find('span,em,sup')
      .each((i, el) => {
        getTransliterationText($(el), runs)
      })
    footNotes.push(new Paragraph({ children: runs }))
  })
  footNotesHtml.remove()
  return footNotes
}

export function getGlossary(
  glossaryHtml: JQuery<HTMLElement>,
  jQueryRef: JQuery<HTMLElement>,
): Paragraph[] {
  glossaryHtml.hide()
  jQueryRef.append(glossaryHtml)
  const glossaryContent = getGlossaryContent(glossaryHtml)
  glossaryHtml.remove()
  return [
    getHeading('Glossary'),
    new Paragraph({
      children: glossaryContent,
      style: 'wellSpaced',
    }),
  ]
}

function getGlossaryContent(glossaryHtml: JQuery<HTMLElement>): TextRun[] {
  const divs: JQuery = glossaryHtml.find('div')
  fixHtmlParseOrder(divs)
  const runs: TextRun[] = []
  divs.each((i, el) => {
    $(el)
      .contents()
      .each((i, el) => {
        dealWithGlossaryHTML($(el), runs)
      })
    runs.push(new TextRun({ break: 1 }))
  })
  return runs
}

function dealWithGlossaryHTML(el, runs: TextRun[]): void {
  if (el.is('a')) {
    runs.push(getTextRun(el.find('span')))
  } else if (el[0].nodeType === 3) {
    runs.push(new TextRun({ text: el.text(), size: 24 }))
  } else if (el.is('span.Transliteration')) {
    el.find('span,sup').each((i, transliterationElement) => {
      getTransliterationText($(transliterationElement), runs)
    })
  } else if (el.is('sup')) {
    runs.push(getTextRun(el))
  }
}

function getCredit(records: JQuery) {
  return (
    'Credit: electronic Babylonian Library Project; ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
      .slice(0, -2)
  )
}

export function getTransliterationText(el: JQuery, runs: TextRun[]): void {
  if (
    (el.children().length === 0 &&
      el.text().trim().length &&
      el.parent().css('display') !== 'none' &&
      el.parent().parent().css('display') !== 'none') ||
    el.hasClass('Transliteration__wordSeparator')
  ) {
    runs.push(getTextRun($(el)))
  }
}

export function getTextRun(el: JQuery): TextRun {
  const italics: boolean = el.css('font-style') === 'italic' || el.is('em')
  const color: string | undefined = el.css('color')
    ? rgbHex(el.css('color'))
    : undefined
  const text: string = el.text()
  const superScript: boolean = el.is('sup')
  const smallCaps: boolean = el.css('font-variant') === 'all-small-caps'
  const size: number = el.css('font-variant') === 'all-small-caps' ? 16 : 24
  const characterSpacing: number | undefined = !['0', ''].includes(
    el.css('letter-spacing'),
  )
    ? 40
    : undefined
  return new TextRun({
    text: text,
    color: color,
    italics: italics,
    superScript: superScript,
    smallCaps: smallCaps,
    size: size,
    characterSpacing: characterSpacing,
  })
}

export function getFormatedTableCell(
  para: Paragraph[],
  nextLineType: string,
  nextElement: JQuery,
  colspan: number,
): TableCell {
  return new TableCell({
    children: para,
    columnSpan: colspan,
    borders: {
      top: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
      bottom: getBottomStyle(nextLineType, nextElement),
      left: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
      right: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
    },
  })
}

export function HtmlToWordRuns(element: JQuery): TextRun[] {
  const runs: TextRun[] = []
  element
    .find('span,em,sup,a,i')
    .not('.type-abbreviation')
    .each((i, el) => {
      const elJquery = $(el)
      elJquery.children('.type-abbreviation').remove()
      if (elJquery.prop('nodeName') === 'A') {
        runs.push(new TextRun({ text: elJquery.text(), size: 24 }))
      } else if (
        elJquery.contents().text().length > 0 &&
        elJquery.contents()[0].nodeType === 3 &&
        elJquery.parents('a').length === 0
      ) {
        getTransliterationText(elJquery, runs)
      }
    })
  return runs
}

export function HtmlToWordParagraph(element: JQuery): Paragraph {
  return new Paragraph({
    children: HtmlToWordRuns(element),
    style: 'wellSpaced',
  })
}
