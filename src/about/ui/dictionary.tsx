import React from 'react'
import { Markdown } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import cda from 'about/ui/static/cda.png'

export default function AboutDictionary(
  markupService: MarkupService
): JSX.Element {
  return (
    <>
      <Markdown
        text="The electronic Babylonian Library project’s dictionary endeavors to provide
        a flexible and dependable, constantly evolving reference for Akkadian vocabulary. Drawing
        on previous digital and traditional publications on Akkadian lexicography, it integrates
        several resources that have been digitized specifically for the eBL project. Reproduction
        of the contents is not possible without the permission of the publisher."
      />
      <h3>I. A Concise Dictionary of Akkadian</h3>
      <figure className="Introduction__photoRight">
        <a href="https://www.harrassowitz-verlag.de/isbn_978-3-447-04264-2.ahtml">
          <img
            className="Introduction__300px"
            src={cda}
            alt="Black, George, Postgate, A Concise Dictionary of Akkadian"
          />
        </a>
        <figcaption className="Introduction__caption">
          Black, George, Postgate, <em>A Concise Dictionary of Akkadian</em>
        </figcaption>
      </figure>
      <Markdown
        text="The very useful *CDA* (Black, J.; George, A.R.; Postgate, N., *A Concise 
              Dictionary of Akkadian*. Second (corrected) printing. SANTAG Arbeiten und 
              Untersuchungen zur Keilschriftkunde 5. Wiesbaden: Harrassowitz, ²2000) is 
              reproduced in its entirety on the eBL website, courtesy of its authors and with 
              the kind permission of B. Krauss (Harrassowitz). The dictionary entries were 
              parsed into a JSON tree by J. Laasonen. The word `id`s, extracted from the 
              lemma headings, form the basis of the Akkadian lemmatization on the eBL 
              platform. `guide words`, whose purpose is to allow the quick and univocal 
              identification of an `id`, were compiled by A. Kudriavtcev and E. Gogokhia."
      />
      <p />
      <Markdown
        text="*A Concise Dictionary of Akkadian: Justifications, Addenda and Corrigenda* is a 
              digital resource created by J. N. Postgate (see original publication 
              [here](https://web.archive.org/web/20210506222246/https://www.soas.ac.uk/cda-archive/)). 
              It is reproduced here in its entirely with the kind permission of Prof. Postgate."
      />
      <p />
      <h3>II. Akkadian-Arabic Reference Dictionary</h3>
      <Markup
        markupService={markupService}
        text="The @i{Akkadian-Arabic Reference Dictionary} has been compiled in the framework 
              of the eBL project by W. Khatabe, W. Zerkly, and A. A. Fadhil. The guide words 
              excerpted from the @bib{RN2720} have been translated into Arabic, and compared 
              with the translations of the words in @bib{RN2721} and @bib{black2000concise}, 
              and with the Arabic translations in al-Jubouri’s dictionary 
              (@bib{jaboori2016qamus})."
      />
      <Markdown
        text="The Arabic translations normally contain a basic translation of a word and also 
              some extended meanings (e.g. **eperu I**, translated as عَفْر، أرض، تراب). It 
              is hoped that this fast, eminently accessible search tool will make the rich 
              resources of the eBL platform more accessible to the Arabic-speaking world."
      />
      <h3>III. Akkadische Logogramme</h3>
      <Markdown
        text="W. Schramm’s *Akkadische Logogramme* (Göttinger Beiträge zum Alten Orient 5. 
              Göttingen, ²2010; [CC BY-ND 
              3.0](https://creativecommons.org/licenses/by-nd/3.0/de/)) is reproduced in its 
              entirety by permission of its author."
      />
      <h3>IV. Akkadische Glossare und Indizes (AfO-Register)</h3>
      <Markdown
        text="The monumental lexical collections of the Register of the *Archiv für 
              Orientforschung* (see [here]( 
              https://orientalistik.univie.ac.at/publikationen/afo/register/)) are the fruit 
              of the painstaking work of generations of scholars (1974/1977 – 2021). The 
              Register was digitized by a team led by W. Sommerfeld, and the resulting 
              collection (*Akkadische Glossare und Indizes* (AGI), see [here]( 
              https://archiv.ub.uni-marburg.de/es/2015/0015/)) is curated and updated by 
              Prof. Sommerfeld, who has kindly agreed to its reproduction here."
      />
      <p />
      <Markdown
        text="The words of Sommerfeld’s *AGI* have been imported into the eBL’s dictionary 
              by the entire eBL team. The labor of E. Gogokhia and D. López-Kuczmik in the 
              time-consuming process of disambiguating the entries, i.e. of booking 
              references under the correct homonyn (e.g. **banû I**, “good” vs. **banû II**, 
              “be(come) good”) after consulting the original publications, should be singled 
              out."
      />
      <h3>V. Supplement to the Akkadian Dictionaries</h3>
      <Markdown
        text="The “Supplement to the Akkadian Dictionaries” (*SAD*) project has the goal of 
              updating the dictionaries of the Akkadian language. Led by Michael P. Streck 
              (Leipzig), the initiative is funded by the Deutschen Forschungsgemeinschaft as 
              a long-term project. The results of the project are published on the website of 
              the Altorientalisches Institut of the Universität Leipzig 
              ([here](https://www.gkr.uni-leipzig.de/altorientalisches-institut/forschung/supplement-to-the-akkadian-dictionaries)).
              The project’s director, Michael P. Streck, has kindly consented to the reproduction
              of the “Supplement” on the eBL platform."
      />
    </>
  )
}
