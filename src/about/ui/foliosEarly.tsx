import React from 'react'
import { MarkdownParagraph } from 'common/ui/Markdown'
import MarkupParagraph from 'about/ui/MarkupParagraph'
import { FolioEntry } from 'about/ui/FolioEntry'
import bezold from 'about/ui/static/bezold.jpg'
import geers from 'about/ui/static/geers.jpg'
import smithdt1 from 'about/ui/static/smithdt1.jpg'
import strassmaier from 'about/ui/static/strassmaier.jpg'
import strassmaiercopies from 'about/ui/static/strassmaiercopies.jpg'

export const earlyFolios: FolioEntry[] = [
  {
    initials: 'GS',
    title: 'George Smith (26 March 1840 – 19 August 1876)',
    content: (markupService) => (
      <>
        <MarkupParagraph
          markupService={markupService}
          text="The pioneering Assyriologist George Smith became famous in 1872 for his discovery of a Babylonian version of the Flood story. Subsequently he led an expedition to Mesopotamia to excavate in Nineveh in 1874–1875, and his findings form the base of the British Museum’s Sm and DT collections. In his notebooks he carefully copied the tablets found during his excavations, as well as many other tablets he was able to examine in The British Museum. Interestingly, Smith’s copies often display the tablets in a better shape than their current state (see @bib{RN117@412–414 and 885} and @bib{RN2877})."
        />
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
        <p>
          In one of his last diaries, dated August 1876, George Smith states: “I
          intended to work it out but desire now that my antiquities and notes
          may be thrown open to all students[.] I have done my duty thoroughly”
          (Add MS 30425 f. 28a). Smith’s notebooks are kept at the British
          Library; a provisional catalogue of them was prepared by E. Jiménez.
          All notebooks containing copies of cuneiform tablets (VII, XI, XII,
          XIV, and XVII) have been digitized with funds provided by a Sofia
          Kovalevskaja Award (Alexander von Humboldt Stiftung). The tablets were
          copied by Smith before they were given museum numbers, so their
          identification is often challenging. Those that could be identified
          are displayed in the Library, e.g. <a href="/library/DT.1">DT.1</a>.
        </p>
      </>
    ),
  },
  {
    initials: 'JS',
    title: 'Johann Strassmaier, S.J. (15 May 1846 – 11 January 1920)',
    content: (markupService) => (
      <>
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
        <MarkupParagraph
          markupService={markupService}
          text="Johann Strassmaier, S.J., was a scholar “convinced that it was a waste of time to compile an Assyrian Dictionary, or to write a history of the Sumerian and Babylonian civilizations, whilst so many tens of thousands of tablets in the British Museum and elsewhere remained unpublished; and he determined to devote himself to copying texts and publishing new material.” (@bib{wallisbudge1925rise@228}). For that reason, “for about twenty years Strassmaier copied tablets daily in the Museum from 10 a.m. to 4 p.m.; and he must have copied half the Collection.” (@bib{wallisbudge1925rise@229}). He copied in a systematic way a large number of tablets from The British Museum’s “Babylon Collection,” with a particular emphasis on economic documents and astrological/astronomical material."
        />
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
        <p>
          The two collections of Strassmaier’s copies (I and II) were reunited
          in the Pontifical Biblical Institute by W. R. Mayer in the early
          1980s, combining what J. Schaumberger had left to the Biblicum after
          his death in 1955 with portions of the collections kept in Gars am Inn
          and in The British Museum. Two different catalogues of the copies were
          prepared by Mayer, who also collated a large number of the tablets in
          the British Museum. The collections were digitized in the Pontifical
          Biblical Institute in 2019, courtesy of W. R. Mayer and of its Rector
          M. F. Kolarcik.
        </p>
      </>
    ),
  },
  {
    initials: 'CB',
    title: 'Carl Bezold (18 May 1859 – 21 November 1922)',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoRight">
          <img
            className="Introduction__200px"
            src={bezold}
            alt="Carte de visite of Bezold at the British Museum (courtesy J. Taylor)"
          />
          <figcaption className="Introduction__caption">
            Carte de visite of Bezold at the British Museum (courtesy J. Taylor)
          </figcaption>
        </figure>
        <MarkdownParagraph text="Carl Bezold, Professor of Assyriology in Heidelberg, completed at the end of the 19th century the daunting task of cataloguing all fragments of the Kuyunjik collection. His magnum opus *Catalogue of the Cuneiform Tablets in the Kouyunjik Collection of the British Museum*, published between 1889 and 1899, has been the foundation of all research on the Library of Assurbanipal since its publication, and is still today useful. As preparation for that work, Bezold inscribed thousands of pages, sometimes with simple stenographic notes with general information, sometimes with full copies of the fragments he catalogued." />
        <MarkupParagraph
          markupService={markupService}
          text="Around 1,000 copies from Bezold’s Nachlass are now kept in the Heidelberg Universitätsbibliothek. They were kindly digitized at the request of the electronic Babylonian Literature project in 2018, thanks to the help of Clemens Rohfleisch. The copies and notes were catalogued by the electronic Babylonian Literature staff. The Nachlass Bezold, which had previously been almost entirely inaccessible to research (@bib{RN51@43–44}), is now made available on the eBL website."
        />
      </>
    ),
  },
  {
    initials: 'FWG',
    title: 'Friedrich W. Geers (24 January 1885 – 29 January 1955)',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoLeft">
          <img
            className="Introduction__400px"
            src={geers}
            alt="Collection of Geers’s copies once at the Oriental Institute"
          />
          <figcaption className="Introduction__caption">
            Collection of Geers’s copies once at the Oriental Institute
          </figcaption>
        </figure>
        <MarkupParagraph
          markupService={markupService}
          text="Friedrich W. Geers was “a quiet man, of a shy and retiring nature, who always strove to keep his lonely private life and his personal attitudes hidden under a cloak of friendly silence” (@bib{RN3229}). From 1924 until the break of the Second World War, Geers regularly visited the Students’ Room of the British Museum in order to copy, more or less systematically, the tablets mentioned in Bezold’s @i{Catalogue}. He spent a great deal of his career studying his copies and was able to identify innumerable fragments, but published very few of them. His notebooks of transliterations, which were photographed and reproduced during his lifetime, have been so widely used by scholars and in such a profitable manner that a memorial volume was dedicated to Geers no fewer than twenty years after his life by the most renowned scholars of the time. The “harmlose Geers,” as Landsberger calls him (@bib{RN2045@1257}), single-handedly copied over 7,000 tablets and fragments of Ashurbanipal’s libraries and demonstrates in his copies a profound knowledge of the Mesopotamian literature and an unmatched expertise with the first-hand study of cuneiform sources."
        />
        <MarkupParagraph
          markupService={markupService}
          text="Two copies of Geers’ notebooks are available on the eBL platform: First, the personal copy of M.J. Geller, digitized by L. Vacín, previously accessible at https://cdli.ucla.edu/downloads. This copy includes several valuable annotations by W.G. Lambert. Additionally, the copy of the notebooks once held by the Oriental Institute of the University of Chicago has also been digitized. It was kindly donated by Prof. Martha T. Roth to the Institut für Assyriologie und Hethitologie of Munich University. In this version, which also features annotations by scholars such as W.G. Lambert and R. Borger, the individual copies have been cut and rearranged according to museum numbers."
        />
      </>
    ),
  },
  {
    initials: 'HHF',
    title: 'Hugo Heinrich Figulla (27 December 1885 – 6 February 1969)',
    content: (markupService) => (
      <MarkupParagraph
        markupService={markupService}
        text="Hugo Heinrich Max Figulla was born in Loslau (today Wodzisław Śląski) in Silesia. He began his university studies in Berlin and became a student of Bruno Meissner in Breslau (today Wrocław). During his long career, Figulla published hundreds of Neo-Babylonian letters, Old Babylonian and Neo-Babylonian legal and administrative documents (from Woolley’s excavations at Ur, among others) and Hittite texts in collections in Berlin, Constantinople and London. After having left Germany, he took up the task of cataloguing the vast Babylonian Collections of the British Museum. Up to then, the non-Assyrian tablets of the museum had received less attention than the Kuyunjik Collection catalogued by Carl Bezold and Leonard W. King. Figulla published a first volume on BM 12230–BM 15230 in 1961, a Sisyphean task according to one of the reviewers (@bib{Krecher1967Figulla@311}). In the course of his work, which was certainly laborious but by no means futile, Figulla prepared hundreds of preliminary transliterations and hand copies; these reveal his knowledge of not only the periods covered by his previous publications but also of the Ur III administration. Figulla’s notebooks were digitized by Manuel Molina."
      />
    ),
  },
]
