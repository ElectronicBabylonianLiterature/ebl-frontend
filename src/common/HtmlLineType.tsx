function isTextLine(element: JQuery): boolean {
  return element.children().first().hasClass('Transliteration__TextLine')
}

function isLineNumber(element: JQuery): boolean {
  return element.hasClass('chapter-display__line-number')
}

function isTranslationLine(element: JQuery): boolean {
  return element.hasClass('chapter-display__translation')
}

function isNoteLine(element: JQuery): boolean {
  return element.find('div').hasClass('chapter-display__note')
}

function isParallelsLine(element: JQuery): boolean {
  return element.find('div').hasClass('chapter-display__parallels')
}

function isRulingDollarLine(element: JQuery): boolean {
  return element.find('div').hasClass('Transliteration__ruling')
}

function isEmptyLine(element: JQuery): boolean {
  return element.text().length < 2
}

function isDollarAndAtLine(element: JQuery): boolean {
  return element.find('.Transliteration__DollarAndAtLine').length > 0
}

function isTransliterationLine(element: JQuery): boolean {
  return element.find('*[class^="Transliteration"]').length > 0
}

const allChecks: { type: string; check: (JQuery) => boolean }[] = [
  { check: isTextLine, type: 'textLine' },
  { check: isLineNumber, type: 'lineNumber' },
  { check: isTranslationLine, type: 'translationLine' },
  { check: isNoteLine, type: 'noteLine' },
  { check: isParallelsLine, type: 'parallelsLine' },
  { check: isRulingDollarLine, type: 'textLine' },
  { check: isTextLine, type: 'rulingDollarLine' },
  { check: isEmptyLine, type: 'emptyLine' },
  { check: isDollarAndAtLine, type: 'dollarAndAtLine' },
  { check: isTransliterationLine, type: 'transliterationLine' },
]

export function getLineTypeByHtml(element: JQuery): string {
  let lineType = 'otherLine'
  for (const typeCheck of allChecks) {
    const { check, type } = typeCheck
    if (check(element)) {
      lineType = type
      break
    }
  }
  return lineType
}
