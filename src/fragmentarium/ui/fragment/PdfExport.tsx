import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Record from 'fragmentarium/ui/info/Record'

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
import getJunicodeRegular from './pdf-fonts/Junicode'
import getJunicodeBold from './pdf-fonts/JunicodeBold'
import getJunicodeItalic from './pdf-fonts/JunicodeItalic'

import { jsPDF } from 'jspdf'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { fixHtmlParseOrder } from 'common/HtmlParsing'
import { getLineTypeByHtml } from 'common/HtmlLineType'

export async function pdfExport(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery,
): Promise<jsPDF> {
  const tableHtml: JQuery = $(
    renderToString(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <TransliterationLines text={fragment.text} />
        </DictionaryContext.Provider>
      </MemoryRouter>,
    ),
  )
  const notesHtml: JQuery = $(
    renderToString(
      <DictionaryContext.Provider value={wordService}>
        <TransliterationNotes notes={fragment.text.notes} />
      </DictionaryContext.Provider>,
    ),
  )

  const pdf = getPdfDoc(tableHtml, notesHtml, jQueryRef, wordService, fragment)

  jQueryRef.hide()

  return pdf
}

async function getPdfDoc(
  tableHtml: JQuery,
  notesHtml: JQuery,
  jQueryRef: JQuery,
  wordService: WordService,
  fragment: Fragment,
): Promise<jsPDF> {
  const doc = new jsPDF()

  addCustomFonts(doc)

  const initialPos = 15

  tableHtml.show()
  jQueryRef.show()

  let posAfterHeadline = addPdfHeadLine(doc, fragment, initialPos)
  posAfterHeadline += 10

  const posAfterTable = addMainTableWithFootnotes(
    tableHtml,
    notesHtml,
    jQueryRef,
    posAfterHeadline,
    doc,
  )

  const glossaryHtml = await getGlossaryHtml(wordService, fragment)

  if (glossaryHtml.find('div').length > 0)
    addGlossary(glossaryHtml, jQueryRef, posAfterTable, doc)

  return doc
}

function addCustomFonts(doc: jsPDF) {
  doc.addFileToVFS('Junicode.ttf', getJunicodeRegular())
  doc.addFont('Junicode.ttf', 'Junicode', 'normal')

  doc.addFileToVFS('JunicodeBold.ttf', getJunicodeBold())
  doc.addFont('JunicodeBold.ttf', 'JunicodeBold', 'normal')

  doc.addFileToVFS('JunicodeItalic.ttf', getJunicodeItalic())
  doc.addFont('JunicodeItalic.ttf', 'JunicodeItalic', 'normal')
}

async function getGlossaryHtml(
  wordService: WordService,
  fragment: Fragment,
): Promise<JQuery> {
  const glossaryFactory: GlossaryFactory = new GlossaryFactory(wordService)
  const glossaryJsx: JSX.Element = await glossaryFactory
    .createGlossary(fragment.text)
    .then((glossaryData) => {
      return Glossary({ data: glossaryData })
    })

  const glossaryHtml: JQuery = $(
    renderToString(
      wrapWithMemoryRouter(
        <DictionaryContext.Provider value={wordService}>
          {glossaryJsx}
        </DictionaryContext.Provider>,
      ),
    ),
  )

  return glossaryHtml
}

function addPdfHeadLine(doc: jsPDF, fragment: Fragment, yPos: number): number {
  const headlineParts = getPdfHeadline(fragment)
  const outerPaddingForCredits = 20

  doc.setFont('JunicodeBold', 'normal')
  doc.setFontSize(16)
  doc.text(headlineParts[0], centerText(doc, headlineParts[0]), yPos)

  doc.setFont('Junicode', 'normal')
  doc.setFontSize(11)
  doc.setTextColor('#007bff')

  yPos += 5.5
  doc.text(headlineParts[2], centerText(doc, headlineParts[2]), yPos)

  doc.setTextColor('black')
  doc.setFontSize(8)
  yPos += 5.5

  const currentLineHeight = getLineHeight(doc)
  const creditsSplit = doc.splitTextToSize(
    headlineParts[1],
    doc.internal.pageSize.width - outerPaddingForCredits,
  )

  for (const key in creditsSplit) {
    doc.text(creditsSplit[key], centerText(doc, creditsSplit[key]), yPos)
    yPos += currentLineHeight
    if (checkIfNewPage(yPos, doc)) {
      doc.addPage()
    }
  }

  return yPos
}

