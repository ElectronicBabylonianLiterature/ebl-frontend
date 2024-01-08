import React from 'react'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import eblteam2020 from 'about/ui/static/eblteam2020.jpg'
import eblteam2023 from 'about/ui/static/eblteam2023.jpg'

export default function AboutProject(
  markupService: MarkupService
): JSX.Element {
  return (
    <>
      <h3>History of the Project</h3>
      <span className="Introduction__quotation">
        <span>[… who s]aw the Deep, […] the country,</span>
        <br />
        <span className="Introduction__secondLineOfParallelism">
          [who] knew […], […] all […]
        </span>
        <br />
        <span>[… who] saw the Deep, […] the country,</span>
        <br />
        <span className="Introduction__secondLineOfParallelism">
          [who] knew […], […] all […]
        </span>
      </span>
      <span className="Introduction__quotation">
        He who saw the Deep, the foundation of the country,
        <br />
        <span className="Introduction__secondLineOfParallelism">
          who knew the proper ways, was wise in all matters!
        </span>
        <br />
        Gilgamesh, who saw the Deep, the foundation of the country,
        <br />
        <span className="Introduction__secondLineOfParallelism">
          who knew the proper ways, was wise in all matters!
        </span>
      </span>
      <Markup
        markupService={markupService}
        text="The first quote represents the beginning of the Epic of Gilgamesh as known from 
              the 19th century onwards (@bib{RN2484@14}). The second shows the text fully 
              restored, in the form it achieved over one hundred years later, in 2007 (see 
              @bib{RN271}). Throughout the twentieth century, therefore, only the fragmentary 
              version of the prologue of the Epic was known: generations of readers, when 
              first confronted with the foremost classic of ancient Mesopotamian literature, 
              experienced the frustration of reading a fragmentary text, of being allowed 
              merely a latticed glimpse into the world of the Babylonians. This frustration 
              is every cuneiform scholar’s bread and butter, often to be consumed “when one 
              struggles with a fragmentary text in the Students’ Room of the British Museum 
              and suspects with more or less reason that unidentified pieces are lying in 
              drawers just a few meters away” (@bib{RN51@41–42}). It is precisely against 
              this frustration that the Electronic Babylonian Literature Project has declared 
              war."
      />
      <Markup
        markupService={markupService}
        text="The Electronic Babylonian Literature (eBL) Project started in April 2018 at 
              Ludwig Maximilian University of Munich thanks to the generous support of a 
              Sofja Kovalevskaja Award from the Alexander von Humboldt Fundation. The goal of 
              the project is to bring Babylonian literature to the point of what can 
              currently be reconstructed. Moreover, it aims to make accessible a large mass 
              of transliterations of fragments of cuneiform tablets and a tool to allow 
              scholars to search it quickly, thus providing a lasting solution to the abiding 
              problem of the fragmentary character of Mesopotamian Literature."
      />
      <h3>List of Participants</h3>
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__450px"
          src={eblteam2020}
          alt="The eBL Team in 2020"
        />
        <figcaption className="Introduction__caption">
          The eBL Team in 2020
        </figcaption>
      </figure>
      <h4>Project’s Staff (Cuneiformists)</h4>
      <ul>
        <li>Enrique Jiménez, Principal Investigator</li>
        <li>Zsombor Földi, Editor</li>
        <li>Aino Hätinen, Editor</li>
        <li>Adrian Heinrich, Editor (until 03.2022)</li>
        <li>Tonio Mitto, Editor (PhD student, until 10.2022)</li>
        <li>Geraldina Rozzi, Editor (since 01.2021)</li>
      </ul>
      <h4>Project’s Staff (Developers)</h4>
      <ul>
        <li>Ilya Khait (since 03.2022)</li>
        <li>Jussi Laasonen (until 04.2022)</li>
        <li>Fabian Simonjetz (since 04.2022)</li>
      </ul>
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__450px"
          src={eblteam2023}
          alt="The eBL Team in 2023"
        />
        <figcaption className="Introduction__caption">
          The eBL Team in 2023
        </figcaption>
      </figure>
      <h4>Student Assistants</h4>
      <ul>
        <li>Yunus Cobanoglu (Computer Science)</li>
        <li>Cyril Dankwardt</li>
        <li>Ekaterine Gogokhia</li>
        <li>Louisa Grill</li>
        <li>Wasim Khatabe</li>
        <li>Alexander Kudriavtcev (until 2021)</li>
        <li>Daniel López-Kuczmik</li>
        <li>Mays Al-Rawi</li>
        <li>Wadieh Zerkly</li>
      </ul>
      <h4>External Collaborators</h4>
      <ul>
        <li>Anmar A. Fadhil (University of Baghdad)</li>
        <li>Benjamin R. Foster (Yale University)</li>
        <li>Alberto Giannese (British Museum)</li>
        <li>Carmen Gütschow</li>
        <li>Ivor Kerslake (British Museum)</li>
        <li>Felix Müller (Universität Göttingen)</li>
        <li>Jeremiah Peterson</li>
        <li>Luis Sáenz (Universität Heidelberg)</li>
        <li>Henry Stadhouders</li>
        <li>Junko Taniguchi</li>
        <li>Abraham Winitzer (University of Notre Dame)</li>
      </ul>
      <h3>Participating Institutions</h3>
      <ul>
        <li>
          <a href="http://www.britishmuseum.org/">The British Museum</a>,
          London. A particular debt of gratitude is owed to Dr. Jonathan Taylor,
          Assistant Keeper (Department of the Middle East) for his continued
          support of the project. Photographs of cuneiform tablets kept in the
          British Museum are published online with the kind permission of the
          Trustees of the British Museum.
        </li>
        <li>
          <a href="http://www.penn.museum/">
            University of Pennsylvania Museum of Archaeology and Anthropology
          </a>
          . Thanks are expressed to Prof. Stephen J. Tinney, Deputy Director and
          Chief Curator.
        </li>
        <li>
          <a href="http://nelc.yale.edu/babylonian-collection">
            Yale Babylonian Collection
          </a>
          , Yale University. Thanks are expressed to Dr. Agnete W. Lassen,
          Associate Curator; to Prof. Eckart Frahm; and to Dr. Klaus
          Wagensonner.
        </li>
      </ul>
    </>
  )
}
