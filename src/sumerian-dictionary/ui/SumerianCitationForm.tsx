import React from 'react'
import withData from 'http/withData'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'transliteration/ui/markup'
import { MarkupPart } from 'transliteration/domain/markup'
import { splitCitationForm } from 'sumerian-dictionary/domain/sumerianWordHelpers'

export function CitationFormText({
  citationForm,
}: {
  citationForm: string
}): JSX.Element {
  return (
    <span className="SumerianDictionary__translit">
      {splitCitationForm(citationForm).map((piece, index) =>
        piece.determinative ? (
          <sup key={index}>{piece.text}</sup>
        ) : (
          <React.Fragment key={index}>{piece.text}</React.Fragment>
        ),
      )}
    </span>
  )
}

const AtfCitationForm = withData<
  { atf: string },
  { markupService: MarkupService },
  readonly MarkupPart[]
>(
  ({ data }): JSX.Element => (
    <Markup
      parts={data}
      container="span"
      className="SumerianDictionary__atf-citation-form"
    />
  ),
  ({ markupService, atf }, signal) =>
    markupService.fromString(`@sux{${atf}}`, signal),
  { watch: ({ atf }) => [atf] },
)

export default function SumerianCitationForm({
  citationForm,
  atf,
  markupService,
}: {
  citationForm: string
  atf: string
  markupService: MarkupService
}): JSX.Element {
  return atf ? (
    <AtfCitationForm atf={atf} markupService={markupService} />
  ) : (
    <CitationFormText citationForm={citationForm} />
  )
}