function getLineHeight(doc: jsPDF): number {
  return doc.getFontSize() / 2
}

function centerText(doc: jsPDF, text: string): number {
  const textWidth = getTextWidth(doc, text)
  const textOffset = (doc.internal.pageSize.width - textWidth) / 2
  return textOffset
}

function getTextWidth(doc, text: string): number {
  return text
    ? (doc.getStringUnitWidth(text) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor
    : 0
}

function getTextHeight(doc: jsPDF, text: string): number {
  return doc.getTextDimensions(text).h
}

function getPdfHeadline(fragment: Fragment): [string, string, string] {
  const records: JQuery = $(
    renderToString(Record({ record: fragment.uniqueRecord })),
  )
  const credit = getCredit(records)
  const link = getHyperLink(fragment)

  return [fragment.number, credit, link]
}

function wrapWithMemoryRouter(component: JSX.Element): ReactElement {
  return <MemoryRouter>{component}</MemoryRouter>
}

function addMainTableWithFootnotes(
  table: JQuery,
  notes: JQuery,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
): number {
  // table.hide()

  jQueryRef.append(table)

  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)

  doc.setFontSize(10)

  const outerPaddingForTable = 17
  const firstColumnMinWidth = getFirstColumnSize(tablelines, doc)
  const firstColumnSize = outerPaddingForTable + firstColumnMinWidth

  let maxRowOffset = 0
  const linePositions = {}
  let maxXPos = 0
  const columnSizes = getColumnSizes(
    table,
    jQueryRef,
    outerPaddingForTable,
    firstColumnMinWidth,
    doc,
  )

  let xPos = 0

  tablelines.each((i, el) => {
    const lineType = getLineTypeByHtml($(el))
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)

    if (lineType === 'emptyLine') return

    if (xPos > maxRowOffset) {
      maxRowOffset = xPos
    }

    const originalYPos = {
      coords: yPos,
      page: doc.getCurrentPageInfo().pageNumber,
    }
    const maxYPos = {
      coords: yPos,
      page: doc.getCurrentPageInfo().pageNumber,
    }
    let newPageStarted = false
    let lastElement = false

    $(el)
      .find('td')
      .each((i, el) => {
        const columnDefs = columnSizes[i]
        xPos = columnDefs['startpos']
        const tdIdx = i

        if ($(el).next().length === 0 || $(el).next().next().length === 0)
          lastElement = true

        const colspan: string | undefined = $(el).is('[colspan]')
          ? $(el).attr('colspan')
          : '1'
        const colspanInt: number = colspan ? parseInt(colspan) : 1

        setDocStyle($(el), doc)

        if (lineType === 'textLine') {
          $(el)
            .find('span,em,sup')
            .each((i, el) => {
              if (
                $(el).contents().text().length > 0 &&
                $(el).contents()[0].nodeType === 3
              ) {
                if (i === 0 && $(el).text() === ' ') return

                const test =
                  xPos + getTransliterationText(el, doc, xPos, yPos, false)

                const cellEndpos = getCellEndpos(
                  columnSizes,
                  tdIdx,
                  columnDefs['endpos'],
                  colspanInt,
                )

                if (test >= cellEndpos && !columnDefs['firstElement']) {
                  yPos = moveOneRowDown(yPos, doc)

                  if (!newPageStarted) {
                    if (checkIfNewPage(yPos, doc)) {
                      newPageStarted = true
                      doc.addPage()
                      yPos = 15
                      maxYPos.coords = 15
                      maxYPos.page = doc.getCurrentPageInfo().pageNumber
                    }
                  }

                  xPos = columnDefs['startpos']
                  if (yPos > maxYPos.coords && !newPageStarted)
                    maxYPos.coords = yPos
                }
                xPos += getTransliterationText(el, doc, xPos, yPos, true)
                if (xPos > maxXPos) maxXPos = xPos
              }
            })
        } //textLine
        else if (lineType === 'rulingDollarLine') {
          const num = $(el)
            .parent()
            .find('.Transliteration__RulingDollarLine')
            .children('div').length
          linePositions[yPos] = {}
          linePositions[yPos]['page'] = doc.getCurrentPageInfo().pageNumber
          linePositions[yPos]['num'] = num
        } else if (lineType !== 'rulingDollarLine') {
          doc.text($(el).text(), xPos, yPos)
        }

        if (isNoteCell($(el))) {
          const noteNumber = $(el).text()
          doc.setFontSize(7)
          doc.text(
            noteNumber,
            doc.internal.pageSize.width - outerPaddingForTable,
            originalYPos.coords - getTextHeight(doc, noteNumber) / 2,
          )
          doc.setFontSize(10)
        }

        if (!lastElement) {
          yPos = originalYPos.coords
          if (doc.getCurrentPageInfo().pageNumber !== originalYPos.page)
            doc.setPage(originalYPos.page)
        } else {
          yPos = maxYPos.coords
          if (newPageStarted) doc.setPage(maxYPos.page)
        }
      }) //td

    if (nextLineType === 'rulingDollarLine') {
      yPos += getLineHeight(doc) / 2
    } else {
      yPos = moveOneRowDown(yPos, doc)

      if (checkIfNewPage(yPos, doc)) {
        doc.addPage()
        yPos = 15
      }
    }
  }) //tr

  table.remove()

  const savedPage = doc.getCurrentPageInfo().pageNumber
  addLines(linePositions, maxXPos, firstColumnSize, doc)
  doc.setPage(savedPage)

  yPos = addFootnotes(notes, outerPaddingForTable, jQueryRef, yPos, doc)

  return yPos
}

