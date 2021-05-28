import React, { useEffect, useState } from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'

export default function MesZlContent({
  mesZl,
}: {
  mesZl: string
}): JSX.Element | null {
  const [mesZlHead, setMesZlHead] = useState<string | null>(null)
  const [mesZlBody, setMesZlBody] = useState<string | null>(null)

  const mesZlLines = mesZl.split('\n')

  const mesZlFormatted = mesZlLines
    .slice(1, 6)
    .join('\n\n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')

  const subSup = (mesZL) =>
    mesZL
      .replace(/\^([^\^]*)\^/g, '<sup>$1</sup>')
      .replace(/~([^~]*)~/g, '<sub>$1</sub>')

  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(stringify)
      .process(mesZlFormatted, function (err, file) {
        if (err) throw err
        setMesZlBody(subSup(String(file)))
      })

    unified()
      .use(remarkParse)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(stringify)
      .process(mesZlLines[0], function (err, file) {
        if (err) throw err
        setMesZlHead(subSup(String(file).replace(/\s/g, '&#9')))
      })
  }, [mesZlFormatted, mesZlLines])

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
