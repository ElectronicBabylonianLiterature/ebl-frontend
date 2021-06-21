import React, { PropsWithChildren, useEffect, useState } from 'react'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import DOMPurify from 'dompurify'

export default async function convertMarkdownToSanitizedHtml(
  markdown: string
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

  const html = italic(subSup(String(file)))
  //unified() outputs the HTML within a <p>...</p>, we remove it
  return DOMPurify.sanitize(html.slice(3, html.length - 4))
}

type Container = 'div' | 'span'
interface Props extends PropsWithChildren<any> {
  container?: Container
  markdown: string
}
export function ContainerWithInnerHtml({
  container = 'div',
  markdown,
  ...props
}: Props): JSX.Element | null {
  const [html, setHtml] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    ;(async () => {
      setHtml(await convertMarkdownToSanitizedHtml(markdown))
      setIsReady(true)
    })()
  }, [html])

  if (isReady) {
    if (container === 'div') {
      return <div {...props} dangerouslySetInnerHTML={{ __html: html }} />
    } else {
      return <span {...props} dangerouslySetInnerHTML={{ __html: html }} />
    }
  } else {
    return null
  }
}
