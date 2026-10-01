import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  PdfNode,
  addText,
  getTextHeight,
  getTransliterationText,
  setDocStyle,
  writeWrappedBlocks,
} from 'fragmentarium/ui/fragment/PdfExport.layout'

export function addFootnotes(
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

  yPos = writeWrappedBlocks(lis, padding, yPos, doc, dealWithFootNotesHtml)

  notes.remove()

  return yPos
}

function dealWithFootNotesHtml(
  el: PdfNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let wordLength = 0
  const text = $(el).text()

  if ($(el).is('a')) {
    setDocStyle($(el), doc)
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
              setDocStyle($(el), doc)
              subWordLength += addText($(el).text(), subWordLength, yPos, doc)
            }
          }
        }
      })
    wordLength = subWordLength - xPos
  } else if ($(el).is('sup')) {
    setDocStyle($(el), doc)
    wordLength = addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
  }

  return wordLength
}
