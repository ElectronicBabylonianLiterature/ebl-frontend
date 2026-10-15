import React from 'react'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

export default function MarkupParagraph({
  text,
  markupService,
  isWrapped = true,
}: {
  text: string
  markupService: MarkupService
  isWrapped?: boolean
}): JSX.Element {
  const markup = <Markup markupService={markupService} text={text} />
  return isWrapped ? <div>{markup}</div> : markup
}
