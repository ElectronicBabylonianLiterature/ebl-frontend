import React from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import AppContent from 'common/AppContent'
import { SectionCrumb } from 'common/Breadcrumbs'
import MarkupService from 'markup/application/MarkupService'
import Markup from 'markup/ui/markup'
import { Markdown } from 'common/Markdown'
import eblChart from 'ebl_chart.jpg'
import creativecommonslicense from 'about/ui/creativecommonslicense.png'
import fragmentstorevise from 'about/ui/fragmentstorevise.jpg'
import meszl from 'about/ui/meszl.jpg'
import fossey from 'about/ui/fossey.jpg'
import kerslakebm from 'about/ui/kerslakebm.jpg'
import smithdt1 from 'about/ui/smithdt1.jpg'
import strassmaier from 'about/ui/strassmaier.jpg'
import strassmaiercopies from 'about/ui/strassmaiercopies.jpg'
import geers from 'about/ui/geers.jpg'
import lambert from 'about/ui/lambert.jpg'
import borgerlambert from 'about/ui/borgerlambert.jpg'
import leichty from 'about/ui/leichty.jpg'
import BrinkmanKingsTable from 'common/BrinkmanKings'
import 'about/ui/about.sass'

export default function About({
  markupService,
}: {
  markupService: MarkupService
}): JSX.Element {
  return (
    <AppContent title="About" crumbs={[new SectionCrumb('About')]}>
      <Tabs defaultActiveKey="fragmentarium" id={''} mountOnEnter unmountOnExit>
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
          <p />
          <a
            rel="license"
            className="Introduction__creativeCommonsLicense"
            href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
          >
            <img alt="Creative Commons License" src={creativecommonslicense} />
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
          <figure className="Introduction__photoLeft">
            <img
              className="Introduction__400px"
              src={kerslakebm}
              alt="I. Kerslake in the British Museum"
            />
            <figcaption className="Introduction__caption">
              I. Kerslake photographs tablets in the British Museum, 2019
            </figcaption>
          </figure>
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
          <figure className="Introduction__photoRight">
            <img
              className="Introduction__250px"
              src={fragmentstorevise}
              alt="List of fragments to revise"
            />
            <figcaption className="Introduction__caption">
              List of texts to revise, eBL team
            </figcaption>
          </figure>
          The editions in the Fragmentarium have been produced by the entire eBL
          Team, starting in 2018. Thousands of them were produced on the basis
          of photographs and have not been collated in the museum. Although the
          speed at which fragments have been transliterated has been necessarily
          fast, the quality control measurements adopted, and in particular the
          policy to have each edition revised by a scholar different from the
          original editor, means that they are normally reliable. Each member of
          the team has produced some 40 editions and revised some 60 editions a
          month in average.
          <p />
          In addition, the
          <a href="https://www.geschkult.fu-berlin.de/en/e/babmed/index.html">
            BabMed team
          </a>
          has kindly made acessible its large collections of transliterations of
          Mesopotamian medicine for their use on the Fragmentarium. They have
          been imported by the eBL team using the importer developed by T.
          Englmeier (see
          <a href="https://github.com/ElectronicBabylonianLiterature/generic-documentation/wiki/eBL-ATF-and-other-ATF-flavors">
            here
          </a>
          and
          <a href="https://github.com/ElectronicBabylonianLiterature/ebl-api#importing-atf-files">
            here
          </a>
          ), and thoroughly revised and lemmatized chiefly by H. Stadhouders.
          The transliterations of the BabMed team were originally produced by
          Markham J. Geller, J. Cale Johnson, Ulrike Steinert, Stravil V.
          Panayotov, Eric Schmidtchen, Krisztián Simkó, Marius Hoppe, Marie
          Lorenz, John Schlesinger, Till Kappus, and Agnes Kloocke (at FU
          Berlin), as well as Annie Attia, Sona Eypper, and Henry Stadhouders
          (as external collaborators).
          <p />
          <h3>V. Folios</h3>
          The electronic Babylonian Literature (eBL) project, and in particular
          its Fragmentarium, continues the efforts of generations of
          Assyriologists to rescue the literature of Ancient Mesopotamia from
          the hands of oblivion. The Fragmentarium stands on the shoulders of
          previous scholars, and has used extensively their unpublished,
          unfinished work, for compiling its database of transliterations. It is
          a pleasure to acknowledge our gratitude to the following scholars:
          <h4>V.1. George Smith (26 March 1840 – 19 August 1876)</h4>
          <Markup markupService={markupService} text={SMITH1} />
          <figure className="Introduction__photoLeft">
            <img
              className="Introduction__400px"
              src={smithdt1}
              alt="G. Smith’s draft copy of DT.1"
            />
            <figcaption className="Introduction__caption">
              G. Smith’s draft copy of DT.1
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={SMITH2} />
          <h4>V.2. Johann Strassmaier, S.J. (15 May 1846 – 11 January 1920)</h4>
          <figure className="Introduction__photoRight">
            <img
              className="Introduction__250px"
              src={strassmaier}
              alt="Johann Strassmaier, S.J. (courtesy of W. R. Mayer)"
            />
            <figcaption className="Introduction__caption">
              Johann Strassmaier, S.J. (courtesy of W. R. Mayer)
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={STRASSMAIER1} />
          <figure className="Introduction__photoLeft">
            <img
              className="Introduction__300px"
              src={strassmaiercopies}
              alt="Collection of Strassmaier’s copies at the Pontifical Biblical Institute"
            />
            <figcaption className="Introduction__caption">
              Collection of Strassmaier’s copies at the Pontifical Biblical
              Institute
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={STRASSMAIER2} />
          <h4>V.3. Carl Bezold (18 May 1859 – 21 November 1922)</h4>
          <Markup markupService={markupService} text={BEZOLD} />
          <h4>V.4. Friedrich W. Geers (24 January 1885 – 29 January 1955)</h4>
          <figure className="Introduction__photoRight">
            <img
              className="Introduction__400px"
              src={geers}
              alt="Collection of Geers’s copies once at the Oriental Institute"
            />
            <figcaption className="Introduction__caption">
              Collection of Geers’s copies once at the Oriental Institute
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={GEERS} />
          <h4>V.5. Erica Reiner (4 August 1924 – 31 December 2005)</h4>
          <Markup markupService={markupService} text={REINER} />
          <h4>V.6. W. G. Lambert (26 February 1926 – 9 November 2011)</h4>
          <Markup markupService={markupService} text={LAMBERT1} />
          <figure className="Introduction__photoLeft">
            <img
              className="Introduction__200px"
              src={lambert}
              alt="W. G. Lambert in Wassenaar, 1990 (courtesy U. Kasten)"
            />
            <figcaption className="Introduction__caption">
              W. G. Lambert in Wassenaar, 1990 (courtesy U. Kasten)
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={LAMBERT2} />
          <h4>V.7. Riekele Borger (24 May 1929 – 27 December 2010)</h4>
          <figure className="Introduction__photoRight">
            <img
              className="Introduction__350px"
              src={borgerlambert}
              alt="R. Borger and W. G. Lambert in the British Museum (courtesy J. Taylor)"
            />
            <figcaption className="Introduction__caption">
              R. Borger and W. G. Lambert in the British Museum (courtesy J.
              Taylor)
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={BORGER1} />
          <Markdown text="Borger’s transliterations of Kuyunjik tablets were made in the course of three visits to the British Museum between 2006 and 2010, in the framework of The British Museum’s Ashurbanipal Library Project. The goal of the transliterations was to complete his catalogue of the Kuyunjik collection, a project sadly thwarted by his death in 2010. The transliterations were digitized by the eBL project in 2020, with the kind permission of Angelika Borger, and thanks to the support of Prof. A. Zgoll (Göttingen)." />
          <h4>V.8. Erle Leichty (7 August 1933 – 19 September 2016)</h4>
          <Markup markupService={markupService} text={LEICHTY1} />
          <figure className="Introduction__photoLeft">
            <img
              className="Introduction__400px"
              src={leichty}
              alt="E. Leichty’s note on notebook NB 911"
            />
            <figcaption className="Introduction__caption">
              E. Leichty’s note on notebook NB 911
            </figcaption>
          </figure>
          <Markup markupService={markupService} text={LEICHTY2} />
          <h4>V.9. Stephen J. Lieberman (1943 – 1992)</h4>
          <Markdown text="Stephen J. Lieberman was Research Associate at the Sumerian Dictionary Project of the University of Pennsylvania from 1981 until his untimely death in 1992. Large photographic collections, numbering well over 4,000 photographs of tablets in the British Museum, the University of Pennsylvania Museum of Archaeology and Anthropology, the Frau Professor Hilprecht Collection of Babylonian Antiquities, and the Istanbul Archaeology Museums, among others. The collection of photographs comprises mostly lexical material, most of it published as part of *Materials for the Sumerian Lexicon* series." />
          <p />
          <Markdown text="Lieberman’s photographs, kept in the Babylonian Section of the University of Pennsylvania Museum of Archaeology and Anthropology, were kindly shared by Prof. Niek Veldhuis, and are visible to registered users." />
          <h4>V.10. A. Kirk Grayson</h4>
          <Markup markupService={markupService} text={GRAYSON} />
          <h4>V.11. Werner R. Mayer, S.J.</h4>
          <Markdown text="Werner R. Mayer is an Assyriologist specializing in Akkadian grammar and literature from the first millennium BCE. Mayer’s work combines in an unparalleled manner philological rigor and literary inventiveness, a rare conjunction that has led to many far-reaching lexical and grammatical discoveries. Mayer has also worked extensively on the reconstruction of first-millennium devotional poetry, both on the basis of the Strassmaier’s folios (s. above), and in the course of numerous visits to the British Museum. Mayer has generously made available his large collection of transliterations of accurate transliterations of literary texts for its use in the Fragmentarium." />
          <h4>V.12. Markham J. Geller</h4>
          <h4>V.13. Simo Parpola</h4>
          <Markdown
            text="The Finnish Assyriologists Simo Parpola is the founder and leader of the
          [*State Archives of Assyria*](https://assyriologia.fi/natcp/saa/) project, perhaps the most influential, field-defining
          project in the history of the discipline. With unrivalled erudition and inexhaustible
          energy, Parpola and his team have reconstructed and published almost all first-millennium
          Assyrian administrative texts, and made them accessible in the prestigious *SAA* series
          and multiple subseries. Parpola was a pioneer in the use of computers for cuneiform
          philology, and the technologies developed by him at the beginning of the *SAA* project
          are still in use today. In the course of his reconstruction of the archives of the
          Assyrian empire, Parpola transliterated and identified dozens of tablets in the British
          Museum. Parpola has kindly digitized his transliterations and made them available for
          their use in the Fragmentarium."
          />
          <h4>V.14. Irving L. Finkel</h4>
          <h4>V.15. Andrew R. George</h4>
          <h4>V.16. Ulla Koch</h4>
          <h4>V.17. Uri Gabbay</h4>
        </Tab>{' '}
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
          <figure className="Introduction__photoLeft">
            <a href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514">
              <img
                className="Introduction__300px"
                src={meszl}
                alt="Borger, Mesopotamisches Zeichenlexikon"
              />
            </a>
          </figure>
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

The goal of the Fragmentarium is to provide a lasting solution for the abiding problem of the fragmentariness of Babylonian literature. Thousands of fragments have been identified by members of the eBL project, and around 1,200 joins have been discovered, but many more remain to be found. By compiling transliterations of all fragments in museums’ cabinets, and enabling them to be searched in different, dynamic ways, it is hoped that cuneiform scholars will identify them and be able to use them. The Fragmentarium will eventually include fragments of Sumerian and Akkadian texts of all genres and periods, although at first special attention is paid to fragments of first-millennium non-administrative tablets, both Akkadian and Sumerian.`

const CATALOGUE = `The initial catalogue of the Fragmentarium was compiled using the catalogue of @url{https://www.britishmuseum.org/collection}{The British Museum digital collections}, the catalogue of the @url{http://cdli.ucla.edu/}{Cuneiform Digital Library Initiative}, the catalogue of the @url{https://collections.peabody.yale.edu/search/Search/Results?lookfor=bc+babylonian+collection&limit=5&sort=title}{Yale Babylonian Collection} and numerous other published and unpublished catalogues. Particularly useful was R. Borger’s catalogue of the Kuyunjik collection (@bib{BorgerKat}), to which he referred frequently in his later publications (@bib{RN680@vii}; see @bib{maul2011rykle@167}), but which was never finished. The version published in the Fragmentarium was kindly made available by J. Taylor.

These initial sources have been corrected and supplemented by the eBL project’s staff. In particular, hundreds of books and articles have been catalogued for the eBL Fragmentarium, especially by S. Arroyo, E. Gogokhia, L. Sáenz, and M. Scheiblecker.`

const SMITH1 = `The pioneering Assyriologist George Smith became famous in 1872 for his discovery of a Babylonian version of the Flood story. Subsequently he led an expedition to Mesopotamia to excavate in Nineveh in 1874–1875, and his findings form the base of the British Museum’s Sm and DT collections. In his notebooks he carefully copied the tablets found during his excavations, as well as many other tablets he was able to examine in The British Museum. Interestingly, Smith’s copies often display the tablets in a better shape than their current one (see @bib{RN117@412–414 and 885} and @bib{RN2877}).`

const SMITH2 = `In one of his last diaries, dated August 1876, George Smith states: “I intended to work it out but desire now that my antiquities and notes may be thrown open to all students[.] I have done my duty thoroughly” (Add MS 30425 f. 28a). Smith’s notebooks are kept at the British Library; a provisional catalogue of them was prepared by E. Jiménez. All notebooks containing copies of cuneiform tablets (VII, XI, XII, XIV, and XVII) have been digitized with funds provided by a Sofia Kovalevskaja Award (Alexander von Humboldt Stiftung). The tablets were copied by Smith before they were given museum numbers, so their identification is often challenging. Those that could be identified are displayed in the Fragmentarium, e.g. @url{/fragmentarium/DT.1}{DT.1}.`

const STRASSMAIER1 = `Johann Strassmaier, S.J., was a scholar “convinced that it was a waste of time to compile an Assyrian Dictionary, or to write a history of the Sumerian and Babylonian civilizations, whilst so many tens of thousands of tablets in the British Museum and elsewhere remained unpublished; and he determined to devote himself to copying texts and publishing new material.”  (@bib{wallisbudge1925rise@228}). For that reason, “for about twenty years Strassmaier copied tablets daily in the Museum from 10 a.m. to 4 p.m.; and he must have copied half the Collection.” (@bib{wallisbudge1925rise@229}). He copied in a systematic way a large number of tablets from The British Museum’s “Babylon Collection,” with a particular emphasis on economic documents and astrological/astronomical material.`

const STRASSMAIER2 = `The two collections of Strassmaier’s copies (I and II) were reunited in the Pontifical Biblical Institute by W. R. Mayer in the early 1980s, combining what J. Schaumberger had left to the Biblicum after his death in 1955 with portions of the collections kept in Gars am Inn and in The British Museum. Two different catalogues of the copies were prepared by Mayer, who also collated a large number of the tablets in the British Museum. The collections were digitized in the Pontifical Biblical Institute in 2019 with funds provided by a Sofia Kovalevskaja Award (Alexander von Humboldt Stiftung), courtesy of W. R. Mayer and of its Rector M. F. Kolarcik.`

const BEZOLD = `Carl Bezold, Professor of Assyriology in Heidelberg, completed at the end of the 19th century the daunting task of cataloguing all fragments of the Kuyunjik collection. His magnum opus @i{Catalogue of the Cuneiform Tablets in the Kouyunjik Collection of the British Museum}, published between 1889 and 1899, has been the foundation of all research on the Library of Assurbanipal since its publication, and is today still useful. As preparation for that work, Bezold inscribed thousands of pages, sometimes with simple stenographic notes with general information, sometimes with full copies of the fragments he catalogued.

Around 1,000 copies from Bezold’s Nachlass are now kept in the Heidelberg Universitätsbibliothek. They were kindly digitized at the request of the electronic Babylonian Literature project in 2018, thanks to the help of Clemens Rohfleisch. The copies and notes were catalogued by the electronic Babylonian Literature staff. The Nachlass Bezold, which had previously been almost entirely inaccessible to research (@bib{RN51@43–44}), is now made available on the eBL website.`

const GEERS = `Friedrich W. Geers was “a quiet man, of a shy and retiring nature, who always strove to keep his lonely private life and his personal attitudes hidden under a cloak of friendly silence” (@bib{RN3229}). From 1924 until the break of the Second World War, Geers regularly visited the Students’ Room of the British Museum in order to copy, more or less systematically, the tablets mentioned in Bezold’s @i{Catalogue}. He spent a great deal of his career studying his copies and was able to identify innumerable fragments, but published very few of them. His notebooks of transliterations, which were photographed and reproduced during his lifetime, have been so widely used by scholars and in such a profitable manner that a memorial volume was dedicated to Geers no fewer than twenty years after his life by the most renowned scholars of the time. The “harmlose Geers,” as Landsberger calls him (@bib{RN2045@1257}), single-handedly copied over 7,000 tablets and fragments of Ashurbanipal’s libraries and demonstrates in his copies a profound knowledge of the Mesopotamian literature and an unmatched expertise with the first-hand study of cuneiform sources.

Geers’ copies have been digitized from the copy once in the Oriental Institute of The University of Chicago, kindly donated by Prof. Martha T. Roth to the Institut für Assyriologie und Hethitologie of Munich University.`

const REINER = `Erica Reiner was a Hungarian-American Assyriologist, one of the main forces behind the epoch-making @i{The Assyrian Dictionary of the Oriental Institute of the University of Chicago}. During her long and productive career, Reiner was the world’s foremost expert in Mesopotamian celestial divination, a field in which she produced several fundamental studies, such as the series of monographs @i{Babylonian Planetary Omens} (with D. Pingree).

In her mid-70s, Reiner produced a catalogue of all celestial omen tablets in the British Museum known to her (@bib{RN2030}). The basis for that catalogue was her extensive collection of transliterations and notes, made in the course of many years of study, correspondence with colleagues, and visits to the Students’ Room. Reiner’s collection, bequeathed to Hermann Hunger, was donated by the latter to the Institut für Assyriologie und Hethitologie of Munich University, and is made available here with Hunger’s kind permission.`

const BORGER1 = `Riekele Borger, professor of Assyriology in Göttingen, was one of the most prominent Assyriologists in the 20th century. His monumental reference works (@i{Handbuch der Keilschriftliteratur} and @i{Mesopotamisches Zeichenlexikon}, among others) are a testimony to Borger’s life-long interest in providing Assyriology with the bibliographical, lexicographical, and epigraphical foundations he so sorely missed during his studies, a time he referred to as the “düstere handbuchlose Zeitalter der Assyriologie” (@bib{RN680@v}). His manuals are today Two additional unfinished monumental works by Borger, the @i{Sumerisches Handwörterbuch hauptsächlich aufgrund der Bilinguen} and his @i{Katalog der Kuyunjik-Sammlung}, are published posthumously on the website of the electronic Babylonian Literature project.`

const LAMBERT1 = `W. G. Lambert “made a greater contribution to the continuing task of recovering and understanding Babylonian literature than any other member of his generation” (@bib{RN3226@337}). Author of the influential monographs @i{Babylonian Wisdom Literature} and @i{Babylonian Creation Myths}, Lambert was the leading expert in Babylonian literature for over fifty years. In his several books and dozens of articles, Lambert reconstructed an astonishing number of previously unknown texts, setting high philological standards for the field. The thousands of fragments that he assessed in his pursue were carefully transliterated in his collection notebooks, which represent the fruits of over fifty years of painstaking labor. Lambert granted access to his notebooks to several scholars throughout his life. R. Borger was able to use this “ungeheuer reichhaltige Material” (@bib{RN1445@viii}) for the compilation of the second band of his @i{Handbuch der Keilschriftliteratur} (@bib{RN1445@1975}). This collection of notebooks, catalogued and digitized by Lambert’s academic executor, A. R. George, and used here with his permission, forms the core of the Fragmentarium.`

const LAMBERT2 = `Another source of transliterations is Lambert’s notebook of divinatory texts. The @i{Chicago Assyrian Dictionary} requested from Lambert a standard edition of the vast divinatory treatise @i{Šumma Ālu}, “If a City,” in order for the Chicago lexicographers to excerpt it for their work (@bib{RN3226@344}). In preparation for that edition, Lambert undertook the colossal task of transliterating all known manuscripts of the treatise and related texts, both published an unpublished. Lambert shared his “Heft mit Omentexten” (@bib{RN1445@viii}) with several scholars around the world: the copy used in the Fragmentarium was, in fact, found among Leichty’s papers.

In addition, a large assemblage of small fragments from the British Museum’s Kuyunjik collection was discovered by J. E. Reade and C. B. F. Walker in the 1970s (@bib{RN51@44–45}). Lambert was commissioned with cataloguing these “high K-numbers,” a total of 5,500 small fragments from the libraries of Ashurbanipal (@bib{RN684}). Lambert prepared meticulous transliterations of each of these tablets (K 16801 – K 22202), and passed them on to colleagues specializing in different areas. This vast collection of transliterations, prepared between 1976 and 1990s, is now kept in its entirety in the British Museum, and is made accessible here courtesy of A. R. George and of Jon Taylor (Assistant Keeper of the Cuneiform Collections of the British Museum).`

const LEICHTY1 = `Erle Leichty reached international fame when, as a 25-year old graduate student at the University of Chicago, discovered the then missing beginning of the Babylonian @i{Poem of the Righteous Sufferer} (@bib{RN3228}). His dissertation, a pioneering edition of the teratomantic series “If an Anomaly” (@i{Šumma Izbu}, @bib{RN839}) marked the beginning of his life-long interest on the divinatory treatises of Ancient Mesopotamia. He and his students set out to reconstruct some of the largest Mesopotamian series, and to that end he amassed a collection of thousands of transliterations, chiefly of tablets from the libraries of King Ashurbanipal (668–631 BCE). Throughout his life, he generously made these transliterations available to students and colleagues, who often expressed their gratitude in the prologues of books and articles.

Erle Leichty spend most summers of his career in London (@bib{RN3227}), where he painstakingly prepared catalogues of the vast “Sippar Collection” of the British Museum, consisting of over 40,000 tablets. Published in Leichty 1986, Leichty/Grayson 1987, and Leichty/Finkelstein/Walker 1988, the catalogues made the invaluable wealth of these collections, until them largely inaccessible, fully available to researchers. While preparing the catalogues, Leichty transliterated hundreds of tablets, focusing on divinatory text and on Neo-Babylonian administrative documents, in notebooks and loose pages of paper.`

const LEICHTY2 = `Leichty must have imagined that his notebooks would one day be used for the digital reconstruction of cuneiform literature, since in one of his notebooks he writes: “may r[igh]t sides of omens too fragmentary to identify but might be good for computer search” (EL NB 911, see the adjoining image).

The transliterations of Erle Leichty are used here with the generous permission of Steve Tinney, Associate Curator of the Babylonian Section (Penn Museum of Archaeology and Anthropology). Thanks are expressed to Phil Jones and his team, who were responsible for the scanning of part of them.`

const GRAYSON = `A. Kirk Grayson wrote, under the supervision of W. G. Lambert, his doctoral thesis on the chronicles of ancient Mesopotamia, a book that was to become a field standard, hitherto unreplaced (Grayson 1975). His interest on historical texts reached its zenith when, in the late 1970s, he initiated the project @i{The Royal Inscriptions of Mesopotamia Project} (RIM), one of the most successful projects in the field. Its goal is to produce up-to-date, reliable editions of all royal inscriptions from ancient Mesopotamia, a fabulous task that required the collection of thousands of scattered sources and their study in world’s museums. The RIM project, now continued by the @url{http://oracc.org/rinap/abouttheproject/index.html}{RINAP}, is perhaps the “crowning achievement” of Grayson’s prolific career (so Sweet 2004: xxvi). Grayson, who is himself the author or co-author of no fewer than five of the RIM series’ volumes, spent a great deal of his time working with cuneiform tablets at museums, and was indeed co-responsible for the publication of one of the “Sippar Collection”’s catalogues, together with E. Leichty (@bib{RN1797}). His meticulous draft transliterations, used here courtesy of J. Novotny, are a testimony to the rare combination of philological competence and historical erudition of A. K. Grayson.`

const SIGN = `The sign list of the electronic Babylonian Literature project is based on the @url{http://oracc.org/ogsl/}{Oracc Global Sign List}, used by permission of S. Tinney. Deviations from that list are not marked in any particular way.

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
