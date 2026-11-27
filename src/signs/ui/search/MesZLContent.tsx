import React from 'react'
import 'signs/ui/search/Signs.sass'
import { Link } from 'react-router-dom'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'
import { MesZlSourceCard } from 'signs/ui/display/MesZlSource'
import { escapeMesZlText, wrapCuneiform } from 'signs/domain/mesZlMarkup'
import 'signs/ui/display/CuneiformFonts.css'
import 'signs/ui/display/MesZl.sass'

function splitMesZl(
  mesZl: string,
  cutOff: number,
): { mesZlHeadMarkdown: string; mesZlBodyMarkdown: string } {
  const mesZlLines = mesZl.split('\n')
  const mesZlBody = escapeMesZlText(mesZlLines.slice(1, cutOff).join('\n\n'))
  return {
    mesZlHeadMarkdown: wrapCuneiform(escapeMesZlText(mesZlLines[0])),
    mesZlBodyMarkdown: wrapCuneiform(mesZlBody),
  }
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
    <div className="MesZl--kap3">
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
      <MesZlSourceCard chapter="kap3" />
    </div>
  )
}
