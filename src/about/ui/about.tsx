import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import { Markdown } from 'common/Markdown'
import eblChart from 'ebl_chart.jpg'
import BrinkmanKingsTable from 'common/BrinkmanKings'
import 'about/ui/about.sass'

export default function About({
  markupService,
}: {
  markupService: MarkupService
}): JSX.Element {
  return (
    <AppContent title="About" crumbs={[new SectionCrumb('About')]}>
      <Tabs defaultActiveKey="corpus" id={''} mountOnEnter unmountOnExit>
        <Tab eventKey="corpus" title="Corpus">
          <p>
            <img
              className="Introduction__chart"
              src={eblChart}
              alt="eBL chart"
            />
          </p>
          <Markup markupService={markupService} text={TEXT} />
        </Tab>
        <Tab eventKey="fragmentarium" title="Fragmentarium">
          <Markdown text={''} />
        </Tab>
        <Tab eventKey="chronology" title="Chronology">
          <Markdown
            text="The list of kings presented here has been prepared by John A.
            Brinkman. It is the eighth edition of the chronology first published
            as an appendix to A. L. Oppenheim’s *Ancient Mesopotamia* (1964).
            The principal new feature of this edition is the recalculation of
            late-second-millennium dates deriving from the Middle Assyrian lunar
            calendar and the corresponding recalibration of synchronistic
            Babylonian dates, which were based on a lunar-solar calendar,
            including their relationship with a set of known intercalary months
            from the fourteenth and thirteenth centuries. This presentation
            reflects research current in January 2023."
          />
          <BrinkmanKingsTable />
        </Tab>
      </Tabs>
    </AppContent>
  )
}

const TEXT = `This tablet is a one columned chronicle-fragment, telling about the faulty reignship of king Šulgi, who committed sins against Babylon and Uruk. The text is written in an accusatory tone, stressed by the repetition of exclamatory sentences about Šulgis sinfull deeds. It was discussed in lenghth by @bib{RN891@63-72}, who pointed out its inspiration trough the Sumerian Kinglist as well as anachronistic allusions to Nabonid.
The tablet is part of a series, as can be seen from the existence of the catchline and a “specular catchline” as it is called by Hunger, (@i{SpTU} 1, 20 n. 2), that seems to resume the content of the preceding chapter. About one half or even two thirds of the composition is missing. This is underlined by the colophon, that takes almost all of the space on the reverse but in many other cases covers only about a third and occasionally half of a tablet.
The tablet stems from the 27. campaign in Uruk 1969 of the residential area U XVIII and was published first by Hunger 1976 in SpTU 1, 2.`