function addLines(
  linePositions: Record<string, { num: number; page: number }>,
  maxXPos: number,
  endposFirstColumn: number,
  doc: jsPDF,
) {
  for (const yPos in linePositions) {
    addUnderLine(
      Number(yPos),
      maxXPos,
      linePositions[yPos].num,
      linePositions[yPos].page,
      endposFirstColumn,
      doc,
    )
  }
}

function getFirstColumnSize(tablelines: JQuery, doc: jsPDF): number {
  let maxCharsInFirstTd = 0
  let longestFirstTd
  tablelines.each((i, el) => {
    const text = $(el).find('td').first().text()
    if (text.length > maxCharsInFirstTd) {
      maxCharsInFirstTd = text.length
      longestFirstTd = text
    }
  })

  return Math.ceil(getTextWidth(doc, longestFirstTd)) + 0.5
}

function getCellEndpos(
  columnSizes: Record<number, { endpos: number }>,
  tdIdx: number,
  endpos: number,
  colspanInt: number,
) {
  if (colspanInt > 1) {
    return columnSizes[tdIdx + colspanInt - 1]['endpos']
  } else {
    return endpos
  }
}

function moveOneRowDown(yPos: number, doc: jsPDF) {
  yPos += getLineHeight(doc) + 0.6
  return yPos
}

function getColumnSizes(
  table: JQuery,
  jQueryRef: JQuery,
  outerPaddingForTable: number,
  firstColumnMinWidth: number,
  doc: jsPDF,
): Record<number, { startpos: number; endpos: number; maxColWidth: number }> {
  const columnSizes = {}

  setJQueryRefTo1000Px(jQueryRef)

  let maxChild = 0
  let firstRowWithMaxChildren

  table.find('tr').each((i, el) => {
    if ($(el).children('td').length > maxChild) {
      maxChild = $(el).children('td').length
      firstRowWithMaxChildren = el
    }
  })

  let startpos = outerPaddingForTable

  $(firstRowWithMaxChildren)
    .find('td')
    .each((i, el) => {
      const outerWidth = $(el).outerWidth()
      const tableWidth = table.find('tbody').outerWidth()
      let percentage = 1
      if (outerWidth && tableWidth) percentage = outerWidth / tableWidth
      let docWidth = doc.internal.pageSize.width - outerPaddingForTable * 2

      if (i === 0) {
        docWidth = firstColumnMinWidth
        percentage = 1
      }

      columnSizes[i] = {}
      columnSizes[i]['startpos'] = startpos
      columnSizes[i]['width'] = docWidth * percentage
      columnSizes[i]['endpos'] = startpos + docWidth * percentage

      columnSizes[i]['firstElement'] = i === 0 ? true : false
      startpos += docWidth * percentage
    })

  unSetJQueryRef1000Px(jQueryRef)

  return columnSizes
}

