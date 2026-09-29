import React from 'react'
import { MarkdownParagraph } from 'common/ui/Markdown'
import MarkupParagraph from 'about/ui/MarkupParagraph'
import { FolioEntry } from 'about/ui/FolioEntry'
import finkeljoins from 'about/ui/static/finkeljoins.jpg'
import georgetransliteration from 'about/ui/static/georgetransliteration.jpg'
import parpola from 'about/ui/static/parpola.png'

export const contemporaryFolios: FolioEntry[] = [
  {
    initials: 'AKG',
    title: 'A. Kirk Grayson',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="A. Kirk Grayson wrote, under the supervision of W. G. Lambert, his doctoral thesis on the chronicles of ancient Mesopotamia, a book that was to become a field standard, hitherto unreplaced (@bib{RN258}). His interest on historical texts reached its zenith when, in the late 1970s, he initiated the project @i{The Royal Inscriptions of Mesopotamia Project} (RIM), one of the most successful projects in the field. Its goal is to produce up-to-date, reliable editions of all royal inscriptions from ancient Mesopotamia, a fabulous task that required the collection of thousands of scattered sources and their study in world’s museums. The RIM project, now continued by the @url{http://oracc.org/rinap/abouttheproject/index.html}{RINAP}, is perhaps the “crowning achievement” of Grayson’s prolific career (so Sweet 2004: xxvi). Grayson, who is himself the author or co-author of no fewer than five of the RIM series’ volumes, spent a great deal of his time working with cuneiform tablets at museums, and was indeed co-responsible for the publication of one of the “Sippar Collection”’s catalogues, together with E. Leichty (@bib{RN1797}). His meticulous draft transliterations, used here courtesy of J. Novotny, are a testimony to the rare combination of philological competence and historical erudition of A. K. Grayson."
      />
    ),
  },
  {
    initials: 'MJG',
    title: 'Markham J. Geller',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="Markham J. Geller is a renowned specialist in ancient Mesopotamian medicine and magic, as well as in Jewish and Late Antique science. He is widely recognized for his extensive studies on Mesopotamian medicine, its place in Ancient Near Eastern to Late Antique contexts, and his groundbreaking work in the field of Mesopotamian magic. He is the author of the monumental edition of the @i{Canonical Udug-hul Incantations} (@bib{RN2547}), which reflects his decades-long research in the area. The @url{https://www.geschkult.fu-berlin.de/e/babmed/}{BabMed – Babylonian Medicine project}, led by Geller (2013–2018), has made a significant contribution to the field by providing annotated editions of almost all known Mesopotamian medical texts and making ancient Mesopotamian medicine accessible to a wider audience. M. J. Geller has generously ceded to the eBL project thousands of pages of transliterations, prepared in the course of decades of work in the British Museum, which have greatly improved the basis of medical, magical, ritual, and bilingual texts in the Library."
      />
    ),
  },
  {
    initials: 'SP',
    title: 'Simo Parpola',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoLeft">
          <img
            className="Introduction__300px"
            src={parpola}
            alt="Parpola’s transliteration and identification of Rm.468"
          />
          <figcaption className="Introduction__caption">
            Parpola’s transliteration and identification of{' '}
            <a href="/library/Rm.468">Rm.468</a>
          </figcaption>
        </figure>
        <MarkdownParagraph text="The Finnish Assyriologist Simo Parpola is the founder and leader of the [*State Archives of Assyria*](https://assyriologia.fi/natcp/saa/) project, perhaps the most influential, field-defining project in the history of the discipline. With unrivalled erudition and inexhaustible energy, Parpola and his team have reconstructed and published almost all first-millennium Assyrian administrative texts, and made them accessible in the prestigious *SAA* series and multiple subseries. Parpola was a pioneer in the use of computers for cuneiform philology, and the technologies developed by him at the beginning of the *SAA* project are still in use today. In the course of his reconstruction of the archives of the Assyrian empire, Parpola transliterated and identified dozens of tablets in the British Museum. Parpola has kindly digitized his transliterations and made them available for their use in the Library." />
      </>
    ),
  },
  {
    initials: 'ILF',
    title: 'Irving L. Finkel',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoRight">
          <img
            className="Introduction__400px"
            src={finkeljoins}
            alt="List of “joins” in a notebook by I. L. Finkel"
          />
          <figcaption className="Introduction__caption">
            List of “joins” in a notebook by I. L. Finkel
          </figcaption>
        </figure>
        <p>
          Irving L. Finkel is a leading authority in the field of Mesopotamian
          scholarship, whose areas of expertise encompass a wide range of
          subjects, from astronomical diaries to ancient board games. Finkel has
          served as an Assistant Keeper at the British Museum’s Department of
          the Middle East for many years. Finkel’s many significant
          contributions to Assyriology stem from his discoveries of valuable
          tablets and fragments in the museum’s collection, with which he is
          uniquely acquainted. The decades of meticulous work Finkel has devoted
          to Assyriology are evident in his notebooks, which include lists of
          “joins” discovered by him, as well as careful, accurate
          transliterations of hundreds of medical and magical texts.
        </p>
      </>
    ),
  },
  {
    initials: 'WS',
    title: 'Walter Sommerfeld',
    content: (_markupService) => (
      <>
        <p>
          Walter Sommerfeld is the world&apos;s leading expert in Old Akkadian,
          the earliest attested form of the Semitic languages. Professor of
          Ancient Near Eastern Studies at the University of Marburg from 1989
          until his retirement in 2017, and recipient of the 2019
          Carsten-Niebuhr-Preis für internationalen Kulturaustausch of the
          Deutsch-Arabischen Gesellschaft, Sommerfeld has devoted much of his
          career to maintaining scholarly ties with Iraq and its academic
          community.
        </p>
        <p>
          During the years of the international embargo, when most European and
          American scholars could not or would not travel to Iraq, Sommerfeld
          continued his visits to Baghdad, working extensively at the Iraq
          Museum and providing the scholarly community there with access to
          Assyriological and other academic resources. In the course of this
          long engagement, he pioneered several methods of tablet photography
          and assembled a remarkable collection of some 30,000 photographs of
          cuneiform tablets, which he is generously making available to the
          community. The eBL project is grateful for his generous and
          disinterested sharing of these materials.
        </p>
      </>
    ),
  },
  {
    initials: 'ARG',
    title: 'Andrew R. George',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoLeft">
          <img
            className="Introduction__300px"
            src={georgetransliteration}
            alt="Transliteration by A. R. George"
          />
          <figcaption className="Introduction__caption">
            Transliteration by A. R. George
          </figcaption>
        </figure>
        <MarkupParagraph
          markupService={markupService}
          text="Andrew R. George is a highly respected Assyriologist with expertise in Mesopotamian literature, religion, and scholarship, gifted with an unrivalled epigraphic eye and philological acumen. George boasts a broad range of interests, covering topics such as Mesopotamian temples and cultic topography, literature, incantations, divination, royal inscriptions, and private letters. George is perhaps most recognized for his monumental edition of the Gilgamesh Epic (@bib{RN117}), which he has updated for the eBL Corpus (see @url{/corpus/L/1/4}{here}). Along with J. Taniguchi, George catalogued and digitized Lambert’s notebooks and also processed and published over 650 cuneiform copies from Lambert’s Nachlass (@bib{RN1013a}, @bib{RN1013ab}). George has generously donated his notebooks of transliterations for their use in the Library. George’s notebooks are a treasure trove of texts and fragments, including transliterations of hundreds of tablets in the British Museum’s “Sippar Collection”, as well as accurate editions of under-explored genres such as Late Babylonian temple rituals."
        />
      </>
    ),
  },
  {
    initials: 'USK',
    title: 'Ulla Koch',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="Ulla S. Koch is a scholar  specialist in Mesopotamian extispicy, who has made substantial contributions to this long-neglected field. Her handbook makes Mesopotamian divination accessible to a wide audience (@bib{RN160xs}); her monographs on Babylonian extispicy, particularly on the extispicy series @i{Bārûtu}, have advanced the field greatly. Her text editions have enabled the identification of many new fragments in the framework of the eBL project. In addition, Koch has furnished the eBL’s Library with her transliterations of hundreds of fragments of extispicy texts."
      />
    ),
  },
  {
    initials: 'JLP',
    title: 'Jeremiah L. Peterson',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="Jeremiah Peterson is a Sumerologist specialising in Sumerian literature of the Old Babylonian period. Gifted with an unparalleled eye for identifying even the smallest fragments, Peterson has contributed dozens of new manuscripts to the corpus of Sumerian literature. Peterson has published many fragments identified by him in several ground-breaking contributions (e.g. @bib{peterson2010sumerian3}, @bib{RN1734}, and @bib{RN306}). In addition, he is responsible for the transliteration of thousands of fragments, in particular of Old and Middle Babylonian literature and of first-millennium celestial divination, in the eBL’s Library. Peterson has kindly ceded his collection of hand copies for its use in the Library."
      />
    ),
  },
  {
    initials: 'UG',
    title: 'Uri Gabbay',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="Uri Gabbay is an Associate Professor of Assyriology at the Hebrew University of Jerusalem. He is a distinguished scholar who has made significant contributions to the study of Mesopotamian religion and scholarship. His research focuses on the reconstruction and study of Mesopotamian cultic compositions and the interpretation of Mesopotamian scholarship. His ground-breaking edition of the @i{Eršemma} prayers (@bib{RN2568}) is a testimony to his philological talent, his methodical monograph on the exegetical terms used in Akkadian commentaries (@bib{RN2779}) reveals his deep understanding with how the Mesopotamians interpretated their own textual tradition. Gabbay has generously ceded his transliterations of Emesal texts for their use in the Library."
      />
    ),
  },
  {
    initials: 'VAM',
    title: 'VAM acquisition registers',
    content: (markupService) => (
      <>
        <MarkupParagraph
          markupService={markupService}
          text="The acquisition registers of the Vorderasiatisches Museum (Staatliche Museen zu Berlin, Preußischer Kulturbesitz) were digitised within the framework of the project “Provenienz und Bestand. Online-Publikation der Erwerbungsbücher und Zugangsverzeichnisse der Staatlichen Museen zu Berlin”, initiated and funded by the Beauftragte der Bundesregierung für Kultur und Medien (see @url{https://www.smb.museum/museen-einrichtungen/vorderasiatisches-museum/sammeln-forschen/erwerbungsbuecher/}{here}). The digitised volumes are published in the online database of Heidelberg University Library (see @url{https://digi.ub.uni-heidelberg.de/diglit/smb_vorderasiatisches_museum}{here}) under a Creative Commons license."
        />
        <MarkdownParagraph text="The registers containing the cuneiform tablets with VAT numbers (VAT 1–VAT 23,988) were indexed for the eBL Library by Louisa Grill and Anita Stenke. These volumes contain descriptions of tablets from excavations conducted by the Deutsche Orient-Gesellschaft (at Aššur, Babylon, Uruk, and elsewhere) and those acquired on the antiquities market. Each entry typically includes the tablet’s number, size, date, place of origin, number of lines, source of acquisition and relevant Assyriological literature; some entries also feature a sketch, a photo, or text excerpts to aid identification of the artefact. In addition to the Berlin holdings, a separate volume devoted to the tablets from the excavations at Šuruppak and Kisurra also includes the pieces housed at the İstanbul Arkeoloji Müzeleri. The eBL team is currently processing this data further to create a more granular and structured dataset." />
      </>
    ),
  },
]
