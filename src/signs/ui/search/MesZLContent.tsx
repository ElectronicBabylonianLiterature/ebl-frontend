import React from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import { Link } from 'react-router-dom'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'

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

export default function MesZlContent({
  signName,
  mesZl,
  cutOff = Number.POSITIVE_INFINITY,
}: {
  signName: string
  mesZl: string
  cutOff?: number
}): JSX.Element | null {
  const { mesZlHeadMarkdown, mesZlBodyMarkdown } = splitMesZl(mesZl, cutOff)
  return (
    <>
      <div className={'mesZL__popover'}>
        <pre>
          <MarkdownAndHtmlToHtml
            className={'text-center'}
            markdownAndHtml={mesZlHeadMarkdown}
          />
        </pre>
      </div>
      <MarkdownAndHtmlToHtml
        className="text-align-justify"
        markdownAndHtml={mesZlBodyMarkdown}
      />
      {mesZl.split('\n').length > cutOff && (
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
}
