import { transcriptionToIpa } from 'akkadian/application/phonetics/ipa'

const transcription = "ṭṣšmaḫhk'"

it('Convert Akkadian transcription to IPA (basic)', () => {
  expect(transcriptionToIpa(transcription)).toEqual('ᵵᵴʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (affricative)', () => {
  expect(transcriptionToIpa(transcription, { affricative: true })).toEqual(
    'ᵵt̴͡t͡s̴ʃmaxxkʔ'
  )
})

it('Convert Akkadian transcription to IPA (pharyngealized)', () => {
  expect(transcriptionToIpa(transcription, { pharyngealized: true })).toEqual(
    'tˤsˤʃmaxxkʔ'
  )
})

it('Convert Akkadian transcription to IPA (affricative & pharyngealized)', () => {
  expect(
    transcriptionToIpa(transcription, {
      affricative: true,
      pharyngealized: true,
    })
  ).toEqual('tˤt͡t͡sˤʃmaxxkʔ')
})

it('Convert Akkadian transcription to IPA (stressed syllable)', () => {
  expect(transcriptionToIpa('an', { isSyllableStressed: true })).toEqual("a'n")
  expect(transcriptionToIpa('ān', { isSyllableStressed: true })).toEqual("a:'n")
  expect(transcriptionToIpa('ân', { isSyllableStressed: true })).toEqual(
    "a::'n"
  )
})
