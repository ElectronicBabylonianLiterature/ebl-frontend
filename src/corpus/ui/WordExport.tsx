import React from 'react'
import Promise from 'bluebird'
import { ChapterDisplay } from 'corpus/domain/chapter'
import WordService from 'dictionary/application/WordService'
import TextService from 'corpus/application/TextService'
import {
  Document,
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
  HtmlToWordParagraph,
} from 'common/HtmlToWord'
import { getHeading, getHyperLinkParagraph } from 'common/HtmlToWordUtils'

import { fixHtmlParseOrder } from 'common/HtmlParsing'
import { getLineTypeByHtml } from 'common/HtmlLineType'

import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import { MemoryRouter } from 'react-router-dom'
import RowsContext, { RowsContextService } from 'corpus/ui/RowsContext'
import TranslationContext, {
  TranslationContextService,
} from 'corpus/ui/TranslationContext'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import { ChapterViewTable } from 'corpus/ui/ChapterView'
import { HowToCite } from 'corpus/ui/HowToCite'
import { defaultName } from 'transliteration/domain/chapter-id'
import Markup from 'transliteration/ui/markup'

type contextServices = {
  wordService: WordService
  textService: TextService
  rowsContext: RowsContextService
  translationContext: TranslationContextService
}

export async function wordExport(
  chapter: ChapterDisplay,
  context: contextServices,
  jQueryRef: JQuery,
): Promise<Document> {
  const tableHtml: JQuery = $(
    renderToString(
      WordExportContext(
        context,
        <ChapterViewTable
          chapter={chapter}
          activeLine={''}
          textService={context.textService}
        />,
      ),
    ),
  )

  const headline: Paragraph[] = getChapterHeadlines(chapter)
  const headLink: Paragraph = getHyperLinkParagraph()
  const citation: Paragraph[] = getCitation(chapter)
  const edition: Array<Paragraph | Table> = getEdition(tableHtml, jQueryRef)
  const docParts: Array<Paragraph | Table> = [
    ...headline,
    ...citation,
    headLink,
    ...edition,
  ]
  return generateWordDocument([], docParts, getHyperLink(chapter))
}

function WordExportContext(
  context: contextServices,
  children: JSX.Element,
): JSX.Element {
  return (
    <MemoryRouter>
      <DictionaryContext.Provider value={context.wordService}>
        <RowsContext.Provider value={context.rowsContext}>
          <TranslationContext.Provider value={context.translationContext}>
            {children}
          </TranslationContext.Provider>
        </RowsContext.Provider>
      </DictionaryContext.Provider>
    </MemoryRouter>
  )
}

function getChapterHeadlines(chapter: ChapterDisplay): Paragraph[] {
  const { stage, name, title } = getHeadingData(chapter)
  const hasStageOrName = stage + name ? true : false
  return [
    ...(hasStageOrName
      ? [getHeading([stage, name].filter((str) => str).join(' '), true, true)]
      : []),
    !hasStageOrName ? getHeading(title, true) : getHeading(title, false, true),
  ]
}

function getHeadingData(chapter: ChapterDisplay): {
  stage: string
  name: string
  title: string
} {
  return {
    stage: !chapter.isSingleStage ? chapter.id.stage : '',
    name: chapter.textName !== defaultName ? chapter.textName : '',
    title: `Chapter ${$(
      renderToString(<Markup container="span" parts={chapter.title} />),
    ).text()}`,
  }
}

function getCitation(chapter: ChapterDisplay): Paragraph[] {
  const paragraphs: Paragraph[] = []
  const runs: TextRun[] = []

  getCitationNodes(chapter).each((i, el) => {
    const nodeName = $(el).prop('nodeName')
    if (!nodeName) {
      runs.push(new TextRun({ text: $(el).text(), size: 24 }))
    } else if (nodeName === 'I') {
      runs.push(new TextRun({ text: $(el).text(), size: 24, italics: true }))
    } else if (nodeName === 'A') {
      paragraphs.push(
        new Paragraph({
          children: runs,
        }),
      )
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: $(el).text(), size: 24 })],
        }),
      )
    }
  })
  return paragraphs
}

function getCitationNodes(
  chapter: ChapterDisplay,
): JQuery<HTMLSpanElement | Text | Comment | globalThis.Document> {
  const content = $(renderToString(<HowToCite chapter={chapter} />))
    .children()
    .toArray()[1]
  return $(content).find('span').first().contents()
}

function getEdition(
  table: JQuery,
  jQueryRef: JQuery<HTMLElement>,
): Array<Paragraph | Table> {
  table.hide()
  jQueryRef.append(table)
  const tableLines: JQuery = table.find('tr')
  fixHtmlParseOrder(tableLines)
  const rows = getTableRows(tableLines)
  const edition =
    rows.length === 0
      ? []
      : [
          getHeading('Edition'),
          new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ]
  table.remove()
  return edition
}

function getTableRows(tableLines: JQuery<HTMLElement>): TableRow[] {
  const rows: TableRow[] = []
  tableLines.each((i, el) => {
    rows.push(new TableRow({ children: getTableCells(el) }))
  })
  return rows
}

function getTableCells(el: HTMLElement): TableCell[] {
  const tds: TableCell[] = []
  const lineType = getLineTypeByHtml($(el))
  const nextElement = $(el).next()
  const nextLineType = getLineTypeByHtml(nextElement)
  $(el)
    .find('td')
    .each((i, el) => {
      let para: Paragraph[] = []
      if (lineType === 'parallelsLine') {
        para = [...para, ...getParallelLine($(el))]
      } else if (!['emptyLine', 'otherLine'].includes(lineType)) {
        para.push(HtmlToWordParagraph($(el)))
      }
      const colspan: string | undefined = $(el).is('[colspan]')
        ? $(el).attr('colspan')
        : '1'
      const colspanInt: number = colspan ? parseInt(colspan) : 1
      tds.push(
        getFormatedTableCell(para, nextLineType, nextElement, colspanInt),
      )
    })
  return tds
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

function getParallelLine(element: JQuery): Paragraph[] {
  const paragraphs: Paragraph[] = []
  $(element)
    .find('li')
    .each((i, li) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: $(li).text(), size: 24 })],
          style: 'wellSpaced',
        }),
      )
    })
  return paragraphs
}
