import { Line, Text } from 'fragmentarium/domain/text'

const line1: Line = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      cleanValue: 'obverse',
      value: 'obverse',
      type: 'ValueToken'
    }
  ],
  type: 'ControlLine'
}

const line2: Line = {
  prefix: '1.',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'erin₂-ŠA₂-ša₃/GIRI₃',
      value: 'erin₂-[(ŠA₂-ša₃/GIRI₃)',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      parts: [
        {
          enclosureType: [],
          cleanValue: 'erin₂',
          value: 'erin₂',
          name: 'erin',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'erin',
              value: 'erin',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: '(',
          side: 'LEFT',
          type: 'PerhapsBrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'ŠA₂',
          value: 'ŠA₂',
          name: 'ŠA',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'ŠA',
              value: 'ŠA',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'ša₃/GIRI₃',
          value: 'ša₃/GIRI₃',
          tokens: [
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'ša₃',
              value: 'ša₃',
              name: 'ša',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  cleanValue: 'ša',
                  value: 'ša',
                  type: 'ValueToken'
                }
              ],
              subIndex: 3,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'GIRI₃',
              value: 'GIRI₃',
              name: 'GIRI',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  cleanValue: 'GIRI',
                  value: 'GIRI',
                  type: 'ValueToken'
                }
              ],
              subIndex: 3,
              modifiers: [],
              flags: [],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Variant'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '',
          value: ')',
          side: 'RIGHT',
          type: 'PerhapsBrokenAway'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      erasure: 'NONE',
      cleanValue: 'sah-SAH',
      value: 'sah-SAH',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      parts: [
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'sah',
          value: 'sah',
          name: 'sah',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'sah',
              value: 'sah',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'SAH',
          value: 'SAH',
          name: 'SAH',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'SAH',
              value: 'SAH',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway'
    }
  ],
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line3: Line = {
  prefix: '$',
  content: [
    {
      enclosureType: [],
      cleanValue: ' single ruling',
      value: ' single ruling',
      type: 'ValueToken'
    }
  ],
  number: 'SINGLE',
  status: null,
  type: 'RulingDollarLine'
}

const line4: Line = {
  prefix: '2.',
  content: [
    {
      enclosureType: [],
      cleanValue: '|KUR.KUR|',
      value: '|KUR.KUR|',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '|KUR.KUR|',
          value: '|KUR.KUR|',
          type: 'CompoundGrapheme'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation'
    },
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation'
    },
    {
      enclosureType: [],
      cleanValue: 'kur/|RA|',
      value: 'kur/|RA|',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur/|RA|',
          value: 'kur/|RA|',
          tokens: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: '|RA|',
              value: '|RA|',
              type: 'CompoundGrapheme'
            }
          ],
          type: 'Variant'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '',
      value: '[',
      side: 'LEFT',
      type: 'BrokenAway'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway'
    }
  ],
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line5: Line = {
  prefix: '$',
  content: [
    {
      enclosureType: [],
      cleanValue: ' double ruling',
      value: ' double ruling',
      type: 'ValueToken'
    }
  ],
  number: 'DOUBLE',
  status: null,
  type: 'RulingDollarLine'
}

