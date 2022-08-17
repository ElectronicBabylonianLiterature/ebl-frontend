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

export function getLineTypeByHtml(element: JQuery): string {
  return isTextLine(element)
    ? 'textLine'
    : isLineNumber(element)
    ? 'lineNumber'
    : isTranslationLine(element)
    ? 'translationLine'
    : isNoteLine(element)
    ? 'noteLine'
    : isParallelsLine(element)
    ? 'parallelsLine'
    : isRulingDollarLine(element)
    ? 'rulingDollarLine'
    : isEmptyLine(element)
    ? 'emptyLine'
    : isDollarAndAtLine(element)
    ? 'dollarAndAtLine'
    : isTransliterationLine(element)
    ? 'transliterationLine'
    : 'otherLine'
}
