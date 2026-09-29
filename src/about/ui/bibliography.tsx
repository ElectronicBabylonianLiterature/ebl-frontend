import React from 'react'
import { MarkdownParagraph } from 'common/ui/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import afoRegisterCover from 'about/ui/static/afoRegister.png'
import { indexedPublications } from 'about/ui/indexedPublications'

export default function AboutBibliography(
  markupService: MarkupService,
): JSX.Element {
  return (
    <>
      <h3>I. Bibliography</h3>
      <MarkdownParagraph
        text="One of the objectives of the eBL platform is to provide a complete and constantly
        updated bibliography of publications of cuneiform tablets. To this end, books
        and articles are regularly indexed and the indices are added to the Library and Corpus.
        Hundreds of books and articles have been catalogued for the eBL, especially by S. Arroyo, C. 
        Dankwardt, E. Gogokhia, L. Grill, G. Habets, K. Kashani, D. López, F. Müller, L. Sáenz,
        and M. Scheiblecker."
      />
      <MarkdownParagraph
        text="The reference collection of the eBL platform consists of almost 21,500 entries.
        The Library contains a total of 368,002 references to these, the Corpus
        5,432 (as of February 2026). A complete list of the ca. 1100 books and articles
        that have been fully and systematically indexed by the project staff is given below:"
      />
      <h3 id="afo-register">II. AfO-Register</h3>
      <MarkdownParagraph
        text="The field of Assyriology is fortunate to have a bibliographical repertoire that
        has been published continuously since the 1970s. The
        [AfO-Register](https://orientalistik.univie.ac.at/publikationen/afo/register/) (Archiv
        für Orientforschung: Register Assyriologie), curated by the Department of Near
        Eastern Studies of the University of Vienna, is an essential bibliographical
        tool for Ancient Near Eastern Studies. Starting with Volume 25 (1974–1977),
        the AfO-Register has published comprehensive bibliographies of new Assyriological
        literature and an index in most volumes, categorized by subject areas, Akkadian
        and Sumerian words, and texts and passages. With the kind permission of the AfO
        Redaktion, the register was digitized and made searchable by the eBL team, thus
        enhancing its accessibility for researchers, students, and enthusiasts interested
        in the history and culture of Ancient Mesopotamia."
      />
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__250px"
          src={afoRegisterCover}
          alt="Cover of AfO-Register"
        />
        <figcaption className="Introduction__caption">
          Cover of AfO-Register 2015.
        </figcaption>
      </figure>
      <MarkdownParagraph
        text="The digitization has been carried out in two phases. W. Sommerfeld and his
        team started the digitization of the AfO Registers Textstellen in the 2000s, and
        succeeded in transforming issues 26 to 35 into a database. The fruits of this work,
        interrupted in 2011, were not made available to the public, but were sent to several
        colleagues. The eBL team undertook the digitization of the remaining AfO Registers
        (38/39 to 54) from 2022 to 2023. Initially, the text underwent recognition through
        Google Cloud Vision. Subsequently, a student assistant (C. Dankwardt) invested
        several months in rectifying OCR errors and implementing code to systematically
        organize the data into a database. Following the conversion to a database, another
        assistant (L. Sáenz) spent months meticulously reviewing the file and standardizing
        references using the sofware OpenRefine. Given the multi-generational span of the AfO
        Registers, certain inconsistencies arose during the merging of all files: for instance,
        some AfO-Register refer to “Atram-ḫasīs”, some to “Atramhasis”. Although inconsequential
        for traditional use, this sort of variation held significant importance for the
        usability of the database."
      />

      <MarkdownParagraph
        text="The eBL interface has been implemented by I. Khait. Efforts were made to correlate
        references in the AfO-Register with data records in the eBL platform. Currently,
        approximately 8,700 out of the 40,000 entries can be linked to eBL records
        (e.g., AbB 7, 49 with [BM.67306](/library/BM.67306)). Ongoing manual revision
        is expected to add a few thousand more links. Considering the incremental benefit, it
        seems appropriate to release the database in its current state and refine it further in the future."
      />
      <h3>III. Fully Indexed Books and Articles</h3>
      {indexedPublications.map(({ letter, references }) => (
        <React.Fragment key={letter}>
          <h4>{letter}</h4>
          <Markup markupService={markupService} text={references.join(' ')} />
        </React.Fragment>
      ))}
    </>
  )
}
