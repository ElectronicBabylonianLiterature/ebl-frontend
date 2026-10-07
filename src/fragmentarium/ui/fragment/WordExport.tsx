import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import recordCredit from 'fragmentarium/ui/info/recordCredit'
import { CANONICAL_ORIGIN } from 'router/domain'
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
  getCreditForHead,
  getFootNotes,
  getGlossary,
  getTransliterationText,
  getFormatedTableCell,
  getTextRun,
  HtmlToWordParagraph,
} from 'common/utils/HtmlToWord'
import {
  getHeading,
  getHyperLinkParagraph,
  isNoteCell,
} from 'common/utils/HtmlToWordUtils'
import { getLineTypeByHtml } from 'common/utils/HtmlLineType'
import { fixHtmlParseOrder } from 'common/utils/HtmlParsing'
import TransliterationLines from 'transliteration/ui/TransliterationLines'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import { Glossary } from 'transliteration/ui/Glossary'
import { renderToString } from 'react-dom/server'
import $ from 'jquery'
import WordService from 'dictionary/application/WordService'
import GlossaryFactory from 'transliteration/application/GlossaryFactory'
import { DictionaryContext } from 'dictionary/ui/dictionary-context'
import Markup from 'transliteration/ui/markup'
import { createParagraphs } from 'markup/ui/markup'
import RouterLinkModeContext from 'common/ui/RouterLinkModeContext'

export async function wordExport(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery,
): Promise<Document> {
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
  const footNotes: Paragraph[] = getFootNotes(notesHtml, jQueryRef)
  const tableWithFootnotes = getMainTableWithFootnotes(
    tableHtml,
    footNotes,
    jQueryRef,
  )
  return generateWordDocument(
    tableWithFootnotes.footNotes,
    [
      getHeading(fragment.number, true),
      getHyperLinkParagraph(),
      getCreditForHead(recordCredit(fragment.uniqueRecord)),
      ...getIntroduction(fragment),
      ...tableWithFootnotes.table,
      ...(await getGlossaryOrEmpty(fragment, wordService, jQueryRef)),
    ],
    getHyperLink(fragment),
  )
}

function transliterationRuns(cell: JQuery): TextRun[] {
  const runs: TextRun[] = []
  cell.find('span,em,sup').each((i, element) => {
    const contents = $(element).contents()
    if (contents.text().length > 0 && contents[0].nodeType === 3) {
      getTransliterationText($(element), runs)
    }
  })
  return runs
}

function cellRuns(
  cell: JQuery,
  lineType: string,
  footNotesLines: Paragraph[],
  footNotes: Paragraph[],
): TextRun[] {
  if (isNoteCell(cell)) {
    footNotes.push(footNotesLines[footNotes.length])
    return [new FootnoteReferenceRun(footNotes.length)]
  }
  if (lineType === 'textLine') {
    return transliterationRuns(cell)
  }
  return lineType === 'rulingDollarLine' ? [] : [getTextRun(cell)]
}

function cellColspan(cell: JQuery): number {
  const colspan = cell.attr('colspan')
  return colspan ? parseInt(colspan) : 1
}

function tableCell(
  cell: JQuery,
  runs: TextRun[],
  nextLineType: string,
  nextElement: JQuery,
): TableCell {
  const paragraph = new Paragraph({
    children: runs,
    style: 'wellSpaced',
    heading: HeadingLevel.HEADING_1,
  })
  return getFormatedTableCell(
    [paragraph],
    nextLineType,
    nextElement,
    cellColspan(cell),
  )
}

function getMainTableWithFootnotes(
  table: JQuery,
  footNotesLines: Paragraph[],
  jQueryRef: JQuery,
): { table: Array<Table | Paragraph>; footNotes: Paragraph[] } {
  table.hide()

  jQueryRef.append(table)

  const tablelines: JQuery = table.find('tr')
  fixHtmlParseOrder(tablelines)

  const rows: TableRow[] = []
  const footNotes: Paragraph[] = []

  tablelines.each((i, el) => {
    const lineType = getLineTypeByHtml($(el))
    if (lineType === 'emptyLine') return
    const nextElement = $(el).next()
    const nextLineType = getLineTypeByHtml(nextElement)
    const cells: TableCell[] = []
    $(el)
      .find('td')
      .each((i, cell) => {
        const runs = cellRuns($(cell), lineType, footNotesLines, footNotes)
        cells.push(tableCell($(cell), runs, nextLineType, nextElement))
      })
    rows.push(new TableRow({ children: cells }))
  })

  table.remove()
  const wordTable: Array<Table | Paragraph> =
    rows.length > 0
      ? [
          getHeading('Edition'),
          new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ]
      : []
  return { table: wordTable, footNotes: footNotes }
}

function getHyperLink(fragment: Fragment) {
  return {
    headLink: {
      link: `${CANONICAL_ORIGIN}/library/${fragment.number}`,
      text: `${CANONICAL_ORIGIN}/library/${fragment.number}`,
      type: HyperlinkType.EXTERNAL,
    },
  }
}

function getIntroduction(fragment: Fragment): Paragraph[] {
  const paragraphs = createParagraphs(fragment.introduction.parts).map(
    (paragraphParts, index) => {
      return HtmlToWordParagraph(
        $(
          renderToString(
            <Markup parts={paragraphParts} key={index} container={'p'} />,
          ),
        ),
      )
    },
  )
  return [getHeading('Introduction'), ...paragraphs]
}

async function getGlossaryOrEmpty(
  fragment: Fragment,
  wordService: WordService,
  jQueryRef: JQuery,
): Promise<Paragraph[]> {
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
  return glossaryHtml.children().length > 1
    ? getGlossary(glossaryHtml, jQueryRef)
    : []
}
