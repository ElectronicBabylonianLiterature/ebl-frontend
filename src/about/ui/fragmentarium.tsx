import React from 'react'
import { Markdown, MarkdownParagraph } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import creativecommonslicense from 'about/ui/static/creativecommonslicense.png'
import fragmentstorevise from 'about/ui/static/fragmentstorevise.jpg'
import kerslakebm from 'about/ui/static/kerslakebm.jpg'

import { folios } from 'about/ui/folios'

export default function AboutFragmentarium(
  markupService: MarkupService
): JSX.Element {
  function MarkupParagraph({ text }: { text: string }): JSX.Element {
    return (
      <p>
        <Markup markupService={markupService} text={text} />
      </p>
    )
  }

  return (
    <>
      <MarkupParagraph
        text="In 1850, in the ruins of the South-West Palace at Nineveh (modern Mosul), in
              two rooms flanked by colossal reliefs of sages, the pioneer archaeologist
              Austen H. Layard found thousands of clay tablets inscribed with cuneiform
              script “broken into many fragments,” completely covering the floors. He
              anticipated that “years must elapse before the innumerable fragments can be put
              together and the inscriptions transcribed for the use of those who in England
              and elsewhere may engage in the study of the cuneiform character”
              (@bib{RN2710@347}). After nearly 180 years the task envisioned by Layard is,
              despite the efforts of generations of cuneiform specialists, still far from
              finished. Bluntly put, there are still many fragments without texts and many
              texts without fragments."
      />
      <MarkupParagraph
        text="The existence of a large mass of fragments vaguely described in museum
              catalogues by broad categories such as “religious,” “literary,” or “hymnic” has
              been a problem for cuneiformists since the inception of the field. The
              knowledge that there are many fragments “literally crying out for more joins”
              (@bib{RN2717@126}) haunts cuneiformists in their daily work. The goal of the
              Library (formerly Fragmentarium) is to provide a lasting solution for the abiding 
              problem of the
              fragmentariness of Babylonian literature. Thousands of fragments have been
              identified by members of the eBL project, and around 1,200 joins have been
              discovered, but many more remain to be found. By compiling transliterations of
              all fragments in museums’ cabinets, and enabling them to be searched in
              different, dynamic ways, it is hoped that cuneiform scholars will identify them
              and be able to use them. The Library will eventually include fragments of
              Sumerian and Akkadian texts of all genres and periods, although presently
              special attention is paid to fragments of first-millennium non-administrative
              tablets, written in both Akkadian and Sumerian."
      />
      <h3>I. How to Cite</h3>
      <MarkdownParagraph
        text="The editions contained in the Library are mostly of a
              preliminary nature, and are intended to provide a research tool to aid
              in the reconstruction of Babylonian literature, rather than a
              finished, polished product. They are constantly updated, and will
              continue to be so for the foreseeable future."
      />
      <MarkdownParagraph text="In order to cite a certain edition, the following style is recommended:" />
      <p className="Introduction__cite">
        <Markdown
          text="K.5743, eBL edition
                                        (https://www.ebl.lmu.de/library/K.5743),
                                        accessed"
        />{' '}
        {new Date().toLocaleDateString() + ''}{' '}
      </p>
      <MarkdownParagraph
        text="The editions in the Library are published under a [Creative
              Commons Attribution-NonCommercial-ShareAlike 4.0 International
              License](http://creativecommons.org/licenses/by-nc-sa/4.0/), which
              allows the non-commercial redistribution of material as long as
              appropriate credit is given."
      />
      <p className="Introduction__creativeCommonsLicense">
        <a
          rel="license"
          href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
        >
          <img alt="Creative Commons License" src={creativecommonslicense} />
        </a>
      </p>
      <h3>II. Sources of the Catalogue</h3>
      <MarkupParagraph
        text="The initial catalogue of the Library was compiled using the catalogue of
              @url{https://www.britishmuseum.org/collection}{The British Museum digital collections},
              the catalogue of the @url{https://cdli.earth/}{Cuneiform Digital Library Initiative},
              the catalogue of the
              @url{https://collections.peabody.yale.edu/search/Search/Results?lookfor=bc+babylonian+collection&limit=5&sort=title}{Yale Babylonian Collection},
              the catalogue of the @url{https://isac.uchicago.edu/}{The Institute for the Study of Ancient Cultures}, 
              the catalogue of the @url{https://www.nino-leiden.nl/collections/de-liagre-bohl-collection}{De Liagre Böhl Collection} 
              (@url{https://www.nino-leiden.nl/}{Nederlands Instituut voor het Nabije Oosten}), 
              and numerous other published and unpublished catalogues. Particularly useful was R. Borger’s
              catalogue of the Kuyunjik collection (@bib{BorgerKat}), to which he referred
              frequently in his later publications (@bib{RN680@vii}; see
              @bib{maul2011rykle@167}), but which was never finished. The version published
              in the Library was kindly made available by J. Taylor."
      />
      <MarkupParagraph
        text="The catalog of the finds of the first three postSUMER-war Nippur campaigns
        (@bib{nippur_catalogue}), prepared by the excavators, was part of Erle Leichty’s
        Nachlass (see below). This catalog was partially digitized between 2020 and 2022 by Marion
        Scheiblecker and Luis Sáenz, as members of the eBL team, and then between 2023 and 2024
        by Kameron Kashani and Claudia González, who worked on a voluntary basis. We extend
        our sincerest thanks to all of them."
      />
      <p>
        The list of joins has been compiled on the basis of the catalogue of the
        British Museum, kindly made available by J. Taylor. This catalogue has
        been supplemented by several join books of the British Museum (currently
        the join books covering September 1983 to August 1987 and April 1999 to
        March 2019 have been integrated into the database). In addition, a list
        of joins of tablets in the Penn Museum as been compiled by J. Peterson
        on behalf of the eBL project.
      </p>
      <p>
        These initial sources have been thoroughly corrected and supplemented by
        the eBL project’s staff.
      </p>
      <h3>III. Photographs</h3>
      <p>
        The photographs of tablets from The British Museum’s Kuyunjik collection
        were produced in 2009-2013, as part of the on-going “Ashurbanipal
        Library Project” (2002–present), thanks to funding provided by The
        Townley Group and The Andrew Mellon Foundation. The photographs were
        produced by Marieka Arksey, Kristin A. Phelps, Sarah Readings, and Ana
        Tam; with the assistance of Alberto Giannese, Gina Konstantopoulos,
        Chiara Salvador, and Mathilde Touillon-Ricci. They are displayed on the
        eBL website courtesy of Dr. Jon Taylor, director of the “Ashurbanipal
        Library Project.”
      </p>
      <p>
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
        The photographs of the The British Museum’s Babylon collection are taken
        by Alberto Giannese and Ivor Kerslake (2019–present) in the framework of
        the “electronic Babylonian Literature” project, funded by a Sofia
        Kovalevskaja Award (Alexander von Humboldt Stiftung).
      </p>
      <p>
        The photographs of the tablets in the Iraq Museum have been produced by
        Anmar A. Fadhil (University of Baghdad – eBL Project) and Nawfal Jabbar
        (The Iraq Museum – eBL Project). They were mounted by Luis Sáenz and
        Louis Happel. They are displayed by permission of the State Board of
        Antiquities and Heritage and The Iraq Museum, and with the kind consent
        of the expeditions (Institute for the Study of Ancient Cultures, West
        Asia & North Africa, Chicago; and The British Institute for the Study of
        Iraq, London).
      </p>
      <p>
        The photographs of the tablets in the Yale Babylonian Collection are
        being produced by Klaus Wagensonner (Yale University), and used with the
        kind permission of the Agnete W. Lassen (Associate Curator of the Yale
        Babylonian Collection, Yale Peabody Museum).
      </p>
      <p>
        The images cannot be reproduced without the explicit consent of the
        funding projects and institutions, as well as the institutions in which
        the cuneiform tablets are kept. Users are referred to the conditions for
        reproducing the images in the links shown in the captions under the
        images.
      </p>
      <h3>IV. Editions in the Library</h3>
      <p>
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
        The editions in the Library have been produced by the entire eBL Team,
        starting in 2018. Thousands of them were produced on the basis of
        photographs and have not been collated in the museum. Although the speed
        at which fragments have been transliterated has been necessarily fast,
        the quality control measures adopted, and in particular the policy to
        have each edition revised by a scholar different from the original
        editor, means that they are normally reliable. Each member of the team
        has produced some 40 editions and revised some 60 editions a month on
        average.
      </p>
      <p>
        In addition, the{' '}
        <a href="https://www.geschkult.fu-berlin.de/en/e/babmed/index.html">
          BabMed team
        </a>{' '}
        has kindly made acessible its large collections of transliterations of
        Mesopotamian medicine for their use on the Library. They have been
        imported by the eBL team using the importer developed by T. Englmeier
        (see{' '}
        <a href="https://github.com/ElectronicBabylonianLiterature/generic-documentation/wiki/eBL-ATF-and-other-ATF-flavors">
          here
        </a>{' '}
        and{' '}
        <a href="https://github.com/ElectronicBabylonianLiterature/ebl-api#importing-atf-files">
          here
        </a>
        ), and thoroughly revised and lemmatized chiefly by H. Stadhouders. The
        transliterations of the BabMed team were originally produced by Markham
        J. Geller, J. Cale Johnson, Ulrike Steinert, Stravil V. Panayotov, Eric
        Schmidtchen, Krisztián Simkó, Marius Hoppe, Marie Lorenz, John
        Schlesinger, Till Kappus, and Agnes Kloocke (at FU Berlin), as well as
        Annie Attia, Sona Eypper, and Henry Stadhouders (as external
        collaborators).
      </p>
      <h3>V. Folios</h3>
      <p>
        The electronic Babylonian Literature (eBL) project, and in particular
        its Library, continues the efforts of generations of Assyriologists to
        rescue the literature of Ancient Mesopotamia from the hands of oblivion.
        The Library stands on the shoulders of previous scholars, and has used
        extensively their unpublished, unfinished work, for compiling its
        database of transliterations. It is a pleasure to acknowledge our
        gratitude to the following scholars:
      </p>
      {folios.map((folio, index) => (
        <React.Fragment key={folio.initials}>
          <h4 id={folio.initials}>
            V.{index + 1}. {folio.title}
          </h4>
          {folio.content(markupService)}
        </React.Fragment>
      ))}
    </>
  )
}
