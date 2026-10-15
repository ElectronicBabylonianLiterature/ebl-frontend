import React from 'react'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import DOMPurify from 'dompurify'
import withData from 'http/withData'

async function convertMarkdownAndHtmlMixToSanitizedHtml(
  markdown: string,
): Promise<string> {
  const subSup = (mesZL: string): string =>
    mesZL
      .replace(/\^([^^]*)\^/g, '<sup>$1</sup>')
      .replace(/~([^~]*)~/g, '<sub>$1</sub>')

  const italic = (mesZL: string): string =>
    mesZL.replace(/\*([^*]*)\*/g, '<em>$1</em>')

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
    Promise.resolve(
      convertMarkdownAndHtmlMixToSanitizedHtml(props.markdownAndHtml),
    ),
)
