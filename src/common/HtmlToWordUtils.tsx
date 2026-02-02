import {
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  HyperlinkRef,
  IStylesOptions,
  HeadingLevel,
} from 'docx'

const STYLES = [
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
]

export function getStyles(): IStylesOptions {
  return {
    paragraphStyles: STYLES,
  }
}

export function getBottomStyle(
  nextLineType: string,
  nextElement: JQuery,
): {
  readonly style: BorderStyle
  readonly size: number
  readonly color: string
} {
  return nextLineType === 'rulingDollarLine'
    ? {
        style: getUnderLineType(nextElement),
        size: 1,
        color: '000000',
      }
    : {
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
  subtitle = false,
): Paragraph {
  return new Paragraph({
    style: getHeadingStyle(main, subtitle),
    children: [new TextRun({ text: text })],
    alignment: getHeadingAlignment(main, subtitle),
    spacing: getHeadingSpacing(main, subtitle),
    heading: getHeadingLevel(main, subtitle),
  })
}

function getHeadingStyle(main: boolean, subtitle: boolean): string {
  return main ? 'title' : subtitle ? 'subtitle' : 'heading1'
}
function getHeadingAlignment(main: boolean, subtitle: boolean): AlignmentType {
  return main || subtitle ? AlignmentType.CENTER : AlignmentType.LEFT
}

function getHeadingSpacing(
  main: boolean,
  subtitle: boolean,
): { readonly before: number; readonly after: number } {
  const before = main || subtitle ? 0 : 150
  const after = main ? 100 : 200
  return { before: before, after: after }
}

function getHeadingLevel(main: boolean, subtitle: boolean): HeadingLevel {
  return main
    ? HeadingLevel.TITLE
    : subtitle
      ? HeadingLevel.HEADING_1
      : HeadingLevel.HEADING_2
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
