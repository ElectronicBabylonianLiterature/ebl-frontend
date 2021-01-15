import React from 'react'

import { Fragment } from 'fragmentarium/domain/fragment'
import Record from 'fragmentarium/ui/info/Record'
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  TableCell,
  TableRow,
  Table,
  BorderStyle,
  WidthType,
  AlignmentType,
  HyperlinkRef,
  HyperlinkType,
  FootnoteReferenceRun,
} from 'docx'
import { ReactElement } from 'react'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import { Glossary } from 'transliteration/ui/Glossary'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import rgbHex from 'rgb-hex'
import WordService from 'dictionary/application/WordService'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import { MemoryRouter } from 'react-router-dom'

export async function wordExport(
  fragment: Fragment,
  wordService: WordService
): Promise<Blob> {
  const tableHtml: JQuery = $(
    renderToString(TransliterationLines({ text: fragment.text }))
  )
  const notesHtml: JQuery = $(
    renderToString(TransliterationNotes({ notes: fragment.text.notes }))
  )
  const records: JQuery = $(
    renderToString(Record({ record: fragment.uniqueRecord }))
  )

  const glossaryFactory: GlossaryFactory = new GlossaryFactory(wordService)
  const glossaryJsx: JSX.Element = await glossaryFactory
    .createGlossary(fragment.text)
    .then((glossaryData) => {
      return Glossary({ data: glossaryData })
    })
  const glossaryHtml: JQuery = $(
    renderToString(wrapWithMemoryRouter(glossaryJsx))
  )

  const glossary: Paragraph | false =
    glossaryHtml.children().length > 1 ? getGlossary(glossaryHtml) : false
  const footNotes: Paragraph[] = getFootNotes(notesHtml)
  const tableWithFootnotes: any = getMainTableWithFootnotes(
    tableHtml,
    footNotes
  )

  const headline: Paragraph = getHeadline(fragment)

  const doc: Document = generateWordDocument(
    tableWithFootnotes.table,
    tableWithFootnotes.footNotes,
    glossary,
    headline,
    records,
    fragment
  )

  const wordBlob: Blob = await Packer.toBlob(doc).then((blob) => {
    return blob
  })

  return wordBlob
}

function wrapWithMemoryRouter(component: JSX.Element): ReactElement {
  return <MemoryRouter>{component}</MemoryRouter>
}

function getMainTableWithFootnotes(
  table: JQuery,
  footNotesLines: Paragraph[]
): any {
  table.hide()
  $('body').append(table)

  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)

  let footNotesCounter = 1

  const rows: TableRow[] = []
  const footNotes: Paragraph[] = []

  tablelines.each((i, el) => {
    const lineType = getLineTypeByHtml($(el))
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)

    if (lineType === 'emptyLine') return

    const tds: TableCell[] = []

    $(el)
      .find('td')
      .each((i, el) => {
        const runs: TextRun[] = []

        if (lineType === 'textLine') {
          $(el)
            .find('span,em,sup')
            .each((i, el) => {
              getTransliterationText($(el), runs)
            })
        } else if (lineType !== 'rulingDollarLine') {
          runs.push(getTextRun($(el)))
        }

        if (isNoteCell($(el))) {
          runs.push(new FootnoteReferenceRun(footNotesCounter))
          footNotes.push(footNotesLines[footNotesCounter - 1])
          footNotesCounter++
        }

        const para: Paragraph[] = [
          new Paragraph({
            children: runs,
            style: 'wellSpaced',
            heading: HeadingLevel.HEADING_1,
          }),
        ]

        const colspan: string | undefined = $(el).is('[colspan]')
          ? $(el).attr('colspan')
          : '1'
        const colspanInt: number = colspan ? parseInt(colspan) : 1

        tds.push(
          getFormatedTableCell(para, nextLineType, nextElement, colspanInt)
        )
      }) //td
    rows.push(new TableRow({ children: tds }))
  }) //tr

  table.remove()
  const wordTable: Table | false =
    rows.length > 0
      ? new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      : false
  return { table: wordTable, footNotes: footNotes }
}

