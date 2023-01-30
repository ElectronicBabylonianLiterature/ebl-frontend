import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import { Markdown } from 'common/Markdown'
import eblChart from 'ebl_chart.jpg'
import meszl from 'about/ui/meszl.jpg'
import fossey from 'about/ui/fossey.jpg'
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
        <Tab eventKey="signs" title="Signs">
          <Markdown
            text="The sign interface of the electronic Babylonian Library project
                                    aims to provide a comprehensive, reliable, and quickly accessible reference
                                    tool for cuneiform script. The various sections benefit greatly from various
                                    publications on cuneiform palaeography, both digital and traditional; some
                                    of them have been digitized for the first time in the framework of the eBL
                                    project."
          />
          <p />
          <h3>I. Sign information</h3>
          <Markup markupService={markupService} text={SIGN} />
          <h3>II. Mesopotamisches Zeichenlexikon</h3>
          <a href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514">
            <img
              className="Introduction__meszl"
              src={meszl}
              alt="Borger, Mesopotamisches Zeichenlexikon"
            />
          </a>
          <Markup markupService={markupService} text={MESZL} />
          <h3>III. Fossey, Manuel d’assyriologie II</h3>
          <img
            className="Introduction__fossey"
            src={fossey}
            alt="Fossey, Manuel d’assyriologie II"
          />
          <Markup markupService={markupService} text={FOSSEY} />
          <h3>IV. Palaeography</h3>
          <Markup markupService={markupService} text={PALAEOGRAPHY} />
        </Tab>
        <Tab eventKey="dictionary" title="Dictionary">
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

const SIGN = `The sign list of the electronic Babylonian Literature project is based on the @url{http://oracc.museum.upenn.edu/ogsl/}{Oracc Global Sign List}, used by permission of S. Tinney. Deviations from that list are not marked in any particular way.

The fonts used in the epigraphy section were all designed by S. Vanserveren, who has made them freely available for the scientific community. They can be downloaded at @url{https://www.hethport.uni-wuerzburg.de/cuneifont/}{this link}. Dr. Vanserveren was kind enough to develop an entire font (Esagil, Neo-Babylonian) at our request.

The logograms that appear with each sign are cited from W. Schramm’s @i{Akkadische Logogramme} (Göttinger Beiträge zum Alten Orient 5. Göttingen, ²2010; @url{https://creativecommons.org/licenses/by-nd/3.0/de/}{CC BY-ND 3.0}). The book is used by permission of its author.`

const MESZL = `A great debt of gratitude is owed to Thomas R. Kämmerer, editor-in-chief
of Ugarit-Verlag, for his permission to digitize and make publicly available on
this website the third chapter of R. Borger’s @i{Mesopotamisches Zeichenlexikon}
(Alter Orient und Altes Testament 305. Münster, ²2010). Borger’s work has been
digitized by E. Gogokhia, and proofread by S. Cohen, A. Hätinen, and E. Jiménez.
The cuneiform has been coded in Unicode and is displayed using S. Vanserveren’s
@url{https://www.hethport.uni-wuerzburg.de/cuneifont/}{Assurbanipal font}.
Thanks are expressed to Dr. Vanserveren for her readiness to adapt and expand
her font to contain all glyphs from @i{MesZL}².

Following Borger’s request in @i{MesZL}² p. viii, the very few deviations of
the electronic edition with respect to the printed version of the sign list
are marked in a different color. These deviations have the goal of correcting
the very few typos of the first and second editions, such as the repeated
paragraph in p. 418 (see @url{https://www.ebl.lmu.de/signs/DIŠ}{here}).

R. Borger himself was rather skeptical regarding the possible digitization of
his @i{MesZL}: in the preface to his second edition, he states: “Hin und wieder
wird geträumt vom Ersatz der Buch-Fassung durch eine Internet-Fassung. Der
geistige Nährwert des Umwegs über das Internet scheint mir sehr gering. Die
technischen Probleme solch einer Umsetzung dürften kaum lösbar sein. Ich nehme
übrigens an, dass mein Buch die heutigen Internet-“Publikationen” und CDs lange
überleben wird” (p. viii). It is hoped that the care that the eBL team put into the
digitization of his @i{magnum opus} would have met his standards of acceptability.

The entire @i{MesZL}², not only the third chapter reproduced on this website,
is an indispensable tool for reading cuneiform texts, and all users of the eBL
sign interface are encouraged to buy the book from Ugarit-Verlag, following
@url{https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514}{this link}.`

const FOSSEY = `Fossey’s monumental @i{Manuel d’assyriologie} II (Paris, 1926) is still today
the most comprehensive repertoire of cuneiform signs. The collection of signs from all periods
and regions known in Fossey’s day has aged well and, although many additional periods,
cities, and sign forms could be added today, the book remains unsurpassed.

Following the book’s entrance into public domain in 2016, Fossey’s @i{Manuel} is currently
being digitized by a joint team led by E. Jiménez and Sh. Gordin. R. Borger’s concordance
of Fossey’s list, included in the second chapter of his @i{Mesopotamisches Zeichenlexikon},
was digitized by E. Gogokhia, and forms the basis for the display of the book on the eBL website.`

const PALAEOGRAPHY = `The tool for tagging images of cuneiform tablets that is at the core
of the palaeography section was implemented by J. Laasonen and Y. Cobanoglu in the framework
of the project “Searching through Ancient Libraries: New Statistical Indexing Methods for 2D
Images of Cuneiform Documents” (Y. Cohen, E. Jiménez, Sh. Gordin), financed by a Call for Joint
Research Project on Data Science between Ludwig-Maximilians-Universität München (LMU) and Tel
Aviv University (TAU).

The entire eBL team has contributed to the tagging of tablets, but the
labor of N. Wenner, L. Sáenz, M. Fadhil, and S. Cohen should be singled out. More tablets are
being tagged daily. Furthermore, a system for automatically labeling photographs has been
implemented and is undergoing refinement.`
