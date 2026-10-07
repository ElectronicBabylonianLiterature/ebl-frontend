import React from 'react'
import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { renderToString } from 'react-dom/server'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import { Glossary } from 'transliteration/ui/Glossary'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import {
  PdfNode,
  addText,
  getLineHeight,
  getTextHeight,
  setDocStyle,
  startsWithText,
  writeTransliteration,
  writeWrappedBlocks,
} from 'fragmentarium/ui/fragment/PdfExport.layout'

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

  writeWrappedBlocks(divs, paddingForGlossary, yPos, doc, dealWithGlossaryHtml)

  glossaryHtml.remove()
}

function dealWithGlossaryHtml(
  el: PdfNode,
  doc: jsPDF,
  xPos: number,
  yPos: number,
) {
  let wordLength = 0
  const text = $(el).text()

  if ($(el).is('a')) {
    setDocStyle($(el), doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el)[0].nodeType === Node.TEXT_NODE) {
    setDocStyle($(el).parent(), doc)
    wordLength = addText(text, xPos, yPos, doc)
  } else if ($(el).is('span.Transliteration')) {
    let subWordLength = xPos
    $(el)
      .find('span,sup')
      .each((i, el) => {
        if (startsWithText($(el))) {
          subWordLength += writeTransliteration(el, doc, subWordLength, yPos)
        }
      })
    wordLength = subWordLength - xPos
  } else if ($(el).is('sup')) {
    setDocStyle($(el), doc)
    wordLength = addText(text, xPos, yPos - getTextHeight(doc, text) / 2, doc)
  }

  return wordLength
}
