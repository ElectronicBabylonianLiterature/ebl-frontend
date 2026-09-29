import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'

import TransliterationLines from 'transliteration/ui/TransliterationLines'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import WordService from 'dictionary/application/WordService'

import { jsPDF } from 'jspdf'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'
import { addCustomFonts } from 'fragmentarium/ui/fragment/PdfExportFonts'
import { addPdfHeadLine } from 'fragmentarium/ui/fragment/PdfExportHeadline'
import { addMainTableWithFootnotes } from 'fragmentarium/ui/fragment/PdfExportTable'
import {
  addGlossary,
  getGlossaryHtml,
} from 'fragmentarium/ui/fragment/PdfExportGlossary'

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
