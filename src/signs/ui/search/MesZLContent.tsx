import React from 'react'
import './Signs.css'
import ExternalLink from 'common/ExternalLink'
import { Link } from 'react-router-dom'
import { ContainerWithInnerHtml } from 'common/markdownToHtml'

function splitMesZl(
  mesZl: string
): { mesZlHeadMarkdown: string; mesZlBodyMarkdown: string } {
  const cutOff = 7
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
}: {
  signName: string
  mesZl: string
}): JSX.Element | null {
  const { mesZlHeadMarkdown, mesZlBodyMarkdown } = splitMesZl(mesZl)
  return (
    <>
      <div>
        <pre>
          <ContainerWithInnerHtml
            className={'text-center'}
            markdown={mesZlHeadMarkdown}
          />
        </pre>
      </div>
      <ContainerWithInnerHtml markdown={mesZlBodyMarkdown} />

      {mesZl.split('\n').length > 7 && (
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
