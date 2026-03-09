import transcriptionsToPhoneticSegment from 'akkadian/application/phonetics/segments'

test.each([
  ['iprus', 'ˈip.rus', '—́ —'],
  ['iparras', 'i.ˈpar.ras', '⏑ —́ —'],
  ['purrusû', 'pur.ru.ˈsuːː', '— ⏑ ⏗́'],
  ['purrusûm', 'pur.ru.ˈsuːːm', '— ⏑ ⏗́'],
  ["purrusā'u", 'pur.ru.ˈsaː.ʔu', '— ⏑ —́ ⏑'],
  ['awīlum', 'a.ˈwiː.lum', '⏑ —́ —'],
  ['amēlu', 'a.ˈmeː.lu', '⏑ —́ ⏑'],
])(
  'Analyze segment and check basic IPA output',
  (transcription, expectedIpa, expectedMeter) => {
    const result = transcriptionsToPhoneticSegment([transcription], {
      meterProps: { useJunicode: false },
    })[0]
    expect(result.ipa).toEqual(expectedIpa)
    expect(result.meter).toEqual(expectedMeter)
  },
)
