import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { Markdown } from 'common/Markdown'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'

export default function About({
  markupService,
}: {
  markupService: MarkupService
}): JSX.Element {
  markupService.fromString(TEXT)
  return (
    <AppContent title="About" crumbs={[new SectionCrumb('About')]}>
      <Tabs defaultActiveKey="corpus" id={''} mountOnEnter unmountOnExit>
        <Tab eventKey="corpus" title="Corpus">
          <Markup markupService={markupService} text={TEXT} />
        </Tab>
        <Tab eventKey="fragmentarium" title="Fragmentarium">
          <Markdown text={''} />
        </Tab>
      </Tabs>
    </AppContent>
  )
}

const TEXT = `This tablet is a one columned chronicle-fragment, telling about the faulty reignship of king Šulgi, who committed sins against Babylon and Uruk. The text is written in an accusatory tone, stressed by the repetition of exclamatory sentences about Šulgis sinfull deeds. It was discussed in lenghth by @bib{RN891@63-72}, who pointed out its inspiration trough the Sumerian Kinglist as well as anachronistic allusions to Nabonid.
The tablet is part of a series, as can be seen from the existence of the catchline and a “specular catchline” as it is called by Hunger, (@i{SpTU} 1, 20 n. 2), that seems to resume the content of the preceding chapter. About one half or even two thirds of the composition is missing. This is underlined by the colophon, that takes almost all of the space on the reverse but in many other cases covers only about a third and occasionally half of a tablet.
The tablet stems from the 27. campaign in Uruk 1969 of the residential area U XVIII and was published first by Hunger 1976 in SpTU 1, 2.`
