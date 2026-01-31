import React from 'react'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import DOMPurify from 'dompurify'
import withData from 'http/withData'
import Bluebird from 'bluebird'

async function convertMarkdownAndHtmlMixToSanitizedHtml(
  markdown: string,
): Promise<string> {
  // remark supSuber library which we use in other places doesn't work with unified
  // supSuper Issue https://github.com/zestedesavoir/zmarkdown/issues/438
  const subSup = (mesZL: string): string =>
    mesZL
      .replace(/\^([^\^]*)\^/g, '<sup>$1</sup>')
      .replace(/~([^~]*)~/g, '<sub>$1</sub>')

  // remark uses commonMarkdown, that's why we have to parse italic manually ontop of transforming it with remark
  // Issue/Question CommonMarkdown Italic https://github.com/remarkjs/remark-rehype/issues/18
  const italic = (mesZL: string): string =>
    mesZL.replace(/\*([^*]*)\*/g, '<em>$1</em>')

  //remark sanitize https://github.com/syntax-tree/hast-util-sanitize is not working
  //we are using DOMPurify instead to sanitize HTML before setting "dangerouslySetInnerHTML"

  const file = await unified()
    .use(remarkParse)
    .use(remark2rehype, { allowDangerousHtml: true })
    .use(raw)
    .use(stringify)
    .process(markdown)

  const html = DOMPurify.sanitize(italic(subSup(String(file))))
  return removeParagraphHtmlTag(html)
}

function removeParagraphHtmlTag(html: string): string {
  if (html.startsWith('<p>')) {
    return html.slice(3, html.length - 4)
  } else {
    return html
  }
}

type Container = 'div' | 'span'
interface Props {
  container?: Container
  htmlString: string
  className?: string
}
function HtmlFromString({
  container = 'div',
  htmlString,
  className = '',
}: Props): JSX.Element | null {
  if (container === 'div') {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    )
  } else {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    )
  }
}

export default withData<Omit<Props, 'htmlString'>, { markdownAndHtml }, string>(
  ({ data, container, ...props }) => (
    <HtmlFromString htmlString={data} container={container} {...props} />
  ),
  (props) =>
    Bluebird.resolve(
      convertMarkdownAndHtmlMixToSanitizedHtml(props.markdownAndHtml),
    ),
)
