import { AbstractLine } from 'transliteration/domain/abstract-line'
import { isTextLine, notIsEmptyLine } from 'transliteration/domain/type-guards'

export function teiExport(fragment): string {
  function getHeader(): string {
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

  function getEnd(): string {
    let notes = ''
    if (fragment.notes) notes = '<note>' + fragment.notes + '</note>'
    return notes + '</body></text></TEI>'
  }

  function getBody(): string {
    return (
      '<lg>' +
      fragment.text.allLines
        .filter(notIsEmptyLine)
        .map(getParagraph, { fragment: fragment })
        .join('') +
      '</lg>'
    )
  }

  function getParagraph(
    line,
    index: number,
    array: Array<AbstractLine>
  ): string {
    let result = ''

    if (line.type === 'TextLine') {
      //isTextLine not working atm
      result +=
        '<l n="' +
        fragment.number +
        '.' +
        line.lineNumber.number +
        '">' +
        getLineContent(line) +
        '</l>'
    } else if (line.prefix === '$') {
      result += '<note>' + line.prefix + getLineContent(line) + '</note>'
    } else if (line.prefix === '@') {
      if (array[index - 1] && array[index - 1].prefix !== '@')
        result += '</lg><lg>'
      result += '<note>' + getLineContent(line) + '</note>'
    } else {
      result += '<l>' + line.prefix + getLineContent(line) + '</l>'
    }

    return result
  }

  function getLineContent(line: AbstractLine): string {
    let result = ''
    for (let i = 0; i < line.content.length; i++) {
      const word = line.content[i]
      const escaped_word_value = escapeXmlChars(word.value)
      if (line.type === 'TextLine') result += getWord(word, escaped_word_value)
      else result += escaped_word_value
      if (i < line.content.length - 1) result += ' '
    }
    return result
  }

  function getWord(word: any, escaped_word_value: string): string {
    let result = ''
    if (word.lemmatizable && word.uniqueLemma.length > 0) {
      let lemmata = ''
      for (let i = 0; i < word.uniqueLemma.length; i++) {
        lemmata += word.uniqueLemma[i]
        if (i < word.uniqueLemma.length - 1) lemmata += ' '
      }
      result = '<w lemma="' + lemmata + '">' + escaped_word_value + '</w>'
    } else result = '<w>' + escaped_word_value + '</w>'

    return result
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

  function prettifyXml(xml): string {
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

  let final_output = ''
  const header = getHeader()
  const body = getBody()
  const end = getEnd()

  final_output += header
  final_output += body
  final_output += end

  return prettifyXml(final_output)
}
