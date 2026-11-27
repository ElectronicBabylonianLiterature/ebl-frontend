import React from 'react'
import { useHistory } from 'router/compat'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'
import { mesZlParagraphsMarkup, mesZlToMarkup } from 'signs/domain/mesZlMarkup'
import 'signs/ui/display/MesZl.sass'

export type MesZlChapter = 'kap3' | 'kap2'

const MODIFIER_KEYS = ['metaKey', 'ctrlKey', 'shiftKey', 'altKey'] as const

function isPlainLeftClick(event: React.MouseEvent): boolean {
  return event.button === 0 && !MODIFIER_KEYS.some((key) => event[key])
}

function internalReference(event: React.MouseEvent): HTMLAnchorElement | null {
  const reference = (event.target as HTMLElement).closest<HTMLAnchorElement>(
    'a.MesZl__reference',
  )
  return reference && reference.origin === window.location.origin
    ? reference
    : null
}

export default function MesZlText({
  text,
  chapter,
}: {
  text: string
  chapter: MesZlChapter
}): JSX.Element {
  const history = useHistory()
  const { head, paragraphs } = mesZlToMarkup(text)
  const followReference = (event: React.MouseEvent<HTMLElement>): void => {
    const reference = internalReference(event)
    if (reference && isPlainLeftClick(event)) {
      event.preventDefault()
      history.push({
        pathname: reference.pathname,
        search: reference.search,
      })
    }
  }
  return (
    <article
      className={`MesZl MesZl--${chapter}`}
      lang="de"
      onClick={followReference}
    >
      <MarkdownAndHtmlToHtml className="MesZl__head" markdownAndHtml={head} />
      {paragraphs.length > 0 && (
        <MarkdownAndHtmlToHtml
          markdownAndHtml={mesZlParagraphsMarkup(paragraphs)}
        />
      )}
    </article>
  )
}
