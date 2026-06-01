import React from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import { Session } from 'auth/Session'
import { MarkdownParagraph } from 'common/ui/Markdown'
import RealiaSearchForm from 'realia/ui/RealiaSearchForm'
import RealiaSearch from 'realia/ui/RealiaSearch'
import RealiaService from 'realia/application/RealiaService'

function getQueryFromLocation(search: string): string {
  const parsed = parse(search)
  const query = parsed.query
  return typeof query === 'string' ? query : ''
}

export default function RealiaSearchPage({
  realiaService,
}: {
  realiaService: RealiaService
}): JSX.Element {
  const location = useLocation()
  const query = getQueryFromLocation(location.search)

  return (
    <SessionContext.Consumer>
      {(session: Session): JSX.Element =>
        session.isAllowedToReadRealia() ? (
          <>
            <MarkdownParagraph
              text={`The Dictionary of Realia is a reference tool for the material culture, religion, flora and fauna, and other
realia of the ancient Near East, from prehistory to the end of the cuneiform cultures around the turn of
the Common Era. Its lemma list is drawn primarily from two foundational resources: the Reallexikon der
Assyriologie und Vorderasiatischen Archaologie (RIA), the field's landmark encyclopedia published
between 1928 and 2018, and the "Realien" section of the *Archiv für Orientforschung Register (AfO-Register)*,
starting with Volume 25 (1974-1977). In addition, the cuneiform editions in the eBL Library have been
annotated according to this list of realia, allowing users to move seamlessly between dictionary entries and
the primary textual sources in which these realia appear.`}
            />
            <RealiaSearchForm query={query} />
            <RealiaSearch query={query} realiaService={realiaService} />
          </>
        ) : (
          <p>Please log in to browse the Dictionary of Realia.</p>
        )
      }
    </SessionContext.Consumer>
  )
}
