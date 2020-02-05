import { Text } from 'fragmentarium/domain/text'

export default new Text({
  lines: [
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 2,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur₂'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Token',
              value: '['
            },
            {
              type: 'Token',
              value: '('
            },
            {
              type: 'Logogram',
              flags: [],
              surrogate: [],
              subIndex: 2,
              name: 'KUR',
              modifiers: [],
              sign: null,
              value: 'KUR₂'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Variant',
              value: 'kur/RA',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                },
                {
                  type: 'Logogram',
                  flags: [],
                  surrogate: [],
                  subIndex: 1,
                  name: 'RA',
                  modifiers: [],
                  sign: null,
                  value: 'RA'
                }
              ]
            },
            {
              type: 'Token',
              value: ')'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur₂-[(KUR₂-kur/RA)',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'UnknownNumberOfSigns',
          value: '...'
        },
        {
          type: 'BrokenAway',
          value: ']',
          side: 'RIGHT'
        }
      ],
      prefix: '1.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR.KUR|'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '|KUR.KUR|',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Variant',
              value: 'kur/|RA|',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                },
                {
                  type: 'CompoundGrapheme',
                  value: '|RA|'
                }
              ]
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur/|RA|',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'BrokenAway',
          value: '[',
          side: 'LEFT'
        },
        {
          type: 'UnknownNumberOfSigns',
          value: '...'
        },
        {
          type: 'BrokenAway',
          value: ']',
          side: 'RIGHT'
        }
      ],
      prefix: '2.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Number',
              flags: ['#', '*'],
              subIndex: 1,
              name: '1',
              modifiers: ['@v'],
              sign: null,
              value: '1@v#*'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '1@v#*',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'UnclearSign',
              value: 'x#!',
              flags: ['#', '!']
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'x#!',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'UnidentifiedSign',
              value: 'X#?',
              flags: ['#', '?']
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'X#?',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Divider',
          flags: ['#', '?'],
          divider: '::',
          modifiers: ['@v', '@44'],
          value: '::@v@44#?'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Token',
              value: '['
            },
            {
              type: 'Token',
              value: '('
            },
            {
              type: 'UnclearSign',
              value: 'x',
              flags: []
            },
            {
              type: 'Token',
              value: ')'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '[(x)',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'UnclearSign',
              value: 'x',
              flags: []
            },
            {
              type: 'Token',
              value: ']'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'x]',
          lemmatizable: false,
          uniqueLemma: []
        }
      ],
      prefix: '3.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: ['#', '!'],
              subIndex: null,
              name: 'kur',
              modifiers: ['@v'],
              sign: {
                type: 'Grapheme',
                flags: ['#', '?'],
                name: 'KUR',
                modifiers: ['@v'],
                value: 'KUR@v#?'
              },
              value: 'kurₓ@v#!(KUR@v#?)'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Logogram',
              flags: ['#', '?'],
              surrogate: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ],
              subIndex: 2,
              name: 'KUR',
              modifiers: ['@v'],
              sign: null,
              value: 'KUR₂@v#?<(kur-kur)>'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
          lemmatizable: true,
          uniqueLemma: []
        }
      ],
      prefix: '1.'
    },
    {
      type: 'TextLine',
      content: [
        {
          side: 'LEFT',
          value: '°',
          type: 'Erasure'
        },
        {
          type: 'Word',
          erasure: 'ERASED',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          side: 'CENTER',
          value: '\\',
          type: 'Erasure'
        },
        {
          type: 'Word',
          erasure: 'OVER_ERASED',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          side: 'RIGHT',
          value: '°',
          type: 'Erasure'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              side: 'LEFT',
              value: '°',
              type: 'Erasure'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              side: 'CENTER',
              value: '\\',
              type: 'Erasure'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              side: 'RIGHT',
              value: '°',
              type: 'Erasure'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur-°kur\\kur°-kur',
          lemmatizable: true,
          uniqueLemma: []
        }
      ],
      prefix: '5.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Determinative',
              value: '{d#-kur₂?}',
              parts: [
                {
                  type: 'Reading',
                  flags: ['#'],
                  subIndex: 1,
                  name: 'd',
                  modifiers: [],
                  sign: null,
                  value: 'd#'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  type: 'Reading',
                  flags: ['?'],
                  subIndex: 2,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur₂?'
                }
              ]
            },
            {
              type: 'Determinative',
              value: '{d-RA!}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'd',
                  modifiers: [],
                  sign: null,
                  value: 'd'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  type: 'Logogram',
                  flags: ['!'],
                  surrogate: [],
                  subIndex: 1,
                  name: 'RA',
                  modifiers: [],
                  sign: null,
                  value: 'RA!'
                }
              ]
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'LinguisticGloss',
              value: '{{kur}}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '{d#-kur₂?}{d-RA!}kur{{kur}}',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'DocumentOrientedGloss',
          value: '{(',
          side: 'LEFT'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'Determinative',
              value: '{d!}',
              parts: [
                {
                  type: 'Reading',
                  flags: ['!'],
                  subIndex: 1,
                  name: 'd',
                  modifiers: [],
                  sign: null,
                  value: 'd!'
                }
              ]
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur{d!}',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Logogram',
              flags: ['!'],
              surrogate: [],
              subIndex: 2,
              name: 'KUR',
              modifiers: [],
              sign: null,
              value: 'KUR₂!'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'ra',
              modifiers: [],
              sign: null,
              value: 'ra'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'KUR₂!-ra',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'LanguageShift',
          value: '%es',
          normalized: false,
          language: 'EMESAL'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'PhoneticGloss',
              value: '{+k[ur]-RA}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'k[ur',
                  modifiers: [],
                  sign: null,
                  value: 'k[ur'
                },
                {
                  type: 'Token',
                  value: ']'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  type: 'Logogram',
                  flags: [],
                  surrogate: [],
                  subIndex: 1,
                  name: 'RA',
                  modifiers: [],
                  sign: null,
                  value: 'RA'
                }
              ]
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: 'kur{+k[ur]-RA}',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Determinative',
              value: '{kur}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 2,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur₂'
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: '{kur}kur₂',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'DocumentOrientedGloss',
          value: ')}',
          side: 'RIGHT'
        }
      ],
      prefix: '6.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Token',
              value: '['
            },
            {
              type: 'Token',
              value: '('
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'Token',
              value: ')'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Token',
              value: '['
            },
            {
              type: 'LinguisticGloss',
              value: '{{k]ur-[kur}}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'k]ur',
                  modifiers: [],
                  sign: null,
                  value: 'k]ur'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  type: 'Token',
                  value: '['
                },
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Token',
              value: ']'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'k[ur',
              modifiers: [],
              sign: null,
              value: 'k[ur'
            },
            {
              type: 'Token',
              value: ']'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '[(kur)-[{{k]ur-[kur}}]k[ur]',
          lemmatizable: true,
          uniqueLemma: []
        }
      ],
      prefix: '7.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'LanguageShift',
          value: '%sux',
          normalized: false,
          language: 'SUMERIAN'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              type: 'Determinative',
              value: '{d}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'd',
                  modifiers: [],
                  sign: null,
                  value: 'd'
                }
              ]
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: 'kur{d}',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Logogram',
              flags: [],
              surrogate: [],
              subIndex: 1,
              name: 'KUR',
              modifiers: [],
              sign: null,
              value: 'KUR'
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: 'KUR',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'LanguageShift',
          value: '%akk',
          normalized: false,
          language: 'AKKADIAN'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'LanguageShift',
          value: '%es',
          normalized: false,
          language: 'EMESAL'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: 'kur',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Logogram',
              flags: [],
              surrogate: [],
              subIndex: 1,
              name: 'KUR',
              modifiers: [],
              sign: null,
              value: 'KUR'
            },
            {
              type: 'Determinative',
              value: '{D}',
              parts: [
                {
                  type: 'Logogram',
                  flags: [],
                  surrogate: [],
                  subIndex: 1,
                  name: 'D',
                  modifiers: [],
                  sign: null,
                  value: 'D'
                }
              ]
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: 'KUR{D}',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'LanguageShift',
          value: '%akk',
          normalized: false,
          language: 'AKKADIAN'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur',
          lemmatizable: true,
          uniqueLemma: []
        }
      ],
      prefix: '8.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'LanguageShift',
          value: '%sux',
          normalized: false,
          language: 'SUMERIAN'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR₂.KUR|'
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: '|KUR₂.KUR|',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Determinative',
              value: '{kur}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Variant',
              value: 'ra/RA#',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'ra',
                  modifiers: [],
                  sign: null,
                  value: 'ra'
                },
                {
                  type: 'Logogram',
                  flags: ['#'],
                  surrogate: [],
                  subIndex: 1,
                  name: 'RA',
                  modifiers: [],
                  sign: null,
                  value: 'RA#'
                }
              ]
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 2,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur₂'
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: '{kur}ra/RA#-kur₂',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'PhoneticGloss',
              value: '{+kur}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Reading',
              flags: ['!'],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur!'
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: '{+kur}kur!',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Divider',
          flags: [],
          divider: ':.',
          modifiers: [],
          value: ':.'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Variant',
              value: 'kur/KUR#',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                },
                {
                  type: 'Logogram',
                  flags: ['#'],
                  surrogate: [],
                  subIndex: 1,
                  name: 'KUR',
                  modifiers: [],
                  sign: null,
                  value: 'KUR#'
                }
              ]
            }
          ],
          language: 'SUMERIAN',
          normalized: false,
          value: 'kur/KUR#',
          lemmatizable: false,
          uniqueLemma: []
        }
      ],
      prefix: '9.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'LanguageShift',
          value: '%es',
          normalized: false,
          language: 'EMESAL'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR₂.KUR|'
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: '|KUR₂.KUR|',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Determinative',
              value: '{kur}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Variant',
              value: 'ra/RA#',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'ra',
                  modifiers: [],
                  sign: null,
                  value: 'ra'
                },
                {
                  type: 'Logogram',
                  flags: ['#'],
                  surrogate: [],
                  subIndex: 1,
                  name: 'RA',
                  modifiers: [],
                  sign: null,
                  value: 'RA#'
                }
              ]
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 2,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur₂'
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: '{kur}ra/RA#-kur₂',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'PhoneticGloss',
              value: '{+kur}',
              parts: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                }
              ]
            },
            {
              type: 'Reading',
              flags: ['!'],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur!'
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: '{+kur}kur!',
          lemmatizable: false,
          uniqueLemma: []
        },
        {
          type: 'Divider',
          flags: [],
          divider: ':.',
          modifiers: [],
          value: ':.'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Variant',
              value: 'kur/KUR#',
              tokens: [
                {
                  type: 'Reading',
                  flags: [],
                  subIndex: 1,
                  name: 'kur',
                  modifiers: [],
                  sign: null,
                  value: 'kur'
                },
                {
                  type: 'Logogram',
                  flags: ['#'],
                  surrogate: [],
                  subIndex: 1,
                  name: 'KUR',
                  modifiers: [],
                  sign: null,
                  value: 'KUR#'
                }
              ]
            }
          ],
          language: 'EMESAL',
          normalized: false,
          value: 'kur/KUR#',
          lemmatizable: false,
          uniqueLemma: []
        }
      ],
      prefix: '9.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              side: 'LEFT',
              value: '<',
              type: 'AccidentalOmission'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '<kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              side: 'RIGHT',
              value: '>',
              type: 'AccidentalOmission'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur>',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              side: 'LEFT',
              value: '<(',
              type: 'IntentionalOmission'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '<(kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              side: 'RIGHT',
              value: ')>',
              type: 'IntentionalOmission'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur)>',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              side: 'LEFT',
              value: '<<',
              type: 'Removal'
            },
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: '<<kur',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'kur',
              modifiers: [],
              sign: null,
              value: 'kur'
            },
            {
              side: 'RIGHT',
              value: '>>',
              type: 'Removal'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'kur>>',
          lemmatizable: true,
          uniqueLemma: []
        }
      ],
      prefix: '10.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'BrokenAway',
          value: ']',
          side: 'RIGHT'
        },
        {
          type: 'BrokenAway',
          value: '[',
          side: 'LEFT'
        },
        {
          type: 'DocumentOrientedGloss',
          value: '{(',
          side: 'LEFT'
        },
        {
          type: 'Word',
          erasure: 'NONE',
          parts: [
            {
              type: 'Reading',
              flags: [],
              subIndex: 1,
              name: 'ra',
              modifiers: [],
              sign: null,
              value: 'ra'
            }
          ],
          language: 'AKKADIAN',
          normalized: false,
          value: 'ra',
          lemmatizable: true,
          uniqueLemma: []
        },
        {
          type: 'DocumentOrientedGloss',
          value: ')}',
          side: 'RIGHT'
        },
        {
          type: 'BrokenAway',
          value: ']',
          side: 'RIGHT'
        }
      ],
      prefix: '11.'
    },
    {
      type: 'ControlLine',
      content: [
        {
          type: 'Token',
          value: 'single ruling'
        }
      ],
      prefix: '$'
    }
  ]
})
