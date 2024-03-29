const newsletter = `
# eBL Newsletter 9

## 25 July 2022

### Fragmentarium

- Fragments are now connected to the Corpus: If a tablet is edited in the Corpus,
  a link will be displayed in the Fragmentarium.
- The Genre list has been expanded to include also text names. For a list, see
  [here](https://github.com/ElectronicBabylonianLiterature/ebl-api/blob/master/ebl/fragmentarium/domain/genres.py).
- SpTU tablets have been imported into the Fragmentarium, with the IM museum
  numbers by permission of the DAI.
- I. L. Finkel’s Folios have been imported.
- The readings ½ (as reading of MAŠ) and {f} (as reading of SAL) are now allowed.

### Corpus

- Loading of texts with many chapters is now almost instantaneous (e.g.
  [here](https://www.ebl.lmu.de/corpus/L/1/4)).
- Corpus search has now been optimized and should be at least 3× faster. See
  [here](https://www.ebl.lmu.de/fragmentarium/search/?id=&number=&pages=&paginationIndex=0&primaryAuthor=&title=&transliteration=e%20nu%20ma%20e%20li%C5%A1&year=).
- Corpus search is now paginated.
- Aligned words, including variants, are now displayed in the corpus when clicking
  on a word.
- Aligned words in the score edition of a line are highlighted when hovering over
  the word in the reconstruction.
- Metrical analysis is no longer shown by default, but it can be activated on the
  lateral bar.
- Texts in the Corpus can now be downloaded as JSON. Other formats (ATF, TEI XML,
  PDF, Word) will be available soon.
- [Counsels of Wisdom](https://www.ebl.lmu.de/corpus/L/2/3) has been imported.

### Website launch

- We strive to open [http://www.ebl.lmu.de](http://www.ebl.lmu.de)
  to the public in Autumn 2022.`

export default newsletter
