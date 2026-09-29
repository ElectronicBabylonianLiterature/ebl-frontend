import React from 'react'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

export default function MarkupParagraph({
  text,
  markupService,
}: {
  text: string
  markupService: MarkupService
}): JSX.Element {
  return (
    <div>
      <Markup markupService={markupService} text={text} />
    </div>
  )
}