function getFormatedTableCell(
  para: Paragraph[],
  nextLineType: string,
  nextElement: JQuery,
  colspan: number
) {
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

function getFootNotes(footNotesHtml): Paragraph[] {
  footNotesHtml.hide()
  $('body').append(footNotesHtml)

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

function getGlossary(glossaryHtml): Paragraph {
  glossaryHtml.hide()
  $('body').append(glossaryHtml)

  const runs: TextRun[] = []
  const divs: JQuery = glossaryHtml.find('div')
  fixHtmlParseOrder(divs)

  const headline: JQuery = glossaryHtml.find('h4')

  runs.push(
    new TextRun({
      text: headline.text(),
      size: parseInt(headline.css('font-size'), 10) * 2,
    }).break()
  )

  runs.push(new TextRun('').break())

  divs.each((i, el) => {
    $(el)
      .contents()
      .each((i, el) => {
        if ($(el).is('a')) runs.push(getTextRun($(el).find('span')))
        else if ($(el)[0].nodeType === 3)
          runs.push(new TextRun({ text: $(el).text(), size: 24 }))
        else if ($(el).is('span.Transliteration')) {
          $(el)
            .find('span,sup')
            .each((i, el) => {
              getTransliterationText($(el), runs)
            })
        } else if ($(el).is('sup')) runs.push(getTextRun($(el)))
      })

    runs.push(new TextRun('').break())
  })

  glossaryHtml.remove()

  return new Paragraph({
    children: runs,
    style: 'wellSpaced',
    heading: HeadingLevel.HEADING_1,
  })
}

function getTransliterationText(el: JQuery, runs: TextRun[]): void {
  if (
    (el.children().length === 0 &&
      el.text().trim().length &&
      el.parent().css('display') !== 'none') ||
    el.hasClass('Transliteration__wordSeparator')
  ) {
    runs.push(getTextRun($(el)))
  }
}

function fixHtmlParseOrder(inputElements: any): void {
  inputElements
    .find('span,em,sup')
    .filter((i, el) => {
      return $(el).children().length > 0
    })
    .contents()
    .filter((i, el) => {
      return $(el)[0].nodeType === 3 && $.trim($(el)[0].textContent).length
    })
    .wrap('<span></span>')
}

function getBottomStyle(nextLineType: string, nextElement: JQuery): any {
  if (nextLineType === 'rulingDollarLine') {
    const borderType: BorderStyle = getUnderLineType(nextElement)

    return {
      style: borderType,
      size: 1,
      color: '000000',
    }
  } else
    return {
      style: BorderStyle.NONE,
      size: 0,
      color: '000000',
    }
}

function getUnderLineType(element: JQuery): BorderStyle {
  const num: number = element.find('div').length
  if (num === 3) return BorderStyle.TRIPLE
  else if (num === 2) return BorderStyle.DOUBLE
  else return BorderStyle.SINGLE
}

function getLineTypeByHtml(element: JQuery): string {
  if (element.children().first().hasClass('Transliteration__TextLine'))
    return 'textLine'
  else if (element.find('div').hasClass('Transliteration__ruling'))
    return 'rulingDollarLine'
  else if (element.text().length < 2) return 'emptyLine'
  else if (element.find('.Transliteration__DollarAndAtLine').length > 0)
    return 'dollarAndAtLine'
  else return 'otherLine'
}

function isNoteCell(element: JQuery) {
  return element.find('.Transliteration__NoteLink').length > 0 ? true : false
}

function generateWordDocument(
  table: Table,
  footNotes: Paragraph[],
  glossary: Paragraph | false,
  headline: Paragraph,
  records: JQuery,
  fragment: Fragment
) {
  const doc: Document = new Document({
    styles: getStyles(),
    footnotes: footNotes,
    hyperlinks: getHyperLink(fragment),
  })

  const headLink: Paragraph = getHyperLinkParagraph()
  const credit: Paragraph = getCreditForHead(records)

  const docParts: any[] = [headline, headLink, credit]
  if (table) docParts.push(table)
  if (glossary) docParts.push(glossary)

  doc.addSection({
    children: docParts,
  })

  return doc
}

function getHyperLinkParagraph(): Paragraph {
  return new Paragraph({
    children: [new HyperlinkRef('headLink')],
    alignment: AlignmentType.CENTER,
  })
}

function getHyperLink(fragment: Fragment) {
  return {
    headLink: {
      link: 'https://www.ebabylon.org/fragmentarium/' + fragment.number,
      text: 'https://www.ebabylon.org/fragmentarium/' + fragment.number,
      type: HyperlinkType.EXTERNAL,
    },
  }
}

function getHeadline(fragment: Fragment): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: fragment.number, size: 32, bold: true })],
    alignment: AlignmentType.CENTER,
  })
}

function getCreditForHead(records: JQuery): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: getCredit(records), size: 16 }).break(),
      new TextRun('').break(),
    ],
    alignment: AlignmentType.CENTER,
  })
}

function getCredit(records: JQuery) {
  return (
    'Credit: Electronic Babylonian Literature Project; ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
      .slice(0, -2)
  )
}

function getStyles(): any {
  return {
    paragraphStyles: [
      {
        id: 'wellSpaced',
        name: 'Well Spaced',
        basedOn: 'Normal',
        quickFormat: true,
        paragraph: {
          spacing: { line: 350 },
        },
      },
    ],
  }
}

function getTextRun(el: any) {
  const italics: boolean = el.css('font-style') === 'italic' ? true : false
  const color: string | undefined = el.css('color')
    ? rgbHex(el.css('color'))
    : undefined
  const text: string = el.text()
  const superScript: boolean = el.is('sup') ? true : false
  const smallCaps: boolean =
    el.css('font-variant') === 'small-caps' ? true : false
  const size: number = el.css('font-variant') === 'small-caps' ? 16 : 24

  return new TextRun({
    text: text,
    color: color,
    italics: italics,
    superScript: superScript,
    smallCaps: smallCaps,
    size: size,
  })
}
