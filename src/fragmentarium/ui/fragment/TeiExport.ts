import { Fragment } from 'fragmentarium/domain/fragment'
import { AbstractLine } from 'transliteration/domain/abstract-line'
import { Word, Token } from 'transliteration/domain/token'
import { TextLine } from 'transliteration/domain/text-line'
import { isTextLine, isEmptyLine } from 'transliteration/domain/type-guards'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

export function teiExport(fragment: Fragment): string {
  const header = getHeader(fragment)
  const body = getBody(fragment)
  const end = getEnd(fragment)

  const finalOutput = header + body + end

  return prettifyXml(finalOutput)
}

function getHeader(fragment: Fragment): string {
  const result = ''
  const start =
    '<?xml version="1.0" encoding="UTF-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc>'
  const title_stmt =
    '<titleStmt><title>' + fragment.number + '</title></titleStmt>'
  const pub_stmt =
    '<publicationStmt><p>' +
    fragment.museum.name +
    '</p><p>' +
    fragment.collection +
    ' Collection</p></publicationStmt>'

  let source_desc = '<sourceDesc><p>' + fragment.description + '</p>'

  if (fragment.publication)
    source_desc += '<p>Publication: ' + fragment.publication + '</p>'

  const end = '</sourceDesc></fileDesc></teiHeader><text><body>'

  return result + start + title_stmt + pub_stmt + source_desc + end
}

function getEnd(fragment: Fragment): string {
  const notes =
    fragment.notes && fragment.notes.length > 0 && fragment.notes !== ' '
      ? '<note>' + fragment.notes + '</note>'
      : ''
  return notes + '</body></text></TEI>'
}

function getBody(fragment: Fragment): string {
  return '<lg>' + getParagraph(fragment) + '</lg>'
}

function getParagraph(fragment: Fragment): string {
  let result = ''

  const lines = fragment.text.allLines

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (isTextLine(line)) result += getTextLine(line, fragment)
    else if (!isEmptyLine(line))
      result += handleOtherLines(lines[i - 1], lines, line)
  }
  return result
}

function handleOtherLines(
  previous_line: AbstractLine,
  lines: readonly AbstractLine[],
  line: AbstractLine
) {
  if (line.prefix === '$') {
    return getDollarLine(line)
  } else if (line.prefix === '@') {
    return getAtLine(previous_line, lines, line)
  } else {
    return '<l>' + line.prefix + getLineContent(line) + '</l>'
  }
}

function getDollarLine(line: AbstractLine) {
  return '<note>' + line.prefix + getLineContent(line) + '</note>'
}

function getAtLine(
  previous_line: AbstractLine,
  lines: readonly AbstractLine[],
  line: AbstractLine
) {
  let result = previous_line && previous_line.prefix !== '@' ? '</lg><lg>' : ''
  result += '<note>' + getLineContent(line) + '</note>'
  return result
}

function getTextLine(line: TextLine, fragment: Fragment) {
  return (
    '<l n="' +
    fragment.number +
    '.' +
    lineNumberToString(line.lineNumber) +
    '">' +
    getLineContent(line) +
    '</l>'
  )
}

function getLineContent(line: AbstractLine): string {
  let result = ''
  for (let i = 0; i < line.content.length; i++) {
    const word = line.content[i]
    const escaped_word_value = escapeXmlChars(word.value)
    result += isTextLine(line)
      ? getWord(word, escaped_word_value)
      : escaped_word_value
  }
  return result
}

function getWord(word: Token, escaped_word_value: string): string {
  let result = ''

  if (word.lemmatizable && word.uniqueLemma.length > 0) {
    const lemmata = getLemata(word)
    result = '<w lemma="' + lemmata + '">' + escaped_word_value + '</w>'
  } else result = '<w>' + escaped_word_value + '</w>'

  return result
}

function getLemata(word: Word) {
  let lemmata = ''
  for (let i = 0; i < word.uniqueLemma.length; i++) {
    lemmata += word.uniqueLemma[i] + ' '
  }
  return lemmata.slice(0, -1)
}

function escapeXmlChars(wordvalue: string): string {
  return wordvalue.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '&':
        return '&amp;'
      case "'":
        return '&apos;'
      case '"':
        return '&quot;'
      default:
        return ''
    }
  })
}

function prettifyXml(xml: string): string {
  let formatted = '',
    indent = ''
  const tab = '\t'
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length)
    formatted += indent + '<' + node + '>\r\n'
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab
  })
  return formatted.substring(1, formatted.length - 3)
}
