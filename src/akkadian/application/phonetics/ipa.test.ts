import { transcriptionToIpa } from 'akkadian/application/phonetics/ipa'

const transcription = "ṭṣšmaḫhk'"

it('Convert Akkadian transcription to IPA (basic)', () => {
  expect(transcriptionToIpa(transcription)).toEqual('ᵵᵴʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (affricative)', () => {
  expect(transcriptionToIpa(transcription, false, true)).toEqual('ᵵt̴͡t͡s̴ʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (pharyngealized)', () => {
  expect(transcriptionToIpa(transcription, false, false, true)).toEqual(
    'tˤsˤʃmaxxkʔ'
  )
})

it('Convert Akkadian transcription to IPA (affricative & pharyngealized)', () => {
  expect(transcriptionToIpa(transcription, false, true, true)).toEqual(
    'tˤt͡t͡sˤʃmaxxkʔ'
  )
})

it('Convert Akkadian transcription to IPA (stressed syllable)', () => {
  expect(transcriptionToIpa('an', true)).toEqual("a'n")
  expect(transcriptionToIpa('ān', true)).toEqual("a:'n")
  expect(transcriptionToIpa('ân', true)).toEqual("a::'n")
})
