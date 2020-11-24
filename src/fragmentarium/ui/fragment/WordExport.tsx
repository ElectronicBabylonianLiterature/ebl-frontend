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
  const zeit0 = performance.now()
  const table = $(renderToString(TransliterationLines({ text: fragment.text })))
  const notes = $(
    renderToString(TransliterationNotes({ notes: fragment.text.notes }))
  )
  const records = $(renderToString(Record({ record: fragment.uniqueRecord })))

  const glossaryFactory = new GlossaryFactory(wordService)
  const glossaryJsx = await glossaryFactory
    .createGlossary(fragment.text)
    .then((glossaryData) => {
      return Glossary({ data: glossaryData })
    })
  const glossaryHtml = $(renderToString(wrapWithMemoryRouter(glossaryJsx)))

  const glossary =
    glossaryHtml.children().length > 1 ? getGlossary(glossaryHtml) : false
  const footNotes = getFootNotes(notes)
  const tableWithFootnotes = getMainTableWithFootnotes(table, footNotes)

  const headline = getHeadline(fragment)

  const doc = generateWordDocument(
    tableWithFootnotes.table,
    tableWithFootnotes.footNotes,
    glossary,
    headline,
    records,
    fragment
  )

  const zeit1 = performance.now()

  console.log('Der Aufruf dauerte ' + (zeit1 - zeit0) + ' Millisekunden.')

  const wordBlob = await Packer.toBlob(doc).then((blob) => {
    return blob
  })
  return wordBlob
}

function wrapWithMemoryRouter(component) {
  return <MemoryRouter>{component}</MemoryRouter>
}

function getMainTableWithFootnotes(table, footNotesLines) {
  table.hide()
  $('body').append(table)

  const tablelines = table.find('tr')
  fixHtmlParseOrder(tablelines)

  let footNotesCounter = 1

  const rows: TableRow[] = []
  const footNotes: Paragraph[] = []

  tablelines.each(function (i, el) {
    const lineType = getLineTypeByHtml(el)
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)

    const tds: TableCell[] = []

    $(el)
      .find('td')
      .each(function (i, el) {
        const runs: TextRun[] = []

        if (lineType === 'textLine') {
          $(el)
            .find('span,sup')
            .each(function (i, el) {
              getTransliterationText(el, runs)
            })
        } else if (
          lineType === 'dollarAndAtLine' &&
          $(el).hasClass('Transliteration__DollarAndAtLine')
        ) {
          runs.push(getTextRun($(el)))
        } else if (
          lineType !== 'emptyLine' &&
          lineType !== 'rulingDollarLine'
        ) {
          runs.push(getTextRun($(el)))
        }

        if (isNoteCell(el)) {
          runs.push(new FootnoteReferenceRun(footNotesCounter))
          footNotes.push(footNotesLines[footNotesCounter - 1])
          footNotesCounter++
        }

        const para = [
          new Paragraph({
            children: runs,
            style: 'wellSpaced',
            heading: HeadingLevel.HEADING_1,
          }),
        ]
        tds.push(
          new TableCell({
            children: para,
            borders: {
              top: {
                style: getBorderStyle(el),
                size: 0,
                color: '000000',
              },
              bottom: getBottomStyle(nextLineType, nextElement, el),
              left: {
                style: getBorderStyle(el),
                size: 0,
                color: '000000',
              },
              right: {
                style: getBorderStyle(el),
                size: 0,
                color: '000000',
              },
            },
          })
        )
      }) //td

    rows.push(new TableRow({ children: tds }))
  }) //tr

  table.remove()
  const wordTable =
    rows.length > 0
      ? new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      : {}
  return { table: wordTable, footNotes: footNotes }
}

function getFootNotes(footNotesHtml) {
  footNotesHtml.hide()
  $('body').append(footNotesHtml)

  const footNotes: Paragraph[] = []

  footNotesHtml.find('li').each(function (i, el) {
    const runs: TextRun[] = []
    $(el)
      .find('span,em')
      .each(function (i, el) {
        getTransliterationText(el, runs)
      })
    footNotes.push(new Paragraph({ children: runs }))
  })
  footNotesHtml.remove()

  return footNotes
}

