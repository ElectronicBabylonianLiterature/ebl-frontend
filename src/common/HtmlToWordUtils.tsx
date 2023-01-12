import {
  Paragraph,
  TextRun,
  TableCell,
  BorderStyle,
  AlignmentType,
  HyperlinkRef,
  IStylesOptions,
  HeadingLevel,
} from 'docx'

import rgbHex from 'rgb-hex'

export function getStyles(): IStylesOptions {
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
      {
        id: 'title',
        name: 'Title',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: 56,
          bold: true,
          color: '212529',
        },
      },
      {
        id: 'subtitle',
        name: 'Subtitle',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: 32,
          bold: true,
          color: '212529',
        },
      },
      {
        id: 'heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        quickFormat: true,
        run: {
          size: 32,
          bold: true,
          color: '212529',
        },
      },
    ],
  }
}

export function getBottomStyle(
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

export function getUnderLineType(element: JQuery): BorderStyle {
  const num: number = element.find('div').length
  if (num === 3) return BorderStyle.TRIPLE
  else if (num === 2) return BorderStyle.DOUBLE
  else return BorderStyle.SINGLE
}

export function getHeading(
  text: string,
  main = false,
  subtitle = false
): Paragraph {
  return new Paragraph({
    style: main ? 'title' : subtitle ? 'subtitle' : 'heading1',
    children: [new TextRun({ text: text })],
    alignment: main || subtitle ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing:
      main && subtitle
        ? { before: 0, after: 100 }
        : main
        ? { before: 0, after: 200 }
        : subtitle
        ? { before: 0, after: 200 }
        : { before: 150, after: 200 },
    heading: main
      ? HeadingLevel.TITLE
      : subtitle
      ? HeadingLevel.HEADING_1
      : HeadingLevel.HEADING_2,
  })
}

export function getHyperLinkParagraph(): Paragraph {
  return new Paragraph({
    children: [new HyperlinkRef('headLink')],
    alignment: AlignmentType.CENTER,
    spacing: { before: 150, after: 200 },
  })
}

export function isNoteCell(element: JQuery): boolean {
  return element.find('.Transliteration__NoteLink').length > 0
}

export function HtmlToWordRuns(element: JQuery): TextRun[] {
  let runs: TextRun[] = []
  element.children('span,em,sup,a,i').each((i, el) => {
    const elJquery = $(el)
    const contents = [...elJquery.contents()]
    if (elJquery.prop('nodeName') === 'A') {
      runs.push(new TextRun({ text: elJquery.text(), size: 24 }))
    } else if (
      contents.length > 1 &&
      contents.map((child) => child.nodeType).includes(1)
    ) {
      runs = [
        ...runs,
        ...HtmlToWordRuns($(`<p>${repackNodeText(contents).join()}</p>`)),
      ]
    } else if (
      elJquery.contents().text().length > 0 &&
      elJquery.contents()[0].nodeType === 3 &&
      elJquery.parents('a').length === 0
    ) {
      getTransliterationText(elJquery, runs)
    }
  })
  return runs
}

export function HtmlToWordParagraph(element: JQuery): Paragraph {
  return new Paragraph({
    children: HtmlToWordRuns(element),
    style: 'wellSpaced',
  })
}

export function getTransliterationText(el: JQuery, runs: TextRun[]): void {
  if (
    (el.children().length === 0 &&
      el.text().trim().length &&
      el.parent().css('display') !== 'none' &&
      el.parent().parent().css('display') !== 'none') ||
    el.hasClass('Transliteration__wordSeparator')
  ) {
    runs.push(getTextRun($(el)))
  }
}

export function getTextRun(el: JQuery): TextRun {
  const italics: boolean = el.css('font-style') === 'italic' || el.is('em')
  const color: string | undefined = el.css('color')
    ? rgbHex(el.css('color'))
    : undefined
  const text: string = el.text()
  const superScript: boolean = el.is('sup')
  const smallCaps: boolean = el.css('font-variant') === 'all-small-caps'
  const size: number = el.css('font-variant') === 'all-small-caps' ? 16 : 24
  const characterSpacing: number | undefined = !['0', ''].includes(
    el.css('letter-spacing')
  )
    ? 40
    : undefined
  return new TextRun({
    text: text,
    color: color,
    italics: italics,
    superScript: superScript,
    smallCaps: smallCaps,
    size: size,
    characterSpacing: characterSpacing,
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

function repackNodeText(
  contents: (HTMLElement | Text | Comment | globalThis.Document)[]
): (HTMLElement | Text | Comment | globalThis.Document)[] {
  return contents.map((child) =>
    child.nodeType === 3
      ? `<span>${$(child).text()}</span>`
      : !$(child).hasClass('type-abbreviation')
      ? $(child).prop('outerHTML')
      : ''
  )
}