const line6: Line = {
  prefix: '3.',
  content: [
    {
      enclosureType: [],
      cleanValue: '1@v',
      value: '1@v#*',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '1@v',
          value: '1@v#*',
          name: '1',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: '1',
              value: '1',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: ['@v'],
          flags: ['#', '*'],
          sign: null,
          type: 'Number'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'x',
      value: 'x#!',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'x',
          value: 'x#!',
          flags: ['#', '!'],
          type: 'UnclearSign'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'X',
      value: 'X#?',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'X',
          value: 'X#?',
          flags: ['#', '?'],
          type: 'UnidentifiedSign'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '::@v@44',
      value: '::@v@44?#',
      divider: '::',
      modifiers: ['@v', '@44'],
      flags: ['?', '#'],
      type: 'Divider'
    },
    {
      enclosureType: [],
      cleanValue: 'x',
      value: '[(x)',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '',
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: '(',
          side: 'LEFT',
          type: 'PerhapsBrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '',
          value: ')',
          side: 'RIGHT',
          type: 'PerhapsBrokenAway'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: 'x',
      value: 'x]',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line7: Line = {
  prefix: '4.',
  content: [
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation'
    },
    {
      enclosureType: [],
      cleanValue: 'kurₓ@v(KUR@v#?)-KUR₂@v<(kur-kur)>',
      value: 'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kurₓ@v(KUR@v#?)',
          value: 'kurₓ@v#!(KUR@v#?)',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: null,
          modifiers: ['@v'],
          flags: ['#', '!'],
          sign: {
            enclosureType: [],
            cleanValue: 'KUR@v',
            value: 'KUR@v#?',
            name: 'KUR',
            modifiers: ['@v'],
            flags: ['#', '?'],
            type: 'Grapheme'
          },
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: 'KUR₂@v<(kur-kur)>',
          value: 'KUR₂@v#?<(kur-kur)>',
          name: 'KUR',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: ['@v'],
          flags: ['#', '?'],
          sign: null,
          surrogate: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: '-',
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Logogram'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 4,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line8: Line = {
  prefix: '5.',
  content: [
    {
      enclosureType: [],
      cleanValue: '',
      value: '°',
      side: 'LEFT',
      type: 'Erasure'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'ERASED',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '',
      value: '\\',
      side: 'CENTER',
      type: 'Erasure'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'OVER_ERASED',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '',
      value: '°',
      side: 'RIGHT',
      type: 'Erasure'
    },
    {
      enclosureType: [],
      cleanValue: 'kur-kurkur-kur',
      value: 'kur-°kur\\kur°-kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '°',
          side: 'LEFT',
          type: 'Erasure'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '\\',
          side: 'CENTER',
          type: 'Erasure'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '°',
          side: 'RIGHT',
          type: 'Erasure'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 5,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line9: Line = {
  prefix: '$',
  content: [
    {
      enclosureType: [],
      cleanValue: ' triple ruling',
      value: ' triple ruling',
      type: 'ValueToken'
    }
  ],
  number: 'TRIPLE',
  status: null,
  type: 'RulingDollarLine'
}

const line10: Line = {
  prefix: '6.',
  content: [
    {
      enclosureType: [],
      cleanValue: '{d-kur₂}{d-RA}kur',
      value: '{d#-kur₂?}{d-RA!}kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{d-kur₂}',
          value: '{d#-kur₂?}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'd',
              value: 'd#',
              name: 'd',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'd',
                  value: 'd',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['#'],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: '-',
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: [],
              cleanValue: 'kur₂',
              value: 'kur₂?',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 2,
              modifiers: [],
              flags: ['?'],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        },
        {
          enclosureType: [],
          cleanValue: '{d-RA}',
          value: '{d-RA!}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'd',
              value: 'd',
              name: 'd',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'd',
                  value: 'd',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: '-',
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: [],
              cleanValue: 'RA',
              value: 'RA!',
              name: 'RA',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'RA',
                  value: 'RA',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['!'],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Determinative'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '{{kur}}',
      value: '{{kur}}',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{{kur}}',
          value: '{{kur}}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'LinguisticGloss'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '',
      value: '{(',
      side: 'LEFT',
      type: 'DocumentOrientedGloss'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'kur{d}',
      value: 'k[u]r{d!}',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'kur',
          value: 'k[u]r',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'k',
              value: 'k',
              type: 'ValueToken'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: '',
              value: '[',
              side: 'LEFT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
              cleanValue: 'u',
              value: 'u',
              type: 'ValueToken'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
              cleanValue: '',
              value: ']',
              side: 'RIGHT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'r',
              value: 'r',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '{d}',
          value: '{d!}',
          parts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'd',
              value: 'd!',
              name: 'd',
              nameParts: [
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  cleanValue: 'd',
                  value: 'd',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['!'],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'KUR₂-ra',
      value: 'KUR₂!-ra',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'KUR₂',
          value: 'KUR₂!',
          name: 'KUR',
          nameParts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'KUR',
              value: 'KUR',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: ['!'],
          sign: null,
          surrogate: [],
          type: 'Logogram'
        },
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'ra',
          value: 'ra',
          name: 'ra',
          nameParts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'ra',
              value: 'ra',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '%es',
      value: '%es',
      language: 'EMESAL',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'kur{+kur-RA}',
      value: 'kur{+k[ur]-RA}',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '{+kur-RA}',
          value: '{+k[ur]-RA}',
          parts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'kur',
              value: 'k[ur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  cleanValue: 'k',
                  value: 'k',
                  type: 'ValueToken'
                },
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  cleanValue: '',
                  value: '[',
                  side: 'LEFT',
                  type: 'BrokenAway'
                },
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
                  cleanValue: 'ur',
                  value: 'ur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
              cleanValue: '',
              value: ']',
              side: 'RIGHT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: '-',
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'RA',
              value: 'RA',
              name: 'RA',
              nameParts: [
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  cleanValue: 'RA',
                  value: 'RA',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'PhoneticGloss'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '{kur}kur₂',
      value: '{kur}kur₂',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '{kur}',
          value: '{kur}',
          parts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        },
        {
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'kur₂',
          value: 'kur₂',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '',
      value: ')}',
      side: 'RIGHT',
      type: 'DocumentOrientedGloss'
    }
  ],
  lineNumber: {
    number: 6,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line11: Line = {
  prefix: '1.',
  content: [
    {
      enclosureType: [],
      cleanValue: 'kur-{{kur-kur}}kur',
      value: '[(kur)]-[{{k]ur-[kur}}]k[ur]',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '',
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: '(',
          side: 'LEFT',
          type: 'PerhapsBrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
          cleanValue: '',
          value: ')',
          side: 'RIGHT',
          type: 'PerhapsBrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: '',
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '{{kur-kur}}',
          value: '{{k]ur-[kur}}',
          parts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'kur',
              value: 'k]ur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY'],
                  cleanValue: 'k',
                  value: 'k',
                  type: 'ValueToken'
                },
                {
                  enclosureType: ['BROKEN_AWAY'],
                  cleanValue: '',
                  value: ']',
                  side: 'RIGHT',
                  type: 'BrokenAway'
                },
                {
                  enclosureType: [],
                  cleanValue: 'ur',
                  value: 'ur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: '-',
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: [],
              cleanValue: '',
              value: '[',
              side: 'LEFT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY'],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'LinguisticGloss'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'k[ur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'k',
              value: 'k',
              type: 'ValueToken'
            },
            {
              enclosureType: [],
              cleanValue: '',
              value: '[',
              side: 'LEFT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              cleanValue: 'ur',
              value: 'ur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          cleanValue: '',
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line12: Line = {
  prefix: '2.',
  content: [
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation'
    },
    {
      enclosureType: [],
      cleanValue: '($___$)',
      value: '($___$)',
      type: 'Tabulation'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '%sux',
      value: '%sux',
      language: 'SUMERIAN',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: 'kur{d}',
      value: 'kur{d}',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: [],
          cleanValue: '{d}',
          value: '{d}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'd',
              value: 'd',
              name: 'd',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'd',
                  value: 'd',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'KUR',
      value: 'KUR',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'KUR',
          value: 'KUR',
          name: 'KUR',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '%akk',
      value: '%akk',
      language: 'AKKADIAN',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '%es',
      value: '%es',
      language: 'EMESAL',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'KUR{D}',
      value: 'KUR{D}',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'KUR',
          value: 'KUR',
          name: 'KUR',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          surrogate: [],
          type: 'Logogram'
        },
        {
          enclosureType: [],
          cleanValue: '{D}',
          value: '{D}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'D',
              value: 'D',
              name: 'D',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'D',
                  value: 'D',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Determinative'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '%akk',
      value: '%akk',
      language: 'AKKADIAN',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: 'kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line13: Line = {
  prefix: '3.',
  content: [
    {
      enclosureType: [],
      cleanValue: '%sux',
      value: '%sux',
      language: 'SUMERIAN',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: '|KUR₂.KUR|',
      value: '|KUR₂.KUR|',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '|KUR₂.KUR|',
          value: '|KUR₂.KUR|',
          type: 'CompoundGrapheme'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '{kur}ra/RA-kur₂',
      value: '{kur}ra/RA#-kur₂',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{kur}',
          value: '{kur}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        },
        {
          enclosureType: [],
          cleanValue: 'ra/RA',
          value: 'ra/RA#',
          tokens: [
            {
              enclosureType: [],
              cleanValue: 'ra',
              value: 'ra',
              name: 'ra',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: 'RA',
              value: 'RA#',
              name: 'RA',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'RA',
                  value: 'RA',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['#'],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Variant'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: 'kur₂',
          value: 'kur₂',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '{+kur}kur',
      value: '{+kur}kur!',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{+kur}',
          value: '{+kur}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'PhoneticGloss'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur!',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: ['!'],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: ':.',
      value: ':.',
      divider: ':.',
      modifiers: [],
      flags: [],
      type: 'Divider'
    },
    {
      enclosureType: [],
      cleanValue: 'kur/KUR',
      value: 'kur/KUR#',
      language: 'SUMERIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur/KUR',
          value: 'kur/KUR#',
          tokens: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR#',
              name: 'KUR',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'KUR',
                  value: 'KUR',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['#'],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Variant'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 3,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line14: Line = {
  prefix: '4.',
  content: [
    {
      enclosureType: [],
      cleanValue: '%es',
      value: '%es',
      language: 'EMESAL',
      normalized: false,
      type: 'LanguageShift'
    },
    {
      enclosureType: [],
      cleanValue: '|KUR₂.KUR|',
      value: '|KUR₂.KUR|',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '|KUR₂.KUR|',
          value: '|KUR₂.KUR|',
          type: 'CompoundGrapheme'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '{kur}ra/RA-kur₂',
      value: '{kur}ra/RA#-kur₂',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{kur}',
          value: '{kur}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'Determinative'
        },
        {
          enclosureType: [],
          cleanValue: 'ra/RA',
          value: 'ra/RA#',
          tokens: [
            {
              enclosureType: [],
              cleanValue: 'ra',
              value: 'ra',
              name: 'ra',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'ra',
                  value: 'ra',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: 'RA',
              value: 'RA#',
              name: 'RA',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'RA',
                  value: 'RA',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['#'],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Variant'
        },
        {
          enclosureType: [],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: [],
          cleanValue: 'kur₂',
          value: 'kur₂',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: '{+kur}kur',
      value: '{+kur}kur!',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '{+kur}',
          value: '{+kur}',
          parts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            }
          ],
          type: 'PhoneticGloss'
        },
        {
          enclosureType: [],
          cleanValue: 'kur',
          value: 'kur!',
          name: 'kur',
          nameParts: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: ['!'],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: ':.',
      value: ':.',
      divider: ':.',
      modifiers: [],
      flags: [],
      type: 'Divider'
    },
    {
      enclosureType: [],
      cleanValue: 'kur/KUR',
      value: 'kur/KUR#',
      language: 'EMESAL',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'kur/KUR',
          value: 'kur/KUR#',
          tokens: [
            {
              enclosureType: [],
              cleanValue: 'kur',
              value: 'kur',
              name: 'kur',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'kur',
                  value: 'kur',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: [],
              sign: null,
              type: 'Reading'
            },
            {
              enclosureType: [],
              cleanValue: 'KUR',
              value: 'KUR#',
              name: 'KUR',
              nameParts: [
                {
                  enclosureType: [],
                  cleanValue: 'KUR',
                  value: 'KUR',
                  type: 'ValueToken'
                }
              ],
              subIndex: 1,
              modifiers: [],
              flags: ['#'],
              sign: null,
              surrogate: [],
              type: 'Logogram'
            }
          ],
          type: 'Variant'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 4,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line15: Line = {
  prefix: '5.',
  content: [
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: '<kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '',
          value: '<',
          side: 'LEFT',
          type: 'AccidentalOmission'
        },
        {
          enclosureType: ['ACCIDENTAL_OMISSION'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['ACCIDENTAL_OMISSION'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['ACCIDENTAL_OMISSION'],
      cleanValue: 'kur',
      value: 'kur>',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['ACCIDENTAL_OMISSION'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['ACCIDENTAL_OMISSION'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['ACCIDENTAL_OMISSION'],
          cleanValue: '',
          value: '>',
          side: 'RIGHT',
          type: 'AccidentalOmission'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: '<(kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '',
          value: '<(',
          side: 'LEFT',
          type: 'IntentionalOmission'
        },
        {
          enclosureType: ['INTENTIONAL_OMISSION'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['INTENTIONAL_OMISSION'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['INTENTIONAL_OMISSION'],
      cleanValue: 'kur',
      value: 'kur)>',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['INTENTIONAL_OMISSION'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['INTENTIONAL_OMISSION'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['INTENTIONAL_OMISSION'],
          cleanValue: '',
          value: ')>',
          side: 'RIGHT',
          type: 'IntentionalOmission'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: [],
      cleanValue: 'kur',
      value: '<<kur',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: '',
          value: '<<',
          side: 'LEFT',
          type: 'Removal'
        },
        {
          enclosureType: ['REMOVAL'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['REMOVAL'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['REMOVAL'],
      cleanValue: 'kur',
      value: 'kur>>',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['REMOVAL'],
          cleanValue: 'kur',
          value: 'kur',
          name: 'kur',
          nameParts: [
            {
              enclosureType: ['REMOVAL'],
              cleanValue: 'kur',
              value: 'kur',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['REMOVAL'],
          cleanValue: '',
          value: '>>',
          side: 'RIGHT',
          type: 'Removal'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    number: 5,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line16: Line = {
  prefix: '6.',
  content: [
    {
      enclosureType: [],
      cleanValue: '',
      value: '[',
      side: 'LEFT',
      type: 'BrokenAway'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway'
    },
    {
      enclosureType: [],
      cleanValue: '',
      value: '[',
      side: 'LEFT',
      type: 'BrokenAway'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: '{(',
      side: 'LEFT',
      type: 'DocumentOrientedGloss'
    },
    {
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'ra',
      value: 'ra',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'ra',
          value: 'ra',
          name: 'ra',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'ra',
              value: 'ra',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '',
      value: ')}',
      side: 'RIGHT',
      type: 'DocumentOrientedGloss'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: ']',
      side: 'RIGHT',
      type: 'BrokenAway'
    }
  ],
  lineNumber: {
    number: 6,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line17: Line = {
  prefix: '7.',
  content: [
    {
      enclosureType: [],
      cleanValue: '',
      value: '[',
      side: 'LEFT',
      type: 'BrokenAway'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '...',
      value: '...',
      type: 'UnknownNumberOfSigns'
    },
    {
      enclosureType: ['BROKEN_AWAY'],
      cleanValue: '',
      value: '{(',
      side: 'LEFT',
      type: 'DocumentOrientedGloss'
    },
    {
      enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: 'he-pi₂',
      value: 'he-p]i₂',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: true,
      uniqueLemma: ['hepû II'],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'he',
          value: 'he',
          name: 'he',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'he',
              value: 'he',
              type: 'ValueToken'
            }
          ],
          subIndex: 1,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: '-',
          value: '-',
          type: 'Joiner'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          cleanValue: 'pi₂',
          value: 'p]i₂',
          name: 'pi',
          nameParts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'p',
              value: 'p',
              type: 'ValueToken'
            },
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: '',
              value: ']',
              side: 'RIGHT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              cleanValue: 'i',
              value: 'i',
              type: 'ValueToken'
            }
          ],
          subIndex: 2,
          modifiers: [],
          flags: [],
          sign: null,
          type: 'Reading'
        }
      ],
      type: 'Word'
    },
    {
      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
      cleanValue: '',
      value: ')}',
      side: 'RIGHT',
      type: 'DocumentOrientedGloss'
    }
  ],
  lineNumber: {
    number: 7,
    hasPrime: false,
    prefixModifier: null,
    suffixModifier: null,
    type: 'LineNumber'
  },
  type: 'TextLine'
}

const line18: Line = {
  prefix: "D+3'a-4b.",
  content: [
    {
      enclosureType: [],
      cleanValue: 'x',
      value: 'x',
      language: 'AKKADIAN',
      normalized: false,
      lemmatizable: false,
      uniqueLemma: [],
      erasure: 'NONE',
      parts: [
        {
          enclosureType: [],
          cleanValue: 'x',
          value: 'x',
          flags: [],
          type: 'UnclearSign'
        }
      ],
      type: 'Word'
    }
  ],
  lineNumber: {
    start: {
      number: 3,
      hasPrime: true,
      prefixModifier: 'D',
      suffixModifier: 'a'
    },
    end: {
      number: 4,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: 'b'
    },
    type: 'LineNumberRange'
  },
  type: 'TextLine'
}
const line19: Line = {
  type: 'EmptyLine',
  content: [],
  prefix: ''
}
const line20: Line = {
  prefix: '$',
  displayValue: 'single ruling !?',
  content: [
    {
      enclosureType: [],
      cleanValue: ' single ruling !?',
      value: ' single ruling !?',
      type: 'ValueToken'
    }
  ],
  number: 'SINGLE',
  status: 'NEEDS_COLLATION',
  type: 'RulingDollarLine'
}

const line21: Line = {
  prefix: '$',
  type: 'RulingDollarLine',
  number: 'SINGLE',
  status: null,
  displayValue: 'single ruling',
  content: [
    {
      type: 'ValueToken',
      cleanValue: ' single ruling',
      value: ' single ruling',
      enclosureType: []
    }
  ]
}

const line22: Line = {
  prefix: '$',
  type: 'RulingDollarLine',
  number: 'DOUBLE',
  status: null,
  displayValue: 'double ruling',
  content: [
    {
      type: 'ValueToken',
      cleanValue: ' double ruling',
      value: ' double ruling',
      enclosureType: []
    }
  ]
}

const line23: Line = {
  prefix: '$',
  type: 'RulingDollarLine',
  number: 'TRIPLE',
  status: null,
  displayValue: 'triple ruling',
  content: [
    {
      type: 'ValueToken',
      cleanValue: ' triple ruling',
      value: ' triple ruling',
      enclosureType: []
    }
  ]
}

const line24: Line = {
  prefix: '$',
  type: 'SurfaceAtLine',
  // eslint-disable-next-line @typescript-eslint/camelcase
  surface_label: {
    status: [],
    text: '',
    surface: 'OBVERSE'
  },
  displayValue: 'obverse',
  content: [
    {
      type: 'ValueToken',
      cleanValue: ' obverse',
      value: ' obverse',
      enclosureType: []
    }
  ]
}

const line25: Line = {
  displayValue: '(image 1 = foo)',
  text: 'foo',
  content: [
    {
      enclosureType: [],
      cleanValue: ' (image 1 = foo)',
      value: ' (image 1 = foo)',
      type: 'ValueToken'
    }
  ],
  letter: null,
  prefix: '$',
  number: '1',
  type: 'ImageDollarLine'
}

export default new Text({
  lines: [
    line1,
    line2,
    line3,
    line4,
    line5,
    line6,
    line7,
    line8,
    line9,
    line10,
    line11,
    line12,
    line13,
    line14,
    line15,
    line16,
    line17,
    line18,
    line19,
    line20,
    line21,
    line22,
    line23,
    line24,
    line25
  ]
})
