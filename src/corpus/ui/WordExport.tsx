import React from 'react'
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
  HyperlinkType,
} from 'docx'

import {
  generateWordDocument,
  getFormatedTableCell,
  getTextRun,
  getLineTypeByHtml,
  getHyperLinkParagraph,
} from 'common/HtmlToWord'
import { fixHtmlParseOrder } from 'common/HtmlParsing'

import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import { MemoryRouter } from 'react-router-dom'
import RowsContext, { useRowsContext } from 'corpus/ui/RowsContext'
import TranslationContext, {
  useTranslationContext,
} from 'corpus/ui/TranslationContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { ChapterTitle } from 'corpus/ui/chapter-title'

export async function wordExport(
  chapter: ChapterDisplay,
  chapterContent: JSX.Element,
  wordService: WordService,
  jQueryRef: JQuery
): Promise<Document> {
  const tableHtml: JQuery = $(
    renderToString(WordExportContext(chapter, wordService, chapterContent))
  )

  const headlineHtml: JQuery = $(
    renderToString(
      WordExportContext(
        chapter,
        wordService,
        <ChapterTitle
          showStage={!chapter.isSingleStage}
          chapter={{
            ...chapter.id,
            title: chapter.title,
            uncertainFragments: [],
          }}
        />
      )
    )
  )

  const headline: Paragraph = HtmlToWordParagraph(headlineHtml)
  const headLink: Paragraph = getHyperLinkParagraph()
  const citation: Paragraph = getCitation(chapter)
  const table: Table = getMainTable(tableHtml, jQueryRef)
  console.log(table)
  const docParts: Array<Paragraph | Table> = [
    headline,
    citation,
    headLink,
    table,
  ]
  console.log(table, headLink)
  return generateWordDocument([], docParts, getHyperLink(chapter))
}

function WordExportContext(
  chapter: ChapterDisplay,
  wordService: WordService,
  children: JSX.Element
): JSX.Element {
  return (
    <MemoryRouter>
      <RowsContext.Provider
        value={useRowsContext(chapter.lines.length, true, true, true)}
      >
        <TranslationContext.Provider value={useTranslationContext()}>
          <DictionaryContext.Provider value={wordService}>
            {children}
          </DictionaryContext.Provider>
        </TranslationContext.Provider>
      </RowsContext.Provider>
    </MemoryRouter>
  )
}

function getCitation(chapter: ChapterDisplay): Paragraph {
  const runs = $(renderToString(chapter.parsedCitation))
    .children()
    .toArray()
    .map((el) => {
      return getTextRun($(el))
    })
  return new Paragraph({
    children: runs,
  })
}

function getMainTable(table: JQuery, jQueryRef: JQuery<HTMLElement>): Table {
  table.hide()
  jQueryRef.append(table)
  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)
  const rows: TableRow[] = []
  tablelines.each((i, el) => {
    const lineType = getLineTypeByHtml($(el))
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)
    if (lineType === 'emptyLine') return
    const tds: TableCell[] = []
    $(el)
      .find('td')
      .each((i, el) => {
        const para: Paragraph[] = []
        if (!['emptyLine', 'otherLine'].includes(lineType)) {
          para.push(HtmlToWordParagraph($(el)))
        }
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
  return new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

function getHyperLink(chapter: ChapterDisplay) {
  return {
    headLink: {
      link: chapter.url,
      text: chapter.url,
      type: HyperlinkType.EXTERNAL,
    },
  }
}

function HtmlToWordParagraph(element: JQuery): Paragraph {
  const runs: TextRun[] = []
  element.find('a,span,em,sup,i').each((i, el) => {
    if (
      $(el).contents().text().length > 0 &&
      $(el).contents()[0].nodeType === 3
    ) {
      runs.push(getTextRun($(el)))
    }
  })
  return new Paragraph({
    children: runs,
    style: 'wellSpaced',
    heading: HeadingLevel.HEADING_1,
  })
}
