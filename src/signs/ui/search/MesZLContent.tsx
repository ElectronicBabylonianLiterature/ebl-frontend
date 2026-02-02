import React from 'react'
import './Signs.sass'
import { Link } from 'react-router-dom'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'

function splitMesZl(
  mesZl: string,
  cutOff: number,
): { mesZlHeadMarkdown: string; mesZlBodyMarkdown: string } {
  const mesZlLines = mesZl.split('\n')
  const mesZlBody = mesZlLines
    .slice(1, cutOff)
    .join('\n\n')
    .replace(/\\/g, '\\\\')
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
          {mesZlHeadMarkdown && (
            <MarkdownAndHtmlToHtml
              className={'text-center'}
              markdownAndHtml={mesZlHeadMarkdown}
            />
          )}
        </pre>
      </div>
      {mesZlBodyMarkdown && (
        <MarkdownAndHtmlToHtml
          className="text-align-justify"
          markdownAndHtml={mesZlBodyMarkdown}
        />
      )}
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
      <LiteratureRedirectBox
        authors="Borger, R."
        book="Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte Auflage"
        subtitle="Alter Orient und Altes Testament 305. Münster: Ugarit-Verlag, ²2010; Kapitel &#8546;"
        notelink=""
        note="By permission from Ugarit-Verlag"
        link="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514"
        icon="pointer__hover my-2 fas fa-shopping-cart fa-2x"
      />
    </>
  )
}
