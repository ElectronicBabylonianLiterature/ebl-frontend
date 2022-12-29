import React from 'react'
import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import Record from 'fragmentarium/ui/info/Record'
import {
  Document,
  HeadingLevel,
  Paragraph,
  TextRun,
  TableCell,
  TableRow,
  Table,
  WidthType,
  HyperlinkType,
  FootnoteReferenceRun,
} from 'docx'
import {
  generateWordDocument,
  getHeadline,
  getCreditForHead,
  getTransliterationText,
  getFormatedTableCell,
  getTextRun,
  getFootNotes,
  getGlossary,
  getHyperLinkParagraph,
  isNoteCell,
} from 'common/HtmlToWord'
import { getLineTypeByHtml } from 'common/HtmlLineType'
import { fixHtmlParseOrder } from 'common/HtmlParsing'
import { ReactElement } from 'react'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import { Glossary } from 'transliteration/ui/Glossary'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import { MemoryRouter } from 'react-router-dom'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'

export async function wordExport(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery
): Promise<Document> {
  const tableHtml: JQuery = $(
    renderToString(
      <MemoryRouter>
        <DictionaryContext.Provider value={wordService}>
          <TransliterationLines text={fragment.text} />
        </DictionaryContext.Provider>
      </MemoryRouter>
    )
  )
  const notesHtml: JQuery = $(
    renderToString(
      <DictionaryContext.Provider value={wordService}>
        <TransliterationNotes notes={fragment.text.notes} />
      </DictionaryContext.Provider>
    )
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
  const tableWithFootnotes: any = getMainTableWithFootnotes(
    tableHtml,
    footNotes,
    jQueryRef
  )

  const headline: Paragraph = getHeadline(fragment.number)

  // ToDo:
  // - Add fragment introduction to WordExport
  // - Fix extra line numbers (IM.74403)
  // - Fix missing ruling issue (IM.74403)
  //
  const docParts = getDocParts(
    tableWithFootnotes.table,
    records,
    headline,
    glossary
  )

  const doc: Document = generateWordDocument(
    tableWithFootnotes.footNotes,
    docParts,
    getHyperLink(fragment)
  )

  return doc
}

function wrapWithMemoryRouter(component: JSX.Element): ReactElement {
  return <MemoryRouter>{component}</MemoryRouter>
}

function getMainTableWithFootnotes(
  table: JQuery,
  footNotesLines: Paragraph[],
  jQueryRef: any
): any {
  table.hide()

  jQueryRef.append(table)

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

function getDocParts(
  table: Paragraph,
  records: JQuery,
  headline: Paragraph,
  glossary: Paragraph | false
): any[] {
  const headLink: Paragraph = getHyperLinkParagraph()
  const credit: Paragraph = getCreditForHead(records)
  const docParts = [headline, headLink, credit]
  if (table) docParts.push(table)
  if (glossary) docParts.push(glossary)

  return docParts
}

function getHyperLink(fragment: Fragment) {
  return {
    headLink: {
      link: 'https://www.ebl.lmu.de/fragmentarium/' + fragment.number,
      text: 'https://www.ebl.lmu.de/fragmentarium/' + fragment.number,
      type: HyperlinkType.EXTERNAL,
    },
  }
}
