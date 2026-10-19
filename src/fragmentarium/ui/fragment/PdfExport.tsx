import React from 'react'
import $ from 'jquery'
import { jsPDF } from 'jspdf'
import { renderToString } from 'react-dom/server'
import { Fragment } from 'fragmentarium/domain/fragment'
import WordService from 'dictionary/application/WordService'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import getJunicodeRegular from 'fragmentarium/ui/fragment/pdf-fonts/Junicode'
import getJunicodeBold from 'fragmentarium/ui/fragment/pdf-fonts/JunicodeBold'
import getJunicodeItalic from 'fragmentarium/ui/fragment/pdf-fonts/JunicodeItalic'
import { addPdfHeadLine } from 'fragmentarium/ui/fragment/PdfExport.headline'
import { addMainTableWithFootnotes } from 'fragmentarium/ui/fragment/PdfExport.table'
import {
  addGlossary,
  getGlossaryHtml,
} from 'fragmentarium/ui/fragment/PdfExport.glossary'

export async function pdfExport(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery,
): Promise<jsPDF> {
  const tableHtml: JQuery = $(
    renderToString(
      <RouterLinkModeContext.Provider value={false}>
        <DictionaryContext.Provider value={wordService}>
          <TransliterationLines text={fragment.text} />
        </DictionaryContext.Provider>
      </RouterLinkModeContext.Provider>,
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

export function addCustomFonts(doc: jsPDF) {
  doc.addFileToVFS('Junicode.ttf', getJunicodeRegular())
  doc.addFont('Junicode.ttf', 'Junicode', 'normal')

  doc.addFileToVFS('JunicodeBold.ttf', getJunicodeBold())
  doc.addFont('JunicodeBold.ttf', 'JunicodeBold', 'normal')

  doc.addFileToVFS('JunicodeItalic.ttf', getJunicodeItalic())
  doc.addFont('JunicodeItalic.ttf', 'JunicodeItalic', 'normal')
}
