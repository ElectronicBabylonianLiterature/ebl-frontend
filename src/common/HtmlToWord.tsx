import { Document, Paragraph, Table, TextRun, AlignmentType } from 'docx'
import { IPropertiesOptions } from 'docx/build/file/core-properties/properties.d'
import $ from 'jquery'
import { fixHtmlParseOrder } from 'common/HtmlParsing'
import {
  getStyles,
  getHeading,
  getTransliterationText,
  getTextRun,
} from 'common/HtmlToWordUtils'

export function generateWordDocument(
  footNotes: Paragraph[],
  docParts: Array<Paragraph | Table>,
  hyperlink: IPropertiesOptions['hyperlinks']
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

export function getCreditForHead(records: JQuery): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: getCredit(records), size: 16, break: 1 }),
      new TextRun({ break: 1 }),
    ],
    alignment: AlignmentType.CENTER,
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
): Paragraph[] {
  glossaryHtml.hide()
  jQueryRef.append(glossaryHtml)
  const glossaryContent = getGlossaryContent(glossaryHtml)
  glossaryHtml.remove()
  return [
    getHeading('Glossary'),
    new Paragraph({
      children: glossaryContent,
      style: 'wellSpaced',
    }),
  ]
}

function getGlossaryContent(glossaryHtml: JQuery<HTMLElement>): TextRun[] {
  const divs: JQuery = glossaryHtml.find('div')
  fixHtmlParseOrder(divs)
  const runs: TextRun[] = []
  divs.each((i, el) => {
    $(el)
      .contents()
      .each((i, el) => {
        dealWithGlossaryHTML($(el), runs)
      })
    runs.push(new TextRun({ break: 1 }))
  })
  return runs
}

function dealWithGlossaryHTML(el, runs: TextRun[]): void {
  if (el.is('a')) {
    runs.push(getTextRun(el.find('span')))
  } else if (el[0].nodeType === 3) {
    runs.push(new TextRun({ text: el.text(), size: 24 }))
  } else if (el.is('span.Transliteration')) {
    el.find('span,sup').each((i, transliterationElement) => {
      getTransliterationText($(transliterationElement), runs)
    })
  } else if (el.is('sup')) {
    runs.push(getTextRun(el))
  }
}

function getCredit(records: JQuery) {
  return (
    'Credit: electronic Babylonian Library Project; ' +
    records
      .find('.Record__entry')
      .map((i, el) => $(el).text() + ', ')
      .get()
      .join('')
      .slice(0, -2)
  )
}
