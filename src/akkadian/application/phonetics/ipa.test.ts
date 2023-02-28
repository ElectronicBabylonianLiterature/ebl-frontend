import { syllabize } from 'akkadian/application/phonetics/ipa'

it('Syllabize', () => {
  expect(syllabize('ana')).toEqual(['a', 'na'])
  expect(syllabize('iprus')).toEqual(['ip', 'rus'])
  expect(syllabize('iparras')).toEqual(['i', 'par', 'ras'])
  expect(syllabize('ipparras')).toEqual(['ip', 'par', 'ras'])
  expect(syllabize("purrusā'u")).toEqual(['pur', 'ru', 'sā', "'u"])
  expect(syllabize('purrusāu')).toEqual(['pur', 'ru', 'sā', 'u'])
})

it('Syllabize: Throw error when invalid transcription', () => {
  function syllabizeInvalidTranscription(): void {
    syllabize('annna')
  }
  expect(syllabizeInvalidTranscription).toThrowError(
    'Transcription "annna" cannot be syllabized (likely invalid).'
  )
})
