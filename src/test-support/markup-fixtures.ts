import Reference from 'bibliography/domain/Reference'
import { MarkupPart } from 'transliteration/domain/markup'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

export const markupString = `This tablet is a one columned chronicle-fragment, telling about the faulty reignship of king Šulgi, who committed sins against Babylon and Uruk. The text is written in an accusatory tone, stressed by the repetition of exclamatory sentences about Šulgis sinfull deeds. It was discussed in lenghth by @bib{RN891@63-72}, who pointed out its inspiration trough the Sumerian Kinglist as well as anachronistic allusions to Nabonid.
The tablet is part of a series, as can be seen from the existence of the catchline and a “specular catchline” as it is called by Hunger, (@i{SpTU} 1, 20 n. 2), that seems to resume the content of the preceding chapter. About one half or even two thirds of the composition is missing. This is underlined by the colophon, that takes almost all of the space on the reverse but in many other cases covers only about a third and occasionally half of a tablet.
The tablet stems from the 27. campaign in Uruk 1969 of the residential area U XVIII and was published first by Hunger 1976 in SpTU 1, 2.`

const markupPartOne: MarkupPart = {
  text: 'This tablet is a one columned chronicle-fragment, telling about the faulty reignship of king Šulgi, who committed sins against Babylon and Uruk. The text is written in an accusatory tone, stressed by the repetition of exclamatory sentences about Šulgis sinfull deeds. It was discussed in lenghth by ',
  type: 'StringPart',
}

const markupPartTwoSerialized: MarkupPart = {
  reference: new Reference(
    'DISCUSSION',
    '63-72',
    '',
    [],
    new BibliographyEntry({
      cslData: {
        id: 'RN891',
        author: [
          {
            family: 'Cavigneaux',
            given: 'A.',
          },
        ],
        title: 'Shulgi, Nabonide et les grecs',
        'container-title':
          'An Experienced Scribe who Neglects Nothing. Ancient Near Eastern Studies in Honor of Jacob Klein',
        editor: [
          {
            given: 'Y.',
            family: 'Sefati',
          },
          {
            given: 'P.',
            family: 'Artzi',
          },
          {
            given: 'Ch.',
            family: 'Cohen',
          },
          {
            given: 'B.L.',
            family: 'Eichler',
          },
          {
            given: 'V.A.',
            family: 'Hurowitz',
          },
        ],
        publisher: 'CDL',
        'publisher-place': 'Bethesda',
        page: '63-72',
        type: 'chapter',
        'citation-label': 'RN891',
        issued: {
          'date-parts': [[2005]],
        },
      },
    }),
  ),
  type: 'BibliographyPart',
}

const markupPartThree: MarkupPart = {
  text: ', who pointed out its inspiration trough the Sumerian Kinglist as well as anachronistic allusions to Nabonid. The tablet is part of a series, as can be seen from the existence of the catchline and a “specular catchline” as it is called by Hunger, (',
  type: 'StringPart',
}

const markupPartFour: MarkupPart = {
  text: 'SpTU',
  type: 'EmphasisPart',
}

const markupPartFive: MarkupPart = {
  text: ' 1, 20 n. 2), that seems to resume the content of the preceding chapter. About one half or even two thirds of the composition is missing. This is underlined by the colophon, that takes almost all of the space on the reverse but in many other cases covers only about a third and occasionally half of a tablet. The tablet stems from the 27. campaign in Uruk 1969 of the residential area U XVIII and was published first by Hunger 1976 in SpTU 1, 2.',
  type: 'StringPart',
}

export const markupDtoSerialized = [
  markupPartOne,
  markupPartTwoSerialized,
  markupPartThree,
  markupPartFour,
  markupPartFive,
]

export const boldPart: MarkupPart = {
  text: 'bold text',
  type: 'BoldPart',
}

export const superscriptPart: MarkupPart = {
  text: 'superscript',
  type: 'SuperscriptPart',
}

export const subscriptPart: MarkupPart = {
  text: 'subscript',
  type: 'SubscriptPart',
}
