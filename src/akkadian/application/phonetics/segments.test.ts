import { transcriptionToPhoneticSegments } from 'akkadian/application/phonetics/segments'

test.each([
  ['iprus', 'ˈip.rus'],
  ['iparras', 'i.ˈpar.ras'],
  ['purrusû', 'ˈpur.ru.suːː'],
  ['purrusûm', 'pur.ru.ˈsuːːm'],
  ["purrusā'u", 'pur.ru.ˈsaː.ʔu'],
  ['awīlum', 'a.ˈwiː.lum'],
  ['amēlu', 'a.ˈmeː.lu'],
])('Analyze segment and check basic IPA output', (transcription, expected) => {
  expect(transcriptionToPhoneticSegments(transcription).ipa).toEqual(expected)
})
