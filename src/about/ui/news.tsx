import React from 'react'
import { Markdown } from 'common/Markdown'
import Markup from 'markup/ui/markup'
import MarkupService from 'markup/application/MarkupService'

export default function AboutNews(markupService: MarkupService): JSX.Element {
  return (
    <>
      <h3>eBL Evening</h3>
      <Markup
        markupService={markupService}
        text="eBL's features and tools will be the subject of regular presentations
        via Zoom sessions. Those attending will be invited to ask questions (please
        feel free to send these beforehand). The first of these sessions is scheduled
        to take place on the 29th of February at 18:00 CET. If you are interested in
        attending, please email ebl-info@culture.lmu.de."
      />

      <h3>eBL Newsletter</h3>
      <Markdown
        text="Important new developments and recently implemented features are
      regularly summarized in the eBL Newsletters (see below). If you wish to receive
      future eBL Newsletters, send us an [e-mail](ebl-info@culture.lmu.de)."
      />

      <h3>eBL Newsletter 15 (February 2024)</h3>
      <h4>Fragmentarium</h4>
      <ul>
        <li>
          114 Penn Museum tablets have been provided with new photographs, taken
          by Anna Glenn. Photos of 227 Jena tablets, ca. 2,000 BM Babylon
          Collection tablets, and ca. 10,000 Yale tablets have also been
          uploaded.
        </li>
        <li>
          The Alalakh tablets have been added:
          [https://www.ebl.lmu.de/fragmentarium/search/?site=Alalakh](https://www.ebl.lmu.de/fragmentarium/search/?site=Alalakh)
        </li>
        <li>
          It is possible to search for sites entering the parameter in the URL,
          e.g.
          [https://www.ebl.lmu.de/fragmentarium/search/?site=Uruk](https://www.ebl.lmu.de/fragmentarium/search/?site=Uruk)
        </li>
        <li>
          It is now possible to use Wild cards (*) in the Museum number search.
        </li>
        <li>
          The Museum number search now searches for Excavation numbers too.
        </li>
        <li>
          Findspots have been added to the database. Work will be done on their
          display.
        </li>
        <li>
          Envelopes can now be given as part of the Joins Group (see e.g.
          [HS.1016](https://www.ebl.lmu.de/fragmentarium/HS.1016))
        </li>
        <li>
          The following new Genres have been added (for a full list see
          [here](https://github.com/ElectronicBabylonianLiterature/ebl-api/blob/master/ebl/fragmentarium/domain/genres.py)):
          <ul>
            <li>ARCHIVAL → Administrative → Tabular Account</li>
            <li>ARCHIVAL → Administrative → Field Plan</li>
            <li>ARCHIVAL → Legal → Guardianship</li>
            <li>ARCHIVAL → Legal → Herding</li>
            <li>ARCHIVAL → Legal → Hire</li>
            <li>ARCHIVAL → Legal → Lease</li>
            <li>ARCHIVAL → Legal → Marriage</li>
            <li>ARCHIVAL → Legal → Rental</li>
            <li>ARCHIVAL → Legal → Suretyship</li>
            <li>CANONICAL → Lexicography → Acrographic word list → Kagal</li>
            <li>
              CANONICAL → Lexicography → Thematic Word Lists → Personal names
            </li>
            <li>
              CANONICAL → Lexicography → Thematic Word Lists → Personal names →
              Ur-ab-ba
            </li>
            <li>CANONICAL → Literature → Hymns → Divine → Letter-Prayer</li>
            <li>CANONICAL → Magic → Exorcistic → Ardat lilî</li>
            <li>CANONICAL → Technical → Astronomy → Goal Year Texts</li>
            <li>
              CANONICAL → Technical → Astronomy → Goal Year Procedure Texts
            </li>
            <li>MONUMENTAL → Year Names</li>
            <li>OTHER → Drawing</li>
          </ul>
        </li>
      </ul>
      <h4>Bibliography & Tools</h4>
      <ul>
        <li>
          The AfO Register Textstellen (over 40,000 references) has been
          imported.
        </li>
        <li>
          It is possible to search for AfO Register references
          ([https://www.ebl.lmu.de/bibliography/afo-register](https://www.ebl.lmu.de/bibliography/afo-register));
          the AfO Register references are now shown under the individual records
          when matches are found (e.g.
          [IM.74403](https://www.ebl.lmu.de/fragmentarium/IM.74403)).
          <ul>
            <li>
              The matching depends on the field{' '}
              <code>traditionalReferences</code>, invisible to the user. That
              field attempts to account for all possible variations in
              traditional references to cuneiform tablets, e.g. “
              <code>SpTU 1, 2</code>” is also recorded as “
              <code>ADFU 9, 2</code>”, “<code>SBTU 1, 2</code>”, etc. Still,
              only a small number of AfO Register references (approximately
              17,5%) can be linked. eBL users are kindly requested to alert us
              if they find references that should be matched with Fragmentarium
              records.
            </li>
            <li>
              The date converter that underlies the eBL Dates has now been
              deployed as an independent tool:
              [https://www.ebl.lmu.de/tools/date-converter](https://www.ebl.lmu.de/tools/date-converter)
            </li>
          </ul>
        </li>
      </ul>
      <h4>Corpus</h4>
      <ul>
        <li>
          An Arabic translation of the *Theodicy* (II.1), prepared by Wasim
          Khatabe and Wadieh Zerkly, has been uploaded.
        </li>
      </ul>
    </>
  )
}
