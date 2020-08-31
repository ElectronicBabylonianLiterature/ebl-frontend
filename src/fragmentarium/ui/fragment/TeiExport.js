export function teiExport(fragment) {
  var res = ''
  const header = getHeader(
    fragment.number,
    fragment.collection,
    fragment.museum.name,
    fragment.description,
    fragment.publication
  )
  const body = getBody(fragment)
  const end = getEnd()

  res += header
  res += body
  res += end

  return prettifyXml(res)
}

function getHeader(title, collection, museum, sourcedesc, publication) {
  var res = ''
  const start =
    '<?xml version="1.0" encoding="UTF-8"?><TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc>'
  const title_stmt = '<titleStmt><title>' + title + '</title></titleStmt>'
  const pub_stmt =
    '<publicationStmt><p>' +
    museum +
    '</p><p>' +
    collection +
    ' Collection</p></publicationStmt>'
  var source_desc = '<sourceDesc><p>' + sourcedesc + '</p>'
  if (publication) source_desc += '<p>Publication: ' + publication + '</p>'
  const end = '</sourceDesc></fileDesc></teiHeader><text><body>'

  return res + start + title_stmt + pub_stmt + source_desc + end
}

function getEnd() {
  return '</body></text></TEI>'
}

function getBody(fragment) {
  return fragment.text.allLines.filter(isNotEmpty).map(getParagraph).join('')
}

function isNotEmpty() {
  return (line) => line.type !== 'EmptyLine'
}

function getParagraph(line) {
  var res = ''

  if (line.type === 'TextLine') {
    res += '<p n="' + line.lineNumber.number + '">'
    res += getContent(line)
    res += '</p>'
  } else {
    res += '<p>'
    res += getContent(line)
    res += '</p>'
  }

  return res
}

function getContent(line) {
  var res = ''
  for (var j = 0; j < line.content.length; j++) {
    var word = escapeXMLChars(line.content[j].value)
    res += word
    if (j !== line.content.length - 1) res += ' '
  }
  return res
}

function escapeXMLChars(word) {
  return word.replace(/[<>&'"]/g, function (c) {
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

function prettifyXml(xml) {
  var formatted = '',
    indent = ''
  const tab = '\t'
  xml.split(/>\s*</).forEach(function (node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length)
    formatted += indent + '<' + node + '>\r\n'
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab
  })
  return formatted.substring(1, formatted.length - 3)
}
