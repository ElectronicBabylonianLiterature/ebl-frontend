import { transcriptionToPhoneticSegments } from 'akkadian/application/phonetics/segments'

test.each([
  ['iprus', "i'p.rus"],
  ['iparras', "i.pa'r.ras"],
  ['purrusû', "pu'r.ru.su::"],
  ['purrusûm', "pur.ru.su::'m"],
  ["purrusā'u", "pur.ru.sa:'.ʔu"],
  ['awīlum', "a.wi:'.lum"],
  ['amēlu', "a.me:'.lu"],
])('Analyze segment and check basic IPA output', (transcription, expected) => {
  expect(transcriptionToPhoneticSegments(transcription).ipa).toEqual(expected)
})
