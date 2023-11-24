import React from 'react'
import { parse } from 'query-string'
import { RouteComponentProps } from 'react-router-dom'
import AfoRegisterSearch from 'afo-register/ui/AfoRegisterSearch'
import AfoRegisterSearchForm, {
  AfoRegisterQuery,
} from 'afo-register/ui/AfoRegisterSearchForm'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { Markdown } from 'common/Markdown'

function getAfoRegisterQueryFromLocation(
  location: RouteComponentProps['location']
): AfoRegisterQuery {
  const query = parse(location.search) as AfoRegisterQuery
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
      text="The [AfO Register](https://orientalistik.univie.ac.at/publikationen/afo/register/) (Archiv für Orientforschung: Register für Assyriologie), 
        hosted by the Department of Near Eastern Studies of the University of Vienna, is an essential bibliographic catalogue for Assyriology. 
        Starting with Volume 25 (1974-1977), it has published a comprehensive bibliography of new Assyriological literature and an index in most volumes, 
        categorized by subject areas, Akkadian and Sumerian words, texts, and passages. 
        With the kind permission of the publishers, the register was digitized and made searchable by the eBL team, 
        enhancing its accessibility for researchers, students, and enthusiasts interested in the history and culture of Ancient Mesopotamia."
    />
  )
}

export default function AfoRegisterSearchPage({
  afoRegisterService,
  location,
}: {
  afoRegisterService: AfoRegisterService
} & RouteComponentProps): JSX.Element {
  const query = getAfoRegisterQueryFromLocation(location)
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
        <AfoRegisterSearch
          query={query}
          afoRegisterService={afoRegisterService}
        />
      </div>
    </>
  )
}
