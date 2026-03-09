import { transcriptionToIpa } from 'akkadian/application/phonetics/ipa'

const transcription = "ṭṣšmaḫhk'"

it('Convert Akkadian transcription to IPA (basic)', () => {
  expect(transcriptionToIpa(transcription)).toEqual('ᵵᵴʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (affricative)', () => {
  expect(transcriptionToIpa(transcription, { isAffricative: true })).toEqual(
    'ᵵt̴͡t͡s̴ʃmaxxkʔ',
  )
})

it('Convert Akkadian transcription to IPA (pharyngealized)', () => {
  expect(transcriptionToIpa(transcription, { isPharyngealized: true })).toEqual(
    'tˤsˤʃmaxxkʔ',
  )
})

it('Convert Akkadian transcription to IPA (affricative & pharyngealized)', () => {
  expect(
    transcriptionToIpa(transcription, {
      isAffricative: true,
      isPharyngealized: true,
    }),
  ).toEqual('tˤt͡t͡sˤʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (stressed syllable)', () => {
  expect(transcriptionToIpa('an', { isStressed: true })).toEqual('ˈan')
  expect(transcriptionToIpa('ān', { isStressed: true })).toEqual('ˈaːn')
  expect(transcriptionToIpa('ân', { isStressed: true })).toEqual('ˈaːːn')
})
