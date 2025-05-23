import React from 'react'
import { MarkdownParagraph } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import aro from 'about/ui/static/aro.jpg'
import bezold from 'about/ui/static/bezold.jpg'
import borgerlambert from 'about/ui/static/borgerlambert.jpg'
import finkeljoins from 'about/ui/static/finkeljoins.jpg'
import geers from 'about/ui/static/geers.jpg'
import georgetransliteration from 'about/ui/static/georgetransliteration.jpg'
import lambert from 'about/ui/static/lambert.jpg'
import leichty from 'about/ui/static/leichty.jpg'
import mayertransliteration from 'about/ui/static/mayertransliteration.jpg'
import reinernotebooks from 'about/ui/static/reinernotebooks.jpg'
import parpola from 'about/ui/static/parpola.png'
import shaffer from 'about/ui/static/shaffer.jpg'
import smithdt1 from 'about/ui/static/smithdt1.jpg'
import strassmaier from 'about/ui/static/strassmaier.jpg'
import strassmaiercopies from 'about/ui/static/strassmaiercopies.jpg'

function MarkupParagraph({
  text,
  markupService,
}: {
  text: string
  markupService: MarkupService
}): JSX.Element {
  return (
    <p>
      <Markup markupService={markupService} text={text} />
    </p>
  )
}

