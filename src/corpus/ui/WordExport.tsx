import React from 'react'
//import * as ReactDOMServer from 'react-dom/server'
import { ChapterDisplay } from 'corpus/domain/chapter'
import WordService from 'dictionary/application/WordService'
import {
  Document,
  HeadingLevel,
  Paragraph,
  TextRun,
  TableCell,
  TableRow,
  Table,
  WidthType,
  //HyperlinkRef,
  //HyperlinkType,
} from 'docx'

import {
  generateWordDocument,
  getHeadline,
  //getCreditForHead,
  getTransliterationText,
  getFormatedTableCell,
  getTextRun,
  getLineTypeByHtml,
  //getFootNotes,
  //getGlossary,
  //getHyperLinkParagraph,
  fixHtmlParseOrder,
  //isNoteCell,
} from 'common/HtmlToWord'

//import { ReactElement } from 'react'
//import { Transliteration } from 'transliteration/ui/Transliteration'
//import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
//import { Glossary } from 'transliteration/ui/Glossary'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
//import GlossaryFactory from 'transliteration/application/GlossaryFactory'
//import { MemoryRouter } from 'react-router-dom'
//import ChapterView from 'corpus/ui/ChapterView'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

export async function wordExport(
  chapter: ChapterDisplay,
  chapterContent: JSX.Element,
  wordService: WordService,
  rowsContext: ReturnType<typeof useRowsContext>,
  translationContext: ReturnType<typeof useTranslationContext>,
  jQueryRef: JQuery
): Promise<Document> {
  const tableHtml: JQuery = await waitForLoading(
    <RowsContext.Provider value={rowsContext}>
      <TranslationContext.Provider value={translationContext}>
        <DictionaryContext.Provider value={wordService}>
          {chapterContent}
        </DictionaryContext.Provider>
      </TranslationContext.Provider>
    </RowsContext.Provider>
  )
  /*
  const notesHtml: JQuery = $(
    renderToString(
      <DictionaryContext.Provider value={wordService}>
        <TransliterationNotes notes={chapter.lines.notes} />
      </DictionaryContext.Provider>
    )
  )
  
  const records: JQuery = $(
    renderToString(Record({ record: chapter.uniqueRecord }))
  )

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
        </DictionaryContext.Provider>
      )
    )
  )

  const glossary: Paragraph | false =
    glossaryHtml.children().length > 1
      ? getGlossary(glossaryHtml, jQueryRef)
      : false
  const footNotes: Paragraph[] = getFootNotes(notesHtml, jQueryRef)
  */
  const tableWithFootnotes: {
    table: Table
    footNotes: Paragraph[]
  } = getMainTableWithFootnotes(
    tableHtml,
    //footNotes,
    jQueryRef
  )

  const headline: Paragraph = getHeadline(chapter.fullName)

  const docParts = getDocParts(
    tableWithFootnotes.table,
    //records,
    headline
    //glossary
  )

  const doc: Document = generateWordDocument(
    [], //tableWithFootnotes.footNotes,
    docParts,
    '' //TODO: hyperlink
  )

  return doc
}

async function waitForLoading(tableJsx: JSX.Element): Promise<JQuery> {
  //ReactDOMServer.renderToReadableStream(tableJsx).then((response) => {
  //  return response.text()
  //})

  while ($(renderToString(tableJsx))[0].innerText.includes(' Loading...')) {
    await new Promise((resolve) => {
      setTimeout(resolve, 2000)
    })
    console.log(
      '!',
      ($(renderToString(tableJsx))[0].innerText.match(/Loading/g) || []).length
    )
    if (!$(renderToString(tableJsx))[0].innerText.includes(' Loading...')) {
      break
    }
  }
  return $(renderToString(tableJsx))
}

function getDocParts(
  table: Table,
  //records: JQuery,
  headline: Paragraph
  //glossary: Paragraph | false
): Array<Paragraph | Table> {
  //const headLink: Paragraph = getHyperLinkParagraph()
  //const credit: Paragraph = getCreditForHead(records)
  //const docParts = [headline, headLink, credit]
  const docParts: Array<Paragraph | Table> = [headline]
  if (table) docParts.push(table)
  //if (glossary) docParts.push(glossary)

  return docParts
}

function getMainTableWithFootnotes(
  table: JQuery,
  //footNotesLines: Paragraph[],
  jQueryRef: JQuery<HTMLElement>
): { table: Table; footNotes: Paragraph[] } {
  table.hide()

  jQueryRef.append(table)

  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)

  //let footNotesCounter = 1

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
              if (
                $(el).contents().text().length > 0 &&
                $(el).contents()[0].nodeType === 3
              ) {
                getTransliterationText($(el), runs)
              }
            })
        } else if (lineType !== 'rulingDollarLine') {
          runs.push(getTextRun($(el)))
        }

        /*
        if (isNoteCell($(el))) {
          runs.push(new FootnoteReferenceRun(footNotesCounter))
          footNotes.push(footNotesLines[footNotesCounter - 1])
          footNotesCounter++
        }
        */
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
  const wordTable: Table =
    rows.length > 0
      ? new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      : new Table({ rows: [] })
  return { table: wordTable, footNotes: footNotes }
}

/*
function getHyperLink(fragment: Fragment) {
  return {
    headLink: {
      link: 'https://www.ebl.lmu.de/fragmentarium/' + fragment.number,
      text: 'https://www.ebl.lmu.de/fragmentarium/' + fragment.number,
      type: HyperlinkType.EXTERNAL,
    },
  }
}
*/
