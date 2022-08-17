import {
  Document,
  HeadingLevel,
  Paragraph,
  Table,
  TextRun,
  TableCell,
  BorderStyle,
  AlignmentType,
  HyperlinkRef,
  IStylesOptions,
} from 'docx'
import rgbHex from 'rgb-hex'
import $ from 'jquery'
import { fixHtmlParseOrder } from 'common/HtmlParsing'

export function generateWordDocument(
  footNotes: Paragraph[],
  docParts: Array<Paragraph | Table>,
  hyperlink: any
): Document {
  const doc: Document = new Document({
    styles: getStyles(),
    footnotes: footNotes,
    hyperlinks: hyperlink,
  })

  doc.addSection({
    children: docParts,
  })

  return doc
}

export function getTransliterationText(el: JQuery, runs: TextRun[]): void {
  if (
    (el.children().length === 0 &&
      el.text().trim().length &&
      el.parent().css('display') !== 'none') ||
    el.hasClass('Transliteration__wordSeparator')
  ) {
    runs.push(getTextRun($(el)))
  }
}

export function getLineTypeByHtml(element: JQuery): string {
  return element.children().first().hasClass('Transliteration__TextLine')
    ? 'textLine'
    : element.hasClass('chapter-display__line-number')
    ? 'lineNumber'
    : element.hasClass('chapter-display__translation')
    ? 'translationLine'
    : element.find('div').hasClass('chapter-display__note')
    ? 'noteLine'
    : element.find('div').hasClass('chapter-display__parallels')
    ? 'parallelsLine'
    : element.find('div').hasClass('Transliteration__ruling')
    ? 'rulingDollarLine'
    : element.text().length < 2
    ? 'emptyLine'
    : element.find('.Transliteration__DollarAndAtLine').length > 0
    ? 'dollarAndAtLine'
    : element.find('*[class^="Transliteration"]').length > 0
    ? 'transliterationLine'
    : 'otherLine'
}

export function getTextRun(el: JQuery<HTMLElement>): TextRun {
  const italics: boolean = el.css('font-style') === 'italic' ? true : false
  const color: string | undefined = el.css('color')
    ? rgbHex(el.css('color'))
    : undefined
  const text: string = el.text()
  const superScript: boolean = el.is('sup') ? true : false
  const smallCaps: boolean =
    el.css('font-variant') === 'all-small-caps' ? true : false
  const size: number = el.css('font-variant') === 'all-small-caps' ? 16 : 24

  return new TextRun({
    text: text,
    color: color,
    italics: italics,
    superScript: superScript,
    smallCaps: smallCaps,
    size: size,
  })
}

export function getHeadline(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text, size: 32, bold: true })],
    alignment: AlignmentType.CENTER,
  })
}

export function getCreditForHead(records: JQuery): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: getCredit(records), size: 16, break: 1 }),
      new TextRun({ break: 1 }),
    ],
    alignment: AlignmentType.CENTER,
  })
}

export function getFormatedTableCell(
  para: Paragraph[],
  nextLineType: string,
  nextElement: JQuery,
  colspan: number
): TableCell {
  return new TableCell({
    children: para,
    columnSpan: colspan,
    borders: {
      top: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
      bottom: getBottomStyle(nextLineType, nextElement),
      left: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
      right: {
        style: BorderStyle.NONE,
        size: 0,
        color: '000000',
      },
    },
  })
}

export function getFootNotes(
  footNotesHtml: JQuery<HTMLElement>,
  jQueryRef: JQuery<HTMLElement>
): Paragraph[] {
  footNotesHtml.hide()
  jQueryRef.append(footNotesHtml)
  fixHtmlParseOrder(footNotesHtml)
  const footNotes: Paragraph[] = []
  footNotesHtml.find('li').each((i, el) => {
    const runs: TextRun[] = []
    $(el)
      .find('span,em,sup')
      .each((i, el) => {
        getTransliterationText($(el), runs)
      })
    footNotes.push(new Paragraph({ children: runs }))
  })
  footNotesHtml.remove()
  return footNotes
}

export function getGlossary(
  glossaryHtml: JQuery<HTMLElement>,
  jQueryRef: JQuery<HTMLElement>
): Paragraph {
  glossaryHtml.hide()
  jQueryRef.append(glossaryHtml)
  const runs: TextRun[] = []
  const divs: JQuery = glossaryHtml.find('div')
  fixHtmlParseOrder(divs)
  const headline: JQuery = glossaryHtml.find('h4')
  runs.push(
    new TextRun({
      text: headline.text(),
      size: parseInt(headline.css('font-size'), 10) * 2,
      break: 1,
    })
  )

  runs.push(new TextRun({ break: 1 }))
  divs.each((i, el) => {
    $(el)
      .contents()
      .each((i, el) => {
        dealWithGlossaryHTML(el, runs)
      })
    runs.push(new TextRun({ break: 1 }))
  })
  glossaryHtml.remove()
  return new Paragraph({
    children: runs,
    style: 'wellSpaced',
    heading: HeadingLevel.HEADING_1,
  })
}

function dealWithGlossaryHTML(el: any, runs: TextRun[]) {
  if ($(el).is('a')) runs.push(getTextRun($(el).find('span')))
  else if ($(el)[0].nodeType === 3)
    runs.push(new TextRun({ text: $(el).text(), size: 24 }))
  else if ($(el).is('span.Transliteration')) {
    $(el)
      .find('span,sup')
      .each((i, el) => {
        getTransliterationText($(el), runs)
      })
  } else if ($(el).is('sup')) runs.push(getTextRun($(el)))
}

export function getHyperLinkParagraph(): Paragraph {
  return new Paragraph({
    children: [new HyperlinkRef('headLink')],
    alignment: AlignmentType.CENTER,
  })
}

export function isNoteCell(element: JQuery): boolean {
  return element.find('.Transliteration__NoteLink').length > 0 ? true : false
}

function getStyles(): IStylesOptions {
  return {
    paragraphStyles: [
      {
        id: 'wellSpaced',
        name: 'Well Spaced',
        basedOn: 'Normal',
        quickFormat: true,
        paragraph: {
          spacing: { line: 350 },
        },
      },
    ],
  }
}

function getBottomStyle(
  nextLineType: string,
  nextElement: JQuery
): {
  readonly style: BorderStyle
  readonly size: number
  readonly color: string
} {
  if (nextLineType === 'rulingDollarLine') {
    const borderType: BorderStyle = getUnderLineType(nextElement)

    return {
      style: borderType,
      size: 1,
      color: '000000',
    }
  } else
    return {
      style: BorderStyle.NONE,
      size: 0,
      color: '000000',
    }
}

function getUnderLineType(element: JQuery): BorderStyle {
  const num: number = element.find('div').length
  if (num === 3) return BorderStyle.TRIPLE
  else if (num === 2) return BorderStyle.DOUBLE
  else return BorderStyle.SINGLE
}

function getCredit(records: JQuery) {
  return (
    'Credit: Electronic Babylonian Literature Project; ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
      .slice(0, -2)
  )
}
