import React from 'react'
import { MarkdownParagraph } from 'common/ui/Markdown'
import MarkupParagraph from 'about/ui/MarkupParagraph'
import { FolioEntry } from 'about/ui/FolioEntry'
import aro from 'about/ui/static/aro.jpg'
import borgerlambert from 'about/ui/static/borgerlambert.jpg'
import lambert from 'about/ui/static/lambert.jpg'
import leichty from 'about/ui/static/leichty.jpg'
import mayertransliteration from 'about/ui/static/mayertransliteration.jpg'
import reinernotebooks from 'about/ui/static/reinernotebooks.jpg'
import shaffer from 'about/ui/static/shaffer.jpg'

export const twentiethCenturyFolios: FolioEntry[] = [
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
    initials: 'WRM',
    title: 'Werner R. Mayer, S.J. (5 November 1939 – 15 December 2025)',
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
]
