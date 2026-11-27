import React from 'react'
import { useHistory } from 'router/compat'
import MarkdownAndHtmlToHtml from 'common/utils/MarkdownAndHtmlToHtml'
import { mesZlParagraphsMarkup, mesZlToMarkup } from 'signs/domain/mesZlMarkup'
import 'signs/ui/display/MesZl.sass'

export type MesZlChapter = 'kap3' | 'kap2'

function isPlainLeftClick(event: React.MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
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
    const target = event.target as HTMLElement
    const reference = target.closest<HTMLAnchorElement>('a.MesZl__reference')
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
