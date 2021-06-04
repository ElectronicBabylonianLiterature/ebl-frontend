import React, { useEffect, useState } from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import DOMPurify from 'dompurify'

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

  const [ready, setReady] = useState(false)

  const mesZlSplitted = splitMesZl(mesZl)

  useEffect(() => {
    ;(async () => {
      const mesZlHeadConverted = await convertMarkdownToHtml(
        mesZlSplitted.mesZlHead
      )
      const mesZlBodyConverted = await convertMarkdownToHtml(
        mesZlSplitted.mesZlBody
      )
      setMesZlBody(mesZlBodyConverted)
      setMesZlHead(mesZlHeadConverted)
      setReady(true)
    })()
  }, [mesZl, mesZlSplitted])

  if (ready) {
    return (
      <>
        <div>
          <pre>
            <div
              className="text-center"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mesZlHead),
              }}
            />
          </pre>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mesZlBody) }}
        />
        {mesZlSplitted.mesZlBody.length > 6 ? (
          <div className="text-center">(Read more)</div>
        ) : null}
        <div className="text-center border border-dark mt-2">
          <strong>From</strong>
          <br />
          R. Borger,{' '}
          <em>
            Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte
            Auflage.&nbsp;
          </em>
          Alter Orient und Altes Testament 305.
          <br /> Münster: Ugarit Verlag, <sup>2</sup>2010; Kapitel &#8546;
          <br />
          <br />
          <strong>By permission from Ugarit-Verlag.</strong>
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
