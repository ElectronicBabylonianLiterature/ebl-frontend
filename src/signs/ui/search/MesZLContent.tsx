import React, { useEffect, useState } from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import raw from 'rehype-raw'
import stringify from 'rehype-stringify'
import DOMPurify from 'dompurify'
import { Link } from 'react-router-dom'

function splitMesZl(
  mesZl: string,
  cutOff: number
): { mesZlHeadMarkdown: string; mesZlBodyMarkdown: string } {
  const mesZlLines = mesZl.split('\n')
  const mesZlBody = mesZlLines
    .slice(1, cutOff)
    .join('\n\n')
    .replace(/\[/g, '\\[')
    .replace(/]/g, '\\]')
  return { mesZlHeadMarkdown: mesZlLines[0], mesZlBodyMarkdown: mesZlBody }
}

async function convertMarkdownToHtml(markdown: string): Promise<string> {
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
  return italic(subSup(String(file)))
}

export default function MesZlContent({
  signName,
  mesZl,
  cutOff = 7,
}: {
  signName: string
  mesZl: string
  cutOff?: number
}): JSX.Element | null {
  const [mesZlHead, setMesZlHead] = useState<string>('')
  const [mesZlBody, setMesZlBody] = useState<string>('')

  const [ready, setReady] = useState(false)

  const { mesZlHeadMarkdown, mesZlBodyMarkdown } = splitMesZl(mesZl, cutOff)

  useEffect(() => {
    ;(async () => {
      setMesZlHead(await convertMarkdownToHtml(mesZlHeadMarkdown))
      setMesZlBody(await convertMarkdownToHtml(mesZlBodyMarkdown))

      setReady(true)
    })()
  }, [mesZl, mesZlHeadMarkdown, mesZlBodyMarkdown])

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
        {mesZl.split('\n').length > 7 && cutOff !== -1 && (
          <div className="text-center">
            <br />
            <strong>
              <Link to={`/signs/${encodeURIComponent(signName)}`}>
                (Read more ...)
              </Link>
            </strong>

            <br />
            <br />
          </div>
        )}
        <div className="text-center border border-dark">
          <strong>From</strong>
          <br />
          R. Borger,{' '}
          <em>
            Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte
            Auflage.&nbsp;
          </em>
          Alter Orient und Altes Testament 305.
          <br /> Münster: Ugarit-Verlag, <sup>2</sup>2010; Kapitel &#8546;.
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
