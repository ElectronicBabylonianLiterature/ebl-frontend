import {
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  HyperlinkRef,
  IStylesOptions,
  HeadingLevel,
} from 'docx'

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
