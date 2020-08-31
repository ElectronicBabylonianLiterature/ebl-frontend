export function teiExport(fragment) {
  var res = ''
  const header = getHeader(fragment)
  const body = getBody(fragment)
  const end = getEnd()

  res += header
  res += body
  res += end

  console.log(fragment)

  return prettifyXml(res)
}

function getHeader(fragment) {
  var res = ''
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

  var source_desc = '<sourceDesc><p>' + fragment.description + '</p>'

  if (fragment.publication)
    source_desc += '<p>Publication: ' + fragment.publication + '</p>'
  // if (fragment.references.length>0)  source_desc += getBibiliography(fragment);

  const end = '</sourceDesc></fileDesc></teiHeader><text><body>'

  return res + start + title_stmt + pub_stmt + source_desc + end
}

// function getBibiliography(fragment){
// var res = '<biblFull>'

// Object.values(fragment.references).forEach(val => {
//  res+=addSingleReference(val);
// })

// res+= '</biblFull>'
// return res
// }

// function addSingleReference(ref){
// var res = '<titleStmt>';
// res += '<title>'+ ref.document.cslData.title + '</title>';

// var short_author = ref.document.cslData['container-title-short']
// var author = ref.document.cslData.author

// if(author || short_author) {
//   res += '<author>'
//     if(short_author)res += short_author
//     else res += author[0].given + " "+author[0].family
//   res += '</author>'
// }

// res += '</titleStmt>'
// return res
// }

function getEnd() {
  return '</body></text></TEI>'
}

function getBody(fragment) {
  return fragment.text.allLines.filter(isNotEmpty()).map(getParagraph).join('')
}

function isNotEmpty() {
  return (line) => line.type !== 'EmptyLine'
}

function getParagraph(line) {
  var res = ''

  if (line.type === 'TextLine') {
    res += '<p n="' + line.lineNumber.number + '">'
    // res += line.prefix  // line numbers needed in text?
    res += getLineContent(line)
    res += '</p>'
  } else {
    res += '<p>'
    res += line.prefix
    res += getLineContent(line)
    res += '</p>'
  }

  return res
}

function getLineContent(line) {
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
