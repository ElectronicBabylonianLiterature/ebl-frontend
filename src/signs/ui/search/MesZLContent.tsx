import React, { useEffect, useState } from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import { sanitize, defaultSchema } from 'hast-util-sanitize'

//remark-sanitize copy but their types are wrong
function clean(options) {
  return transformer
  function transformer(tree) {
    return sanitize(tree, options)
  }
}

function splitMesZl(mesZl: string): { mesZlHead: string; mesZlBody: string } {
  const mesZlLines = mesZl.split('\n')
  const mesZlBody = mesZlLines
    .slice(1, 6)
    .join('\n\n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
  return { mesZlHead: mesZlLines[0], mesZlBody: mesZlBody }
}
async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const subSup = (mesZL: string): string =>
    mesZL
      .replace(/\^([^\^]*)\^/g, '<sup>$1</sup>')
      .replace(/~([^~]*)~/g, '<sub>$1</sub>')

  const file = await unified()
    .use(remarkParse)
    .use(remark2rehype)
    .use(raw)
    .use(stringify)
    .use(clean, defaultSchema)
    .process(markdown)
  return subSup(String(file))
}

export default function MesZlContent({
  mesZl,
}: {
  mesZl: string
}): JSX.Element | null {
  const [mesZlHead, setMesZlHead] = useState<string>('')
  const [mesZlBody, setMesZlBody] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const mesZlSplitted = splitMesZl(mesZl)
      const mesZlHeadConverted = await convertMarkdownToHtml(
        mesZlSplitted.mesZlHead
      )
      const mesZlBodyConverted = await convertMarkdownToHtml(
        mesZlSplitted.mesZlBody
      )
      setMesZlBody(mesZlBodyConverted)
      setMesZlHead(mesZlHeadConverted.replace(/\s/g, '&#9'))
    })()
  }, [mesZl])

  if (mesZlHead && mesZlBody) {
    return (
      <>
        <div>
          <pre>
            <div
              className="text-center"
              dangerouslySetInnerHTML={{ __html: mesZlHead }}
            />
          </pre>
        </div>

        <hr />
        <div dangerouslySetInnerHTML={{ __html: mesZlBody }} />
        <div className="text-center">...</div>
        <div className="text-center border border-dark mt-2">
          <strong>From</strong>
          <br />
          R. Borger,{' '}
          <em>
            Mesopotamisches Zeichenlexikon, Zweite revidierte und aktualisiert
            Auflage
          </em>
          . Alter Orient und Altes Testament 305. Münster: Ugarit Verlag, second
          Edition, 2010; Kapitel &#8546;
          <br />
          <strong>By permission by Ugarit-Verlag.</strong>
          <br />
          <ExternalLink
            className="text-dark "
            href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
          >
            <i className="pointer__hover my-2 fas fa-shopping-cart fa-2x" />
          </ExternalLink>
        </div>
      </>
    )
  } else {
    return null
  }
}
