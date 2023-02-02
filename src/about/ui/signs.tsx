import React from 'react'
import { Markdown } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

import fossey from 'about/ui/static/fossey.jpg'
import meszl from 'about/ui/static/meszl.jpg'

export default function AbouSigns(markupService: MarkupService): JSX.Element {
  return (
    <>
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
      <Markup
        markupService={markupService}
        text="The sign list of the electronic Babylonian Literature project is based on the @url{http://oracc.org/ogsl/}{Oracc Global Sign List}, used by permission of S. Tinney. Deviations from that list are not marked in any particular way."
      />
      <p />
      <Markup
        markupService={markupService}
        text="The fonts used in the epigraphy section were all designed by S. Vanserveren, who has made them freely available for the scientific community. They can be downloaded at @url{https://www.hethport.uni-wuerzburg.de/cuneifont/}{this link}. Dr. Vanserveren was kind enough to develop an entire font (Esagil, Neo-Babylonian) at our request."
      />
      <p />
      <Markup
        markupService={markupService}
        text="The logograms that appear with each sign are cited from W. Schramm’s @i{Akkadische Logogramme} (Göttinger Beiträge zum Alten Orient 5. Göttingen, ²2010; @url{https://creativecommons.org/licenses/by-nd/3.0/de/}{CC BY-ND 3.0}). The book is used by permission of its author."
      />
      <h3>II. Mesopotamisches Zeichenlexikon</h3>
      <figure className="Introduction__photoLeft">
        <a href="https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514">
          <img
            className="Introduction__300px"
            src={meszl}
            alt="Borger, Mesopotamisches Zeichenlexikon"
          />
        </a>
        <figcaption className="Introduction__caption">
          Borger, <em>Mesopotamisches Zeichenlexikon</em>
        </figcaption>
      </figure>
      <Markdown
        text="A great debt of gratitude is owed to Thomas R. Kämmerer, editor-in-chief
            of Ugarit-Verlag, for his permission to digitize and make publicly available on
            this website the third chapter of R. Borger’s *Mesopotamisches Zeichenlexikon*
            (Alter Orient und Altes Testament 305. Münster, ²2010). Borger’s work has been
            digitized by E. Gogokhia, and proofread by S. Cohen, A. Hätinen, and E. Jiménez.
            The cuneiform has been coded in Unicode and is displayed using S. Vanserveren’s
            [Assurbanipal font](https://www.hethport.uni-wuerzburg.de/cuneifont/).
            Thanks are expressed to Dr. Vanserveren for her readiness to adapt and expand
            her font to contain all glyphs from *MesZL*²."
      />
      <p />
      <Markdown
        text="Following Borger’s request in *MesZL*² p. viii, the very few deviations of
        the electronic edition with respect to the printed version of the sign list
        are marked in a"
      />{' '}
      <span className="Introduction__meszlColoredChanges">different color</span>
      <Markdown
        text=". These deviations have the goal of correcting
    the very few typos of the first and second editions, such as the repeated
    paragraph in p. 418 (see [here](https://www.ebl.lmu.de/signs/DIŠ))."
      />
      <p />
      <Markdown
        text="R. Borger himself was rather skeptical regarding the possible digitization of
    his *MesZL*. In the preface to his second edition, he states: “Hin und wieder
    wird geträumt vom Ersatz der Buch-Fassung durch eine Internet-Fassung. Der
    geistige Nährwert des Umwegs über das Internet scheint mir sehr gering. Die
    technischen Probleme solch einer Umsetzung dürften kaum lösbar sein. Ich nehme
    übrigens an, dass mein Buch die heutigen Internet-“Publikationen” und CDs lange
    überleben wird” (p. viii). It is hoped that the care that the eBL team has put into the
    digitization of his *magnum opus* would have met his standards of acceptability."
      />
      <p />
      <Markdown
        text="The entire *MesZL*², not only the third chapter reproduced on this website,
    is an indispensable tool for reading cuneiform texts, and all users of the eBL
    sign interface are encouraged to buy the book from Ugarit-Verlag, following
    [this link](https://ugarit-verlag.com/en/products/0e8e7ca5d1f5493aa351e3ebc42fb514)."
      />
      <h3>III. Fossey, Manuel d’assyriologie II</h3>
      <figure className="Introduction__photoRight">
        <img
          className="Introduction__250px"
          src={fossey}
          alt="Fossey, Manuel d’assyriologie II"
        />
        <figcaption className="Introduction__caption">
          Fossey, <em>Manuel d’assyriologie II</em>
        </figcaption>
      </figure>
      <Markup
        markupService={markupService}
        text="Fossey’s monumental @i{Manuel d’assyriologie} II (Paris, 1926) is still today
    the most comprehensive repertoire of cuneiform signs. The collection of signs from all periods
    and regions known in Fossey’s day has aged well and, although many additional periods,
    cities, and sign forms could be added today, the book remains unsurpassed."
      />
      <p />
      <Markup
        markupService={markupService}
        text="Following the book’s entrance into public domain in 2016, Fossey’s @i{Manuel} is currently
    being digitized by a joint team led by E. Jiménez and Sh. Gordin. R. Borger’s concordance
    of Fossey’s list, included in the second chapter of his @i{Mesopotamisches Zeichenlexikon},
    was digitized by E. Gogokhia, and forms the basis for the display of the book on the eBL website.
    W. Sommerfeld, who led a team that digitized and updated the sections of Fossey’s manual concerned with
    third-millennium palaeography, has kindly made his materials available to the eBL platform."
      />
      <h3>IV. Palaeography</h3>
      <Markup
        markupService={markupService}
        text="The tool for tagging images of cuneiform tablets that is at the core
    of the palaeography section was implemented by J. Laasonen and Y. Cobanoglu in the framework
    of the project “Searching through Ancient Libraries: New Statistical Indexing Methods for 2D
    Images of Cuneiform Documents” (Y. Cohen, E. Jiménez, Sh. Gordin), financed by a Call for Joint
    Research Project on Data Science between Ludwig-Maximilians-Universität München (LMU) and Tel
    Aviv University (TAU)."
      />
      <p />
      <Markup
        markupService={markupService}
        text="The entire eBL team has contributed to the tagging of tablets, but the
    labor of N. Wenner, L. Sáenz, M. Fadhil, and S. Cohen should be singled out. More tablets are
    being tagged daily. Furthermore, a system for automatically labeling photographs has been
    implemented and is undergoing refinement."
      />
    </>
  )
}