function getGlossary(glossaryHtml) {
  glossaryHtml.hide()
  $('body').append(glossaryHtml)

  const runs: TextRun[] = []
  const divs = glossaryHtml.find('div')

  const headline = glossaryHtml.find('h4')

  runs.push(
    new TextRun({
      text: headline.text(),
      size: parseInt(headline.css('font-size'), 10) * 2,
    }).break()
  )

  runs.push(new TextRun('').break())

  divs.each(function (i, el) {
    $(el)
      .contents()
      .each(function (i, el) {
        if ($(el).is('a')) runs.push(getTextRun($(el).find('span')))
        else if ($(el)[0].nodeType === 3)
          runs.push(new TextRun({ text: $(el).text(), size: 24 }))
        else if ($(el).is('span.Transliteration')) {
          $(el)
            .find('span,sup')
            .each(function (i, el) {
              getTransliterationText(el, runs)
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

function getTransliterationText(el, runs) {
  if (
    ($(el).children().length === 0 &&
      $(el).text().trim().length &&
      $(el).parent().css('display') !== 'none') ||
    $(el).hasClass('Transliteration__wordSeparator')
  ) {
    runs.push(getTextRun($(el)))
  }
}

function fixHtmlParseOrder(tablelines) {
  tablelines
    .find('span')
    .filter(function (i, el) {
      return $(el).children().length > 0
    })
    .contents()
    .filter(function (i, el) {
      return $(el)[0].nodeType === 3 && $.trim($(el)[0].textContent).length
    })
    .wrap('<span></span>')
}

function getBorderStyle(el) {
  // return (isNoteCell(el)) ? BorderStyle.SINGLE : BorderStyle.NONE
  return BorderStyle.NONE
}

function getBottomStyle(nextLineType, nextElement, el) {
  // if(nextLineType==="rulingDollarLine" || isNoteCell(el)){

  if (nextLineType === 'rulingDollarLine') {
    const borderType = getUnderLineType(nextElement)

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

function getUnderLineType(element) {
  const num = element.find('div').length
  if (num === 3) return BorderStyle.TRIPLE
  else if (num === 2) return BorderStyle.DOUBLE
  else return BorderStyle.SINGLE
}

function getLineTypeByHtml(el) {
  if ($(el).children().first('td').hasClass('Transliteration__TextLine'))
    return 'textLine'
  else if ($(el).find('div').hasClass('Transliteration__ruling'))
    return 'rulingDollarLine'
  else if ($(el).text().length < 2) return 'emptyLine'
  else if ($(el).find('.Transliteration__DollarAndAtLine').length > 0)
    return 'dollarAndAtLine'
  else return 'otherLine'
}

function isNoteCell(el) {
  return $(el).find('.Transliteration__NoteLink').length > 0 ? true : false
}

function generateWordDocument(
  table,
  footNotes,
  glossary,
  headline,
  records,
  fragment
) {
  const doc = new Document({
    styles: getStyles(),
    footnotes: footNotes,
    hyperlinks: getHyperLink(fragment),
  })

  const headLink = getHyperLinkParagraph()
  const credit = getCreditForHead(records)

  const docParts = [headline, headLink, credit, table]
  if (glossary) docParts.push(glossary)

  doc.addSection({
    children: docParts,
  })

  return doc
}

function getHyperLinkParagraph() {
  return new Paragraph({
    children: [new HyperlinkRef('headLink')],
    alignment: AlignmentType.CENTER,
  })
}

function getHyperLink(fragment) {
  return {
    headLink: {
      link: 'https://www.ebabylon.org/fragmentarium/' + fragment.number,
      text: 'https://www.ebabylon.org/fragmentarium/' + fragment.number,
      type: HyperlinkType.EXTERNAL,
    },
  }
}

function getHeadline(fragment) {
  return new Paragraph({
    children: [new TextRun({ text: fragment.number, size: 32, bold: true })],
    alignment: AlignmentType.CENTER,
  })
}

function getCreditForHead(records) {
  return new Paragraph({
    children: [
      new TextRun({ text: getCredit(records), size: 16 }).break(),
      new TextRun('').break(),
    ],
    alignment: AlignmentType.CENTER,
  })
}

function getCredit(records) {
  console.log(records)
  return (
    'Credit: Electronic Babylonian Literature Project, ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
  )
}

function getStyles() {
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

function getTextRun(el) {
  const italics = el.css('font-style') === 'italic' ? true : false
  const color = el.css('color') ? rgbHex(el.css('color')) : undefined
  const text = el.text()
  const superScript = el.is('sup') ? true : false
  const smallCaps = el.css('font-variant') === 'small-caps' ? true : false
  const size = el.css('font-variant') === 'small-caps' ? 16 : 24

  return new TextRun({
    text: text,
    color: color,
    italics: italics,
    superScript: superScript,
    smallCaps: smallCaps,
    size: size,
  })
}