function setJQueryRefTo1000Px(jQueryRef: JQuery) {
  jQueryRef.css('position', 'absolute')
  jQueryRef.css('width', '1000px')
}

function unSetJQueryRef1000Px(jQueryRef: JQuery) {
  jQueryRef.css('position', '')
  jQueryRef.css('width', '')
}

function checkIfNewPage(yPos: number, doc: jsPDF): boolean {
  if (yPos >= doc.internal.pageSize.height - 10) {
    return true
  } else return false
}

function addFootnotes(
  notes: JQuery,
  padding: number,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
) {
  notes.hide()
  jQueryRef.append(notes)

  fixHtmlParseOrder(notes)

  const lis: JQuery = notes.find('li')

  lis.each((i, el) => {
    let linePos = padding

    $(el)
      .contents()
      .each((i, el) => {
        if (linePos > doc.internal.pageSize.width - padding) {
          linePos = padding
          yPos += 5.6
          if (checkIfNewPage(yPos, doc)) {
            doc.addPage()
            yPos = 15
          }
        }
        linePos += dealWithFootNotesHtml(el, doc, linePos, yPos)
      })
    yPos += 5.6
    if (checkIfNewPage(yPos, doc)) {
      doc.addPage()
      yPos = 15
    }
  })

  notes.remove()

  return yPos
}

function addGlossary(
  glossaryHtml: JQuery,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
): void {
  glossaryHtml.hide()
  jQueryRef.append(glossaryHtml)

  const paddingForGlossary = 17

  yPos += 3

  const divs: JQuery = glossaryHtml.find('div')
  fixHtmlParseOrder(divs)

  const headline: string = glossaryHtml.find('h4').text()

  doc.setFont('JunicodeBold', 'normal')
  doc.setFontSize(14)

  doc.text(headline, paddingForGlossary, yPos)

  doc.setFont('Junicode', 'normal')
  doc.setFontSize(10)

  yPos += getLineHeight(doc) + 0.5

  divs.each((i, el) => {
    let linePos = paddingForGlossary

    $(el)
      .contents()
      .each((i, el) => {
        if (linePos > doc.internal.pageSize.width - paddingForGlossary) {
          linePos = paddingForGlossary
          yPos += 5.6
          if (checkIfNewPage(yPos, doc)) {
            doc.addPage()
            yPos = 15
          }
        }
        linePos += dealWithGlossaryHtml(el, doc, linePos, yPos)
      })
    yPos += 5.6
    if (checkIfNewPage(yPos, doc)) {
      doc.addPage()
      yPos = 15
    }
  })

  glossaryHtml.remove()
}

function addText(text: string, xPos: number, yPos: number, doc: jsPDF) {
  doc.text(text, xPos, yPos)
  return getTextWidth(doc, text)
}