export const folios: {
  initials: string
  title: string
  content: (markupService: MarkupService) => JSX.Element
}[] = [
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
  {
    initials: 'AHA',
    title: 'Asger Hartvig Aaboe (26 April 1922 – 19 January 2007)',
    content: (markupService) => (
      <>
        <MarkupParagraph
          markupService={markupService}
          text="Asger Aaboe was a Danish-American historian of mathematics and astronomy, renowned for his contributions to the study of Babylonian mathematical astronomy. Educated at the University of Copenhagen, he earned his Ph.D. at Brown University under Otto Neugebauer in 1957. Aaboe’s work, particularly on Babylonian lunar theory and System A methodologies, transformed understanding of ancient astronomical techniques. He held joint professorships at Yale in the History of Science, Mathematics, and Near Eastern Languages until his retirement in 1992. His publications include the influential @i{Episodes from the Early History of Mathematics} (@bib{aaboe1964episodes}) and @i{Episodes from the Early History of Astronomy} (@bib{aaboe2001episodes})."
        />
        <MarkdownParagraph text="Aaboe’s folios, kindly donated by John Steele (Brown University), contain transliterations of tablets primarily from the British Museum’s Babylon Collection, with additional materials from the Sippar and Istanbul Archaeological Museums’ Uruk Collection. His notes also reflect research conducted at the Iraq Museum in October 1968, when he was “admitted to \[the\] magazine and went through two trays\[;\] selected rather freely from the trays, \[and\] made \[an\] application to \[the\] Dir\[ector\] to see them”" />
      </>
    ),
  },
  {
    initials: 'ER',
    title: 'Erica Reiner (4 August 1924 – 31 December 2005)',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoRight">
          <img
            className="Introduction__300px"
            src={reinernotebooks}
            alt="Notebooks by E. Reiner"
          />
          <figcaption className="Introduction__caption">
            Notebooks by E. Reiner
          </figcaption>
        </figure>
        <MarkdownParagraph text="Erica Reiner was a Hungarian-American Assyriologist, one of the main forces behind the epoch-making *The Assyrian Dictionary of the Oriental Institute of the University of Chicago*. During her long and productive career, Reiner was the world’s foremost expert in Mesopotamian celestial divination, a field in which she produced several fundamental studies, such as the series of monographs *Babylonian Planetary Omens* (with D. Pingree)." />
        <MarkupParagraph
          markupService={markupService}
          text="In her mid-70s, Reiner produced a catalogue of all celestial omen tablets in the British Museum known to her (@bib{RN2030}). The basis for that catalogue was her extensive collection of transliterations and notes, made in the course of many years of study, correspondence with colleagues, and visits to the Students’ Room. Reiner’s collection, bequeathed to Hermann Hunger, was donated by the latter to the Institut für Assyriologie und Hethitologie of Munich University, and is made available here with Hunger’s kind permission."
        />
      </>
    ),
  },
  {
    initials: 'WGL',
    title: 'W. G. Lambert (26 February 1926 – 9 November 2011)',
    content: (markupService) => (
      <>
        <MarkupParagraph
          markupService={markupService}
          text="W. G. Lambert “made a greater contribution to the continuing task of recovering and understanding Babylonian literature than any other member of his generation” (@bib{RN3226@337}). Author of the influential monographs @i{Babylonian Wisdom Literature} and @i{Babylonian Creation Myths}, Lambert was the leading expert in Babylonian literature for over fifty years. In his several books and dozens of articles, Lambert reconstructed an astonishing number of previously unknown texts, setting high philological standards for the field. The thousands of fragments that he assessed in his pursuit were carefully transliterated in his collection notebooks, which represent the fruits of over fifty years of painstaking labor. Lambert granted access to his notebooks to several scholars throughout his life. R. Borger was able to use this “ungeheuer reichhaltige Material” (@bib{RN1445@viii}) for the compilation of the second band of his @i{Handbuch der Keilschriftliteratur} (@bib{RN1445@1975}). This collection of notebooks, catalogued and digitized by Lambert’s academic executor, A. R. George, and used here with his permission, forms the core of the Library."
        />
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
        <MarkupParagraph
          markupService={markupService}
          text="Another source of transliterations is Lambert’s notebook of divinatory texts. The @i{Chicago Assyrian Dictionary} requested from Lambert a standard edition of the vast divinatory treatise @i{Šumma ālu}, “If a City,” in order for the Chicago lexicographers to excerpt it for their work (@bib{RN3226@344}). In preparation for that edition, Lambert undertook the colossal task of transliterating all known manuscripts of the treatise and related texts, both published an unpublished. Lambert shared his “Heft mit Omentexten” (@bib{RN1445@viii}) with several scholars around the world: the copy used in the Library was, in fact, found among Leichty’s papers."
        />
        <MarkupParagraph
          markupService={markupService}
          text="In addition, a large assemblage of small fragments from the British Museum’s Kuyunjik collection was discovered by J. E. Reade and C. B. F. Walker in the 1970s (@bib{RN51@44–45}). Lambert was commissioned with cataloguing these “high K-numbers,” a total of 5,500 small fragments from the libraries of Ashurbanipal (@bib{RN684}). Lambert prepared meticulous transliterations of each of these tablets (K 16801 – K 22202), and passed them on to colleagues specializing in different areas. This vast collection of transliterations, prepared between 1976 and 1990s, is now kept in its entirety in the British Museum, and is made accessible here courtesy of A. R. George and of Jon Taylor (Assistant Keeper of the Cuneiform Collections of the British Museum)."
        />
      </>
    ),
  },
  {
    initials: 'JA',
    title: 'Jussi Aro (5 June 1928 – 11 March 1983)',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoLeft">
          <img
            className="Introduction__150px"
            src={aro}
            alt="J. Aro in 1955 (courtesy S. Aro-Valjus)"
          />
          <figcaption className="Introduction__caption">
            J. Aro in 1955 (courtesy S. Aro-Valjus)
          </figcaption>
        </figure>
        <MarkupParagraph
          markupService={markupService}
          text="The Finnish Assyriologist and Semitist Jussi Aro was a prolific author, translator, and commentator, renowned for his extensive knowledge of the ancient and modern Near East. He held the chair of Oriental Literature (later Semitic Languages) at the University of Helsinki from 1965 until his untimely death in 1983. Aro was a polyglot whose passion for languages began in early childhood, leading him to study theology, Greek literature, Semitic languages, and Assyriology at the University of Helsinki, with additional studies in Chicago (where he also worked for the @i{Chicago Assyrian Dictionary}) and Göttingen. His dissertation on Middle Babylonian grammar (@bib{aro1955studien}) was the fourth Assyriological dissertation written in Finland (after Knut Tallqvist, Harri Holma, and Armas Salonen, Aro’s teacher in Assyriology, see @bib{arovaljus2012assyriologiksi}). After his appointment as professor of Oriental Literature in 1965, Aro concentrated on Arabic and other Semitic languages. However, the numerous reviews of Assyriological publications he wrote afterward demonstrate his continued keen interest in the Akkadian language and cuneiform sources."
        />
        <MarkdownParagraph text="Assyriological legacy materials of Jussi Aro, including copies of cuneiform fragments from the British Museum, were generously shared with the eBL project by his daughter, Dr. Sanna Aro-Valjus." />
      </>
    ),
  },
  {
    initials: 'RB',
    title: 'Riekele Borger (24 May 1929 – 27 December 2010)',
    content: (markupService) => (
      <>
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
        <MarkupParagraph
          markupService={markupService}
          text="Riekele Borger, professor of Assyriology in Göttingen, was one of the most prominent Assyriologists in the 20th century. His monumental reference works (@i{Handbuch der Keilschriftliteratur} and @i{Mesopotamisches Zeichenlexikon}, among others) are a testimony to Borger’s life-long interest in providing Assyriology with the bibliographical, lexicographical, and epigraphical foundations he so sorely missed during his studies, a time he referred to as the “düstere handbuchlose Zeitalter der Assyriologie” (@bib{RN680@v}). Two additional unfinished monumental works by Borger, the @i{Sumerisches Handwörterbuch hauptsächlich aufgrund der Bilinguen} and his @i{Katalog der Kuyunjik-Sammlung}, are published posthumously on the website of the electronic Babylonian Literature project."
        />
        <MarkdownParagraph text="Borger’s transliterations of Kuyunjik tablets were made in the course of three visits to the British Museum between 2006 and 2010, in the framework of The British Museum’s Ashurbanipal Library Project. The goal was to complete his catalogue of the Kuyunjik collection, a project sadly thwarted by his death in 2010. The transliterations were digitized by the eBL project in 2020, with the kind permission of Angelika Borger, and thanks to the support of Prof. A. Zgoll (Göttingen)." />
      </>
    ),
  },
  {
    initials: 'AS',
    title: 'Aaron Shaffer (2 January 1933 – 5 April 2004)',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoLeft">
          <img
            className="Introduction__250px"
            src={shaffer}
            alt="Aaron Shaffer in Chicago (courtesy N. Wasserman)"
          />
          <figcaption className="Introduction__caption">
            Aaron Shaffer working in Chicago (courtesy N. Wasserman)
          </figcaption>
        </figure>
        <MarkupParagraph
          markupService={markupService}
          text="Aaron Shaffer was professor at the Hebrew University of Jerusalem. Educated at the University of Toronto and the University of Pennsylvania, Shaffer wrote his dissertation on the Sumerian sources of the Epic of Gilgamesh (@bib{shaffer1963sumerian}), two topics – the Sumerian language’s relationship to Akkadian and the Epic of Gilgamesh – which he pursued throughout his life. At the Hebrew University, he pioneered the use of computers by creating a database of Sumerian literary and lexical texts (@bib{WassermanObitShaffer@339}). Over more than three decades Shaffer visited the British Museum every year and prepared copies of Sumerian and Akkadian literary texts. His work, which focused mostly on the Old Babylonian literary texts from Ur, resulted in the posthumous publication of @i{Ur Excavations Texts VI: Literary and Religious Texts, Third Part} in 2006 (@bib{UET_6_3})."
        />
        <p>
          Shaffer’s large collection of photographs, many of them of Ur tablets,
          are in the possession of Nathan Wasserman, who has catalogued and
          digitized them and generously shared them with the eBL.
        </p>
      </>
    ),
  },
  {
    initials: 'EL',
    title: 'Erle V. Leichty (7 August 1933 – 19 September 2016)',
    content: (markupService) => (
      <>
        <MarkupParagraph
          markupService={markupService}
          text="Erle Leichty reached international fame when, as a 25-year old graduate student at the University of Chicago, discovered the then missing beginning of the Babylonian @i{Poem of the Righteous Sufferer} (@bib{RN3228}). His dissertation, a pioneering edition of the teratomantic series “If an Anomaly” (@i{Šumma Izbu}, @bib{RN839}) marked the beginning of his life-long interest on the divinatory treatises of Ancient Mesopotamia. He and his students set out to reconstruct some of the largest Mesopotamian series, and to that end he amassed a collection of thousands of transliterations, chiefly of tablets from the libraries of King Ashurbanipal (668–631 BCE). Throughout his life, he generously made these transliterations available to students and colleagues, who often expressed their gratitude in the prologues of books and articles."
        />
        <MarkupParagraph
          markupService={markupService}
          text="Erle Leichty spent most summers of his career in London (@bib{RN3227}), where he painstakingly prepared catalogues of the vast “Sippar Collection” of the British Museum, consisting of over 40,000 tablets. Published in Leichty 1986, Leichty/Grayson 1987, and Leichty/Finkelstein/Walker 1988, the catalogues made the invaluable wealth of these collections, until then largely inaccessible, fully available to researchers. While preparing the catalogues, Leichty transliterated hundreds of tablets, focusing on divinatory texts and on Neo-Babylonian administrative documents, in notebooks and loose pages of paper."
        />
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
        <p>
          Leichty must have imagined that his notebooks would one day be used
          for the digital reconstruction of cuneiform literature, since in one
          of his notebooks he writes: “many r[igh]t sides of omens too
          fragmentary to identify but might be good for computer search” (EL NB
          911, see the adjoining image).
        </p>
        <p>
          The transliterations of Erle Leichty are used here with the generous
          permission of Steve Tinney, Associate Curator of the Babylonian
          Section (Penn Museum of Archaeology and Anthropology). Thanks are
          expressed to Phil Jones and his team, who were responsible for the
          scanning of part of them.
        </p>
      </>
    ),
  },
  {
    initials: 'JPB',
    title: 'John P. Britton (6 December 1939 – 8 June 2010)',
    content: (markupService) => (
      <>
        <MarkdownParagraph text="John P. Britton was a historian of astronomy who specialized in Babylonian astronomical systems. Educated at Yale University with a Ph.D. under Asger Aaboe, Britton had an unusual career path, working in investment management before returning to academic research in the mid-1980s. His research focused primarily on Babylonian lunar theories (System A and System B) and their mathematical foundations. Britton published over twenty scholarly articles that demonstrated how Babylonian scribes developed their astronomical parameters and algorithms." />
        <MarkdownParagraph text="The folios in the eBL collection were kindly donated by John Steele (Brown University) and mostly contain transliterations of mathematical and astronomical tablets in the British Museum’s Sippar Collection." />
      </>
    ),
  },
  {
    initials: 'SJL',
    title: 'Stephen J. Lieberman (1943 – 1992)',
    content: (markupService) => (
      <>
        <MarkdownParagraph text="Stephen J. Lieberman was Research Associate at the Sumerian Dictionary Project of the University of Pennsylvania from 1981 until his untimely death in 1992. In this decade, Lieberman amassed a large photographic collection, numbering well over 4,000 photographs of tablets in the British Museum, the University of Pennsylvania Museum of Archaeology and Anthropology, the Frau Professor Hilprecht Collection of Babylonian Antiquities, and the Istanbul Archaeology Museums, among others. The collection of photographs comprises mostly lexical material, most of it published as part of *Materials for the Sumerian Lexicon* series." />
        <MarkdownParagraph text="Lieberman’s photographs, kept in the Babylonian Section of the University of Pennsylvania Museum of Archaeology and Anthropology, were kindly shared by Prof. Niek Veldhuis." />
      </>
    ),
  },
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
    initials: 'WRM',
    title: 'Werner R. Mayer, S.J.',
    content: (markupService) => (
      <>
        <figure className="Introduction__photoRight">
          <img
            className="Introduction__400px"
            src={mayertransliteration}
            alt="Transliteration by W. R. Mayer"
          />
          <figcaption className="Introduction__caption">
            Transliteration by W. R. Mayer
          </figcaption>
        </figure>
        <MarkdownParagraph text="Werner R. Mayer is an Assyriologist specializing in Akkadian grammar and literature from the first millennium BCE. Mayer’s work combines in an unparalleled manner philological rigor and literary inventiveness, a rare conjunction that has led to many far-reaching lexical and grammatical discoveries. Mayer has also worked extensively on the reconstruction of first-millennium devotional poetry, both on the basis of the Strassmaier’s folios (s. above), and in the course of numerous visits to the British Museum. Mayer has generously made available his large collection of accurate transliterations of literary texts for use in the Library." />
      </>
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
]
