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

  console.log(fragment)

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
  const source_desc = '<sourceDesc><p>' + sourcedesc + '</p>'
  if (publication) sourcedesc += '<p>' + publication + '</p>'
  const end = '</sourceDesc></fileDesc></teiHeader><text><body>'

  return res + start + title_stmt + pub_stmt + source_desc + end
}

function getEnd() {
  return '</body></text></TEI>'
}

function getBody(fragment) {
  var res = ''
  for (var i = 0; i < fragment.text.allLines.length; i++) {
    var line = fragment.text.allLines[i]

    if (!line.displayValue) {
      if (line.type === 'TextLine') {
        res += '<p n="' + line.lineNumber.number + '">'
        res += getContent(line)
        res += '</p>'
      } else {
        //emptyLine => do nothing
      }
    } else {
      res += '<p>'
      res += getContent(line)
      res += '</p>'
    }
  }

  return res
}

// function getBody(fragment){

// var res = '';
// for(var i=0; i<fragment.text.allLines.length;i++){
// 	var line = fragment.text.allLines[i];

// 	switch(line.type) {
// 		case 'TextLine':
// 			res += '<p n="'+line.lineNumber.number+'">';
// 			res += getContent(line);
// 		break;

// 		case 'NoteLine':
// 			res += '<p>';
// 			res += getContent(line);
// 		break;

// 		case 'SurfaceAtLine':
// 			res+='<p>';
// 			res+=line.displayValue;
// 		break;

// 		case 'RulingDollarLine':
// 			res+= '<p>';
// 			res+=line.displayValue;
// 		break;

// 		case 'SealDollarLine':
// 			res+= '<p>';
// 			res+=line.displayValue;
// 		break;

// 		case 'ColumnAtLine':
// 			res+= '<p>';
// 			res+=line.displayValue;
// 		break;

// 		case 'EmptyLine':
// 			res+=" ";
// 		break;

// 	default:
// 	   res+= '<p>';
// 	}

//  if(line.type!== 'EmptyLine')res+='</p>';
// }

// return res;

// }

function getContent(line) {
  var res = ''
  for (var j = 0; j < line.content.length; j++) {
    var word = line.content[j].value
    res += word
    if (j !== line.content.length - 1) res += ' '
  }
  return res
}

function prettifyXml(sourceXml) {
  var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml')
  var xsltDoc = new DOMParser().parseFromString(
    [
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">',
      '    <xsl:value-of select="normalize-space(.)"/>',
      '  </xsl:template>',
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      '  </xsl:template>',
      '  <xsl:output indent="yes"/>',
      '</xsl:stylesheet>',
    ].join('\n'),
    'application/xml'
  )

  var xsltProcessor = new XSLTProcessor()
  xsltProcessor.importStylesheet(xsltDoc)
  var resultDoc = xsltProcessor.transformToDocument(xmlDoc)
  var resultXml = new XMLSerializer().serializeToString(resultDoc)
  return resultXml
}
