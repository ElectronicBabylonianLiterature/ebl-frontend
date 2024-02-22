const newsletter = `
# eBL Newsletter 15

## 4 February 2024

### Fragmentarium

- 114 Penn Museum tablets have been provided with new photographs, taken by Anna
  Glenn. Photos of 227 Jena tablets, approximately 2,000 BM Babylon Collection
  tablets, and approximately 10,000 Yale tablets have also been uploaded.
- The Alalakh tablets have been added:
  [Alalakh Fragmentarium Search](https://www.ebl.lmu.de/fragmentarium/search/?site=Alalakh)
- It is possible to search for sites by entering the parameter in the URL, e.g.,
  [Uruk Fragmentarium Search](https://www.ebl.lmu.de/fragmentarium/search/?site=Uruk)
- It is now possible to use Wild cards (\\*) in the Museum number search.
- The Museum number search now searches for Excavation numbers too.
- Findspots have been added to the database. Work will be done on their display.
- Envelopes can now be given as part of the Joins Group (see e.g.,
  [HS.1016](https://www.ebl.lmu.de/fragmentarium/HS.1016))
- The following new Genres have been added (for a full list see
  [Genres List](https://github.com/ElectronicBabylonianLiterature/ebl-api/blob/master/ebl/fragmentarium/domain/genres.py)):
  - ARCHIVAL → Administrative → Tabular Account
  - ARCHIVAL → Administrative → Field Plan
  - ARCHIVAL → Legal → Guardianship
  - ARCHIVAL → Legal → Herding
  - ARCHIVAL → Legal → Hire
  - ARCHIVAL → Legal → Lease
  - ARCHIVAL → Legal → Marriage
  - ARCHIVAL → Legal → Rental
  - ARCHIVAL → Legal → Suretyship
  - CANONICAL → Lexicography → Acrographic word list → Kagal
  - CANONICAL → Lexicography → Thematic Word Lists → Personal names
  - CANONICAL → Lexicography → Thematic Word Lists → Personal names → Ur-ab-ba
  - CANONICAL → Literature → Hymns → Divine → Letter-Prayer
  - CANONICAL → Magic → Exorcistic → Ardat lilî
  - CANONICAL → Technical → Astronomy → Goal Year Texts
  - CANONICAL → Technical → Astronomy → Goal Year Procedure Texts
  - MONUMENTAL → Year Names
  - OTHER → Drawing

### Bibliography & Tools

- The AfO Register Textstellen (over 40,000 references) has been imported.
- It is possible to search for AfO Register references
  [AfO Register Search](https://www.ebl.lmu.de/bibliography/afo-register);
  the AfO Register references are now shown under the individual records when
  matches are found (e.g.,
  [IM.74403](https://www.ebl.lmu.de/fragmentarium/IM.74403)).
  - The matching depends on the field \`traditionalReferences\`, invisible to the
    user. That field attempts to account for all possible variations in
    traditional references to cuneiform tablets, e.g., “SpTU 1, 2” is also
    recorded as “ADFU 9, 2”, “SBTU 1, 2”, etc. Still, only a small number of AfO
    Register references (approximately 17.5%) can be linked. eBL users are kindly
    requested to alert us if they find references that should be matched with
    Fragmentarium records.
  - The date converter that underlies the eBL Dates has now been deployed as an
    independent tool: [Date Converter](https://www.ebl.lmu.de/tools/date-converter)

### Corpus

- An Arabic translation of the _Theodicy_ (II.1), prepared by Wasim Khatabe and
  Wadieh Zerkly, has been uploaded.`

export default newsletter
