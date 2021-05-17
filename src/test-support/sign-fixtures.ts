import Sign, { Value } from 'signs/domain/Sign'
import { factory } from 'factory-girl'

factory.define('sign', Sign, {
  name: factory.chance('pickone', ['BA', 'BAD', 'BAR', 'EZEN×BAD', 'PI']),
  lists: factory.chance('pickone', [
    [{ name: 'MESZL', number: '1' }],
    [
      { name: 'HZL', number: '20' },
      { name: 'LAK', number: '752' },
    ],
  ]),
  values: factory.chance('pickone', [[new Value('war', 1)]]),
  unicode: factory.chance('pickone', [[73799], [74848, 73849]]),
  logograms: [
    {
      logogram: '<sup>giš</sup>BAR.KIN₂',
      atf: '{giš}BAR-KIN₂',
      wordId: ['sehpu I'],
      schrammLogogramme:
        '<sup>giš</sup>BAR-KIN₂; *seḫpu* (Bast, Rinde); ME 69 CD 320a',
    },
  ],
  mesZl:
    '1\t**AŠ**\t𒀸\nASy 1. Lww. aš (allg.; ass. häufiger áš); às (wohl sehr selten, nicht altakk. und ass.-a.) — rum (allg. ausser altakk. und ass.-a.); rù (do., cf SLOBA p108) — rim₅ (bab-a., cf SLOBA p111) — dil (n.); ṭil (n.) — dàl (n.) — ina (n., Präsens Verba primae Nun); in₆ (n., Labat ìn).\nLw. dili siehe 1. Anhang.\n---\naš, dili = Zahl 1 (AHw 400, CAD I/J 275ff.).\nAŠ = *aplu*, Sohn (N.P.).\nAŠ = *aširtu*, Heiligtum. Cf CAD A/II 436a.\nAŠ = *aššur*',
})