function dealWithFootNotesHtml(
  el: HTMLElement | Text | Comment | Document,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let wordLength = 0
  const text = $(el).text()

  if ($(el).is('a')) {
    setDocStyle($(el) as JQuery<HTMLElement>, doc)
    wordLength = addText(text + ' ', xPos, yPos, doc)
  } else if ($(el).is('span.Transliteration__NoteLine')) {
    let subWordLength = xPos
    $(el)
      .find('span,em,sup')
      .each((i, el) => {
        if ($(el).is('span.Transliteration__Word')) {
          if (
            $(el).contents().text().length > 0 &&
            $(el).contents()[0].nodeType === 3
          ) {
            subWordLength += getTransliterationText(
              el,
              doc,
              subWordLength,
              yPos,
              true,
            )
          }
        } else {
          if (
            $(el).contents().text().length > 0 &&
            $(el).contents()[0].nodeType === 3
          ) {
            if ($(el).text() !== ' ') {
              setDocStyle($(el) as JQuery<HTMLElement>, doc)
              subWordLength += addText($(el).text(), subWordLength, yPos, doc)
            }
          }
        }
      })
    wordLength = subWordLength - xPos
  }
  // else if ($(el)[0].nodeType === 3){
  //   setDocStyle($(el).parent(),doc)
  //  wordLength = addText(text,xPos,yPos,doc)
  // }
  else if ($(el).is('sup')) {
    setDocStyle($(el) as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
  }

  return wordLength
}

function dealWithGlossaryHtml(
  el: HTMLElement | Text | Comment | Document,
  doc: jsPDF,
  xPos: number,
  yPos: number,
) {
  let wordLength = 0
  const text = $(el).text()

  if ($(el).is('a')) {
    setDocStyle($(el) as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el)[0].nodeType === 3) {
    setDocStyle($(el).parent() as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el).is('span.Transliteration')) {
    let subWordLength = xPos
    $(el)
      .find('span,sup')
      .each((i, el) => {
        if (
          $(el).contents().text().length > 0 &&
          $(el).contents()[0].nodeType === 3
        ) {
          subWordLength += getTransliterationText(
            el,
            doc,
            subWordLength,
            yPos,
            true,
          )
        }
      })
    wordLength = subWordLength - xPos
  } else if ($(el).is('sup')) {
    setDocStyle($(el) as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
  }

  return wordLength
}

function getTransliterationText(
  el: HTMLElement | Text | Comment | Document,
  doc: jsPDF,
  xPos: number,
  yPos: number,
  add: boolean,
): number {
  setDocStyle($(el) as JQuery<HTMLElement>, doc)

  const superScript: boolean = $(el).is('sup') ? true : false

  let wordLength = 0

  if (
    ($(el).children().length === 0 &&
      $(el).text().trim().length &&
      $(el).parent().css('display') !== 'none') ||
    $(el).hasClass('Transliteration__wordSeparator')
  ) {
    const text = $(el).text()
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const width = getTextWidth(doc, char)
      if (superScript) {
        if (add)
          doc.text(char, xPos + wordLength, yPos - getTextHeight(doc, char) / 2)
      } else {
        if (add) doc.text(char, xPos + wordLength, yPos)
      }
      wordLength += width + 0.2
    }
  }

  return wordLength
}

function addUnderLine(
  yPos: number,
  endpos: number,
  num: number,
  page: number,
  endposFirstColumn: number,
  doc: jsPDF,
) {
  doc.setPage(page)

  const smallLineStep = 1

  if (num === 3) {
    doc.line(endposFirstColumn, yPos, endpos, yPos)
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep,
      endpos,
      yPos + smallLineStep,
    )
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep * 2,
      endpos,
      yPos + smallLineStep * 2,
    )
  } else if (num === 2) {
    doc.line(endposFirstColumn, yPos, endpos, yPos)
    doc.line(
      endposFirstColumn,
      yPos + smallLineStep,
      endpos,
      yPos + smallLineStep,
    )
  } else doc.line(endposFirstColumn, yPos, endpos, yPos)

  return yPos
}

function isNoteCell(element: JQuery): boolean {
  return element.find('.Transliteration__NoteLink').length > 0 ? true : false
}

function getHyperLink(fragment: Fragment): string {
  return 'https://www.ebl.lmu.de/library/' + fragment.number
}

function getCredit(records: JQuery): string {
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

function setDocStyle(el: JQuery, doc: jsPDF) {
  const superScript = el.is('sup')
  const allSmall = el.css('font-variant') === 'all-small-caps'

  if (el.css('font-style') === 'italic' || el.is('em'))
    doc.setFont('JunicodeItalic', 'normal')
  else doc.setFont('Junicode', 'normal')

  if (allSmall) doc.setFontSize(7)
  if (superScript) doc.setFontSize(7)
  if (!superScript && !allSmall) doc.setFontSize(10)

  doc.setTextColor(el.css('color') ? '#' + rgbHex(el.css('color')) : '#ffffff')
}
