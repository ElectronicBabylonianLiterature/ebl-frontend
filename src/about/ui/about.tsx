import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import { Markdown } from 'common/Markdown'
import eblChart from 'ebl_chart.jpg'
import fragmentstorevise from 'about/ui/fragmentstorevise.jpg'
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
          <Markup markupService={markupService} text={FRAGMENTARIUM_INTRO} />
          <h3>I. How to Cite</h3>
          <Markdown
            text="The editions contained in the Fragmentarium are mostly of a
          preliminary nature, and are intended to provide a research tool to aid
          in the reconstruction of Babylonian literature, rather than a
          finished, polished product. They are constantly updated, and will
          continue to be so for the foreseeable future."
          />
          <Markdown
            text="In order to cite a certain edition, the
          following style is recommended:"
          />
          <span className="Introduction__cite">
            <Markdown
              text="K.5743, eBL edition
            (https://www.ebl.lmu.de/fragmentarium/K.5743),
            accessed"
            />{' '}
            {new Date().toLocaleDateString() + ''}
          </span>
          <Markdown
            text="The editions in the Fragmentarium are published under a [Creative
          Commons Attribution-NonCommercial-ShareAlike 4.0 International
          License](http://creativecommons.org/licenses/by-nc-sa/4.0/), which
          allows the non-commercial redistribution of material as long a
          appropriate credit is given."
          />
          <a
            rel="license"
            href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
          >
            <img
              alt="Creative Commons License"
              className="Introduction__creativecommons"
              src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"
            />
          </a>
          <h3>II. Sources of the Catalogue</h3>
          <Markup markupService={markupService} text={CATALOGUE} />
          <h3>III. Photographs</h3>
          The photographs of tablets from The British Museum’s Kuyunjik
          collection were produced in 2009-2013, as part of the on-going
          “Ashurbanipal Library Project” (2002–present), thanks to funding
          provided by The Townley Group and The Andrew Mellon Foundation. The
          photographs were produced by Marieka Arksey, Kristin A. Phelps, Sarah
          Readings, and Ana Tam; with the assistance of Alberto Giannese, Gina
          Konstantopoulos, Chiara Salvador, and Mathilde Touillon-Ricci. They
          are displayed on the eBL website courtesy of Dr. Jon Taylor, director
          of the “Ashurbanipal Library Project.”
          <p />
          The photographs of the The British Museum’s Babylon collection are
          taken by Alberto Giannese and Ivor Kerslake (2019–present) in the
          framework of the “electronic Babylonian Literature” project, funded by
          a Sofia Kovalevskaja Award (Alexander von Humboldt Stiftung).
          <p />
          The photographs of the tablets in the Iraq Museum have been produced
          by Anmar A. Fadhil (University of Baghdad – eBL Project), and
          displayed by permission of the State Board of Antiquities and Heritage
          and The Iraq Museum.
          <p />
          The photographs of the tablets in the Yale Babylonian Collection are
          being produced by Klaus Wagensonner (Yale University), and used with
          the kind permission of the Agnete W. Lassen (Associate Curator of the
          Yale Babylonian Collection, Yale Peabody Museum).
          <p />
          The images cannot be reproduced without the explicit consent of the
          funding projects and institutions, as well as the institutions in
          which the cuneiform tablets are kept. Users are referred to the
          conditions for reproducing the images in the links shown in the
          captions under the images. <p />
          <h3>IV. Editions in the Fragmentarium</h3>
          <img
            className="Introduction__fragmentstorevise"
            src={fragmentstorevise}
            alt="List of fragments to revise"
          />
          The editions in the Fragmentarium have been produced by the entire eBL
          Team, starting in 2018. Thousands of them were produced on the basis
          of photographs and have not been collated in the museum. Although the
          speed at which fragments have been transliterated has been necessarily
          fast, the quality control measurements adopted, and in particular the
          policy to have each edition revised by a scholar different from the
          original editor, means that they are normally reliable. Each member of
          the team has produced some 40 editions and revised some 60 editions a
          month in average.
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

const FRAGMENTARIUM_INTRO = `In 1850, in the ruins of the South-West Palace at Nineveh (modern Mosul), in two rooms flanked by colossal reliefs of sages, the pioneer archaeologist Austen H. Layard found thousands of clay tablets inscribed with cuneiform script and “broken into many fragments,” completely covering the floors. He anticipated that “years must elapse before the innumerable fragments can be put together and the inscriptions transcribed for the use of those who in England and elsewhere” (@bib{RN2710@347}). After nearly 180 years the task envisioned by Layard is, despite the efforts of generations of cuneiform specialists, still far from finished: bluntly put, there are still many fragments without texts and many texts without fragments

The existence of a large mass of fragments vaguely described in museum catalogues by broad categories such as “religious,” “literary,” or “hymnic” has been a problem for cuneiformists since the inception of the field. The knowledge that there are many fragments “literally crying out for more joins” (@bib{RN2717@126}) haunts cuneiformists in their daily work.  As put by @bib{RN51@41–42}, “It is quite frustrating to struggle with a fragmentary text in the Students’ Room of the W[estern] A[siatic] A[ntiquities] Department [in the British Museum] and suspect, with more or less reason, that unidentified additional pieces lie in drawers only a few metres away.”

The goal of the Fragmentarium is to provide a lasting solution for the abiding problem of the fragmentariness of Babylonian literature. By compiling transliterations of all fragments in museums’ cabinets, and enabling them to be searched in different, dynamic ways, it is hoped that cuneiform scholars will identify them and be able to use them. The Fragmentarium will eventually include fragments of Sumerian and Akkadian texts of all genres and periods, although at first special attention is paid to fragments of first-millennium non-administrative tablets, both Akkadian and Sumerian.`

const CATALOGUE = `The initial catalogue of the Fragmentarium was compiled using the catalogue of @url{The British Museum digital collections}{https://www.britishmuseum.org/collection}, the catalogue of the @url{Cuneiform Digital Library Initiative}{http://cdli.ucla.edu/}, the catalogue of the @url{Yale Babylonian Collection}{https://collections.peabody.yale.edu/search/Search/Results?lookfor=bc+babylonian+collection&limit=5&sort=title} and numerous other published and unpublished catalogues. Particularly useful was R. Borger’s catalogue of the Kuyunjik collection (@bib{BorgerKat}), to which he referred frequently in his later publications (@bib{RN680@vii}; see @bib{maul2011rykle@167}), but which was never finished. The version published in the Fragmentarium was kindly made available by J. Taylor.

These initial sources have been corrected and supplemented by the eBL project’s staff. In particular, hundreds of books and articles have been catalogued for the eBL Fragmentarium, especially by S. Arroyo, E. Gogokhia, L. Sáenz, and M. Scheiblecker.`

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
