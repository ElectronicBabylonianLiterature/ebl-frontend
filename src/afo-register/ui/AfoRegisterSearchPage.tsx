import React from 'react'
import { parse } from 'query-string'
import { useLocation } from 'react-router-dom'
import AfoRegisterSearch from 'afo-register/ui/AfoRegisterSearch'
import AfoRegisterSearchForm, {
  AfoRegisterQuery,
} from 'afo-register/ui/AfoRegisterSearchForm'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Markdown } from 'common/Markdown'

function getAfoRegisterQueryFromLocation(search: string): AfoRegisterQuery {
  const query = parse(search) as AfoRegisterQuery
  if (!query) {
    return { text: '', textNumber: '' }
  }
  const { text, textNumber } = query
  return { text: text ?? '', textNumber: textNumber ?? '' }
}

function AfoRegisterIntroduction(): JSX.Element {
  return (
    <Markdown
      className="AfoRegister__introduction"
      text="The [AfO-Register](https://orientalistik.univie.ac.at/publikationen/afo/register/) (Archiv für Orientforschung: Register Assyriologie), 
      curated by the Department of Near Eastern Studies of the University of Vienna, is an essential bibliographic tool for Ancient Near 
      Eastern Studies. Starting with Volume 25 (1974–1977), it has published comprehensive bibliographies of new Assyriological literature and an
      index in most volumes, categorized by subject areas, Akkadian and Sumerian words, and texts and passages. With the kind permission of the AfO
      Redaktion, the Register has been digitized and made searchable by the eBL team, thus enhancing its accessibility for researchers,
      students, and enthusiasts interested in the history and culture of Ancient Mesopotamia."
    />
  )
}

export default function AfoRegisterSearchPage({
  afoRegisterService,
  fragmentService,
}: {
  afoRegisterService: AfoRegisterService
  fragmentService: FragmentService
}): JSX.Element {
  const location = useLocation()
  const query = getAfoRegisterQueryFromLocation(location.search)
  return (
    <>
      <AfoRegisterIntroduction />
      <div className="AfoRegister__search">
        <AfoRegisterSearchForm
          queryProp={query}
          afoRegisterService={afoRegisterService}
        />
      </div>
      <div className="AfoRegister__search_results">
        {!!query.text && (
          <AfoRegisterSearch
            query={query}
            afoRegisterService={afoRegisterService}
            fragmentService={fragmentService}
          />
        )}
      </div>
    </>
  )
}
