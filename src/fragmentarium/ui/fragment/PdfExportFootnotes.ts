import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  addSuperscriptText,
  addText,
  getTransliterationText,
  hasLeadingTextNode,
  PdfHtmlNode,
  setDocStyle,
} from 'fragmentarium/ui/fragment/PdfExportText'
import { addWrappedParagraphs } from 'fragmentarium/ui/fragment/PdfExportParagraphs'

export function addFootnotes(
  notes: JQuery,
  padding: number,
  jQueryRef: JQuery,
  yPos: number,
  doc: jsPDF,
): number {
  notes.hide()
  jQueryRef.append(notes)

  fixHtmlParseOrder(notes)

  const lis: JQuery = notes.find('li')

  yPos = addWrappedParagraphs(lis, padding, yPos, doc, dealWithFootNotesHtml)

  notes.remove()

  return yPos
}

function addNoteLineText(
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let subWordLength = xPos
  $(el)
    .find('span,em,sup')
    .each((i, el) => {
      if ($(el).is('span.Transliteration__Word')) {
        if (hasLeadingTextNode(el)) {
          subWordLength += getTransliterationText(
            el,
            doc,
            subWordLength,
            yPos,
            true,
          )
        }
      } else {
        if (hasLeadingTextNode(el)) {
          if ($(el).text() !== ' ') {
            setDocStyle($(el) as JQuery<HTMLElement>, doc)
            subWordLength += addText($(el).text(), subWordLength, yPos, doc)
          }
        }
      }
    })
  return subWordLength - xPos
}

function dealWithFootNotesHtml(
  el: PdfHtmlNode,
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
    wordLength = addNoteLineText(el, doc, xPos, yPos)
  } else if ($(el).is('sup')) {
    wordLength = addSuperscriptText(el, doc, xPos, yPos)
  }

  return wordLength
}
