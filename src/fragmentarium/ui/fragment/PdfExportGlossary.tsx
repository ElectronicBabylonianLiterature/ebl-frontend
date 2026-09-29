import React from 'react'
import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { renderToString } from 'react-dom/server'
import WordService from 'dictionary/application/WordService'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import { Glossary } from 'transliteration/ui/Glossary'
import { Fragment } from 'fragmentarium/domain/fragment'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  addSuperscriptText,
  addText,
  getLineHeight,
  getTransliterationText,
  hasLeadingTextNode,
  PdfHtmlNode,
  setDocStyle,
} from 'fragmentarium/ui/fragment/PdfExportText'
import { addWrappedParagraphs } from 'fragmentarium/ui/fragment/PdfExportParagraphs'

export async function getGlossaryHtml(
  wordService: WordService,
  fragment: Fragment,
): Promise<JQuery> {
  const glossaryFactory: GlossaryFactory = new GlossaryFactory(wordService)
  const glossaryJsx: JSX.Element = await glossaryFactory
    .createGlossary(fragment.text)
    .then((glossaryData) => {
      return Glossary({ data: glossaryData, useRouterLinks: false })
    })

  const glossaryHtml: JQuery = $(
    renderToString(
      <RouterLinkModeContext.Provider value={false}>
        <DictionaryContext.Provider value={wordService}>
          {glossaryJsx}
        </DictionaryContext.Provider>
      </RouterLinkModeContext.Provider>,
    ),
  )

  return glossaryHtml
}

export function addGlossary(
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

  addWrappedParagraphs(
    divs,
    paddingForGlossary,
    yPos,
    doc,
    dealWithGlossaryHtml,
  )

  glossaryHtml.remove()
}

function addGlossaryTransliteration(
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let subWordLength = xPos
  $(el)
    .find('span,sup')
    .each((i, el) => {
      if (hasLeadingTextNode(el)) {
        subWordLength += getTransliterationText(
          el,
          doc,
          subWordLength,
          yPos,
          true,
        )
      }
    })
  return subWordLength - xPos
}

function dealWithGlossaryHtml(
  el: PdfHtmlNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
): number {
  let wordLength = 0
  const text = $(el).text()

  if ($(el).is('a')) {
    setDocStyle($(el) as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el)[0].nodeType === 3) {
    setDocStyle($(el).parent() as JQuery<HTMLElement>, doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el).is('span.Transliteration')) {
    wordLength = addGlossaryTransliteration(el, doc, xPos, yPos)
  } else if ($(el).is('sup')) {
    wordLength = addSuperscriptText(el, doc, xPos, yPos)
  }

  return wordLength
}
