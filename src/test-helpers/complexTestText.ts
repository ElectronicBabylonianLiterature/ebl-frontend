import { Text } from 'fragmentarium/domain/text'

export default new Text({
  lines: [
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 2,
              value: 'k[u]r₂',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'k'
                },
                {
                  type: 'BrokenAway',
                  side: 'LEFT',
                  enclosureType: [],
                  value: '['
                },
                {
                  type: 'Token',
                  enclosureType: ['BROKEN_AWAY'],
                  value: 'u'
                },
                {
                  type: 'BrokenAway',
                  side: 'RIGHT',
                  enclosureType: ['BROKEN_AWAY'],
                  value: ']'
                },
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'r'
                }
              ],
              name: 'kur'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              type: 'BrokenAway',
              side: 'LEFT',
              enclosureType: [],
              value: '['
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'LEFT',
              enclosureType: ['BROKEN_AWAY'],
              value: '('
            },
            {
              modifiers: [],
              subIndex: 2,
              value: 'KUR₂',
              surrogate: [],
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              flags: [],
              sign: null,
              type: 'Logogram',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  value: 'KUR'
                }
              ],
              name: 'KUR'
            },
            {
              type: 'Joiner',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: '-'
            },
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'RA',
                  surrogate: [],
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  flags: [],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                      value: 'RA'
                    }
                  ],
                  name: 'RA'
                }
              ],
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: 'kur/RA'
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: ')'
            }
          ],
          value: 'k[u]r₂-[(KUR₂-kur/RA)',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          type: 'UnknownNumberOfSigns',
          enclosureType: ['BROKEN_AWAY'],
          value: '...'
        },
        {
          type: 'BrokenAway',
          side: 'RIGHT',
          enclosureType: ['BROKEN_AWAY'],
          value: ']'
        }
      ],
      prefix: '1.'
    },
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'CompoundGrapheme',
              enclosureType: [],
              value: '|KUR.KUR|'
            }
          ],
          value: '|KUR.KUR|',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          type: 'Tabulation',
          enclosureType: [],
          value: '($___$)'
        },
        {
          type: 'Tabulation',
          enclosureType: [],
          value: '($___$)'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  type: 'CompoundGrapheme',
                  enclosureType: [],
                  value: '|RA|'
                }
              ],
              enclosureType: [],
              value: 'kur/|RA|'
            }
          ],
          value: 'kur/|RA|',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          type: 'BrokenAway',
          side: 'LEFT',
          enclosureType: [],
          value: '['
        },
        {
          type: 'UnknownNumberOfSigns',
          enclosureType: ['BROKEN_AWAY'],
          value: '...'
        },
        {
          type: 'BrokenAway',
          side: 'RIGHT',
          enclosureType: ['BROKEN_AWAY'],
          value: ']'
        }
      ],
      prefix: '2.'
    },
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: ['@v'],
              subIndex: 1,
              value: '1@v#*',
              enclosureType: [],
              flags: ['#', '*'],
              sign: null,
              type: 'Number',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: '1'
                }
              ],
              name: '1'
            }
          ],
          value: '1@v#*',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'UnclearSign',
              enclosureType: [],
              value: 'x#!',
              flags: ['#', '!']
            }
          ],
          value: 'x#!',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'UnidentifiedSign',
              enclosureType: [],
              value: 'X#?',
              flags: ['#', '?']
            }
          ],
          value: 'X#?',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          modifiers: ['@v', '@44'],
          value: '::@v@44#?',
          enclosureType: [],
          flags: ['#', '?'],
          divider: '::',
          type: 'Divider'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'BrokenAway',
              side: 'LEFT',
              enclosureType: [],
              value: '['
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'LEFT',
              enclosureType: ['BROKEN_AWAY'],
              value: '('
            },
            {
              type: 'UnclearSign',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: 'x',
              flags: []
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: ')'
            }
          ],
          value: '[(x)',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'UnclearSign',
              enclosureType: ['BROKEN_AWAY'],
              value: 'x',
              flags: []
            },
            {
              type: 'BrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY'],
              value: ']'
            }
          ],
          value: 'x]',
          uniqueLemma: [],
          enclosureType: ['BROKEN_AWAY'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        }
      ],
      prefix: '3.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Tabulation',
          enclosureType: [],
          value: '($___$)'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: ['@v'],
              subIndex: null,
              value: 'kurₓ@v#!(KUR@v#?)',
              enclosureType: [],
              flags: ['#', '!'],
              sign: {
                modifiers: ['@v'],
                value: 'KUR@v#?',
                enclosureType: [],
                flags: ['#', '?'],
                type: 'Grapheme',
                name: 'KUR'
              },
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              modifiers: ['@v'],
              subIndex: 2,
              value: 'KUR₂@v#?<(kur-kur)>',
              surrogate: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  type: 'Joiner',
                  enclosureType: [],
                  value: '-'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              flags: ['#', '?'],
              sign: null,
              type: 'Logogram',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'KUR'
                }
              ],
              name: 'KUR'
            }
          ],
          value: 'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '1.'
    },
    {
      type: 'TextLine',
      content: [
        {
          side: 'LEFT',
          enclosureType: [],
          value: '°',
          type: 'Erasure'
        },
        {
          erasure: 'ERASED',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          side: 'CENTER',
          enclosureType: [],
          value: '\\',
          type: 'Erasure'
        },
        {
          erasure: 'OVER_ERASED',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          side: 'RIGHT',
          enclosureType: [],
          value: '°',
          type: 'Erasure'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              side: 'LEFT',
              enclosureType: [],
              value: '°',
              type: 'Erasure'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              side: 'CENTER',
              enclosureType: [],
              value: '\\',
              type: 'Erasure'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              side: 'RIGHT',
              enclosureType: [],
              value: '°',
              type: 'Erasure'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur-°kur\\kur°-kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '5.'
    },
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'd#',
                  enclosureType: [],
                  flags: ['#'],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'd'
                    }
                  ],
                  name: 'd'
                },
                {
                  type: 'Joiner',
                  enclosureType: [],
                  value: '-'
                },
                {
                  modifiers: [],
                  subIndex: 2,
                  value: 'kur₂?',
                  enclosureType: [],
                  flags: ['?'],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{d#-kur₂?}'
            },
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'd',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'd'
                    }
                  ],
                  name: 'd'
                },
                {
                  type: 'Joiner',
                  enclosureType: [],
                  value: '-'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'RA!',
                  surrogate: [],
                  enclosureType: [],
                  flags: ['!'],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'RA'
                    }
                  ],
                  name: 'RA'
                }
              ],
              enclosureType: [],
              value: '{d-RA!}'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'LinguisticGloss',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{{kur}}'
            }
          ],
          value: '{d#-kur₂?}{d-RA!}kur{{kur}}',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          type: 'DocumentOrientedGloss',
          side: 'LEFT',
          enclosureType: [],
          value: '{('
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'd!',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  flags: ['!'],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                      value: 'd'
                    }
                  ],
                  name: 'd'
                }
              ],
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              value: '{d!}'
            }
          ],
          value: 'kur{d!}',
          uniqueLemma: [],
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 2,
              value: 'KUR₂!',
              surrogate: [],
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              flags: ['!'],
              sign: null,
              type: 'Logogram',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: 'KUR'
                }
              ],
              name: 'KUR'
            },
            {
              type: 'Joiner',
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              value: '-'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'ra',
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: 'ra'
                }
              ],
              name: 'ra'
            }
          ],
          value: 'KUR₂!-ra',
          uniqueLemma: [],
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          normalized: false,
          value: '%es',
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          language: 'EMESAL',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'PhoneticGloss',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'k[ur',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                      value: 'k'
                    },
                    {
                      type: 'BrokenAway',
                      side: 'LEFT',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                      value: '['
                    },
                    {
                      type: 'Token',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
                      value: 'ur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  type: 'BrokenAway',
                  side: 'RIGHT',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS', 'BROKEN_AWAY'],
                  value: ']'
                },
                {
                  type: 'Joiner',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: '-'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'RA',
                  surrogate: [],
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  flags: [],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                      value: 'RA'
                    }
                  ],
                  name: 'RA'
                }
              ],
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              value: '{+k[ur]-RA}'
            }
          ],
          value: 'kur{+k[ur]-RA}',
          uniqueLemma: [],
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              value: '{kur}'
            },
            {
              modifiers: [],
              subIndex: 2,
              value: 'kur₂',
              enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '{kur}kur₂',
          uniqueLemma: [],
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          type: 'DocumentOrientedGloss',
          side: 'RIGHT',
          enclosureType: ['DOCUMENT_ORIENTED_GLOSS'],
          value: ')}'
        }
      ],
      prefix: '6.'
    },
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'BrokenAway',
              side: 'LEFT',
              enclosureType: [],
              value: '['
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'LEFT',
              enclosureType: ['BROKEN_AWAY'],
              value: '('
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'PerhapsBrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: ')'
            },
            {
              type: 'BrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY'],
              value: ']'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              type: 'BrokenAway',
              side: 'LEFT',
              enclosureType: [],
              value: '['
            },
            {
              type: 'LinguisticGloss',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'k]ur',
                  enclosureType: ['BROKEN_AWAY'],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY'],
                      value: 'k'
                    },
                    {
                      type: 'BrokenAway',
                      side: 'RIGHT',
                      enclosureType: ['BROKEN_AWAY'],
                      value: ']'
                    },
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'ur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  type: 'Joiner',
                  enclosureType: [],
                  value: '-'
                },
                {
                  type: 'BrokenAway',
                  side: 'LEFT',
                  enclosureType: [],
                  value: '['
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: ['BROKEN_AWAY'],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY'],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: ['BROKEN_AWAY'],
              value: '{{k]ur-[kur}}'
            },
            {
              type: 'BrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY'],
              value: ']'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'k[ur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'k'
                },
                {
                  type: 'BrokenAway',
                  side: 'LEFT',
                  enclosureType: [],
                  value: '['
                },
                {
                  type: 'Token',
                  enclosureType: ['BROKEN_AWAY'],
                  value: 'ur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'BrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY'],
              value: ']'
            }
          ],
          value: '[(kur)]-[{{k]ur-[kur}}]k[ur]',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '7.'
    },
    {
      type: 'TextLine',
      content: [
        {
          type: 'Tabulation',
          enclosureType: [],
          value: '($___$)'
        },
        {
          type: 'Tabulation',
          enclosureType: [],
          value: '($___$)'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          normalized: false,
          value: '%sux',
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'd',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'd'
                    }
                  ],
                  name: 'd'
                }
              ],
              enclosureType: [],
              value: '{d}'
            }
          ],
          value: 'kur{d}',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'KUR',
              surrogate: [],
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Logogram',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'KUR'
                }
              ],
              name: 'KUR'
            }
          ],
          value: 'KUR',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          normalized: false,
          value: '%akk',
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          normalized: false,
          value: '%es',
          enclosureType: [],
          language: 'EMESAL',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'KUR',
              surrogate: [],
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Logogram',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'KUR'
                }
              ],
              name: 'KUR'
            },
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'D',
                  surrogate: [],
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'D'
                    }
                  ],
                  name: 'D'
                }
              ],
              enclosureType: [],
              value: '{D}'
            }
          ],
          value: 'KUR{D}',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          normalized: false,
          value: '%akk',
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: 'kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '8.'
    },
    {
      type: 'TextLine',
      content: [
        {
          normalized: false,
          value: '%sux',
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'CompoundGrapheme',
              enclosureType: [],
              value: '|KUR₂.KUR|'
            }
          ],
          value: '|KUR₂.KUR|',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{kur}'
            },
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'r[a',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'r'
                    },
                    {
                      type: 'BrokenAway',
                      side: 'LEFT',
                      enclosureType: [],
                      value: '['
                    },
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY'],
                      value: 'a'
                    }
                  ],
                  name: 'ra'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'R[A#',
                  surrogate: [],
                  enclosureType: [],
                  flags: ['#'],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'R'
                    },
                    {
                      type: 'BrokenAway',
                      side: 'LEFT',
                      enclosureType: [],
                      value: '['
                    },
                    {
                      type: 'Token',
                      enclosureType: ['BROKEN_AWAY'],
                      value: 'A'
                    }
                  ],
                  name: 'RA'
                }
              ],
              enclosureType: [],
              value: 'r[a/R[A#'
            },
            {
              type: 'BrokenAway',
              side: 'RIGHT',
              enclosureType: ['BROKEN_AWAY'],
              value: ']'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              modifiers: [],
              subIndex: 2,
              value: 'kur₂',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '{kur}r[a/R[A#]-kur₂',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'PhoneticGloss',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{+kur}'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur!',
              enclosureType: [],
              flags: ['!'],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '{+kur}kur!',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        },
        {
          modifiers: [],
          value: ':.',
          enclosureType: [],
          flags: [],
          divider: ':.',
          type: 'Divider'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'KUR#',
                  surrogate: [],
                  enclosureType: [],
                  flags: ['#'],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'KUR'
                    }
                  ],
                  name: 'KUR'
                }
              ],
              enclosureType: [],
              value: 'kur/KUR#'
            }
          ],
          value: 'kur/KUR#',
          uniqueLemma: [],
          enclosureType: [],
          language: 'SUMERIAN',
          type: 'Word',
          lemmatizable: false
        }
      ],
      prefix: '9.'
    },
    {
      type: 'TextLine',
      content: [
        {
          normalized: false,
          value: '%es',
          enclosureType: [],
          language: 'EMESAL',
          type: 'LanguageShift'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'CompoundGrapheme',
              enclosureType: [],
              value: '|KUR₂.KUR|'
            }
          ],
          value: '|KUR₂.KUR|',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Determinative',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{kur}'
            },
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'ra',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'ra'
                    }
                  ],
                  name: 'ra'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'RA#',
                  surrogate: [],
                  enclosureType: [],
                  flags: ['#'],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'RA'
                    }
                  ],
                  name: 'RA'
                }
              ],
              enclosureType: [],
              value: 'ra/RA#'
            },
            {
              type: 'Joiner',
              enclosureType: [],
              value: '-'
            },
            {
              modifiers: [],
              subIndex: 2,
              value: 'kur₂',
              enclosureType: [],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '{kur}ra/RA#-kur₂',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'PhoneticGloss',
              parts: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                }
              ],
              enclosureType: [],
              value: '{+kur}'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur!',
              enclosureType: [],
              flags: ['!'],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: [],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '{+kur}kur!',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        },
        {
          modifiers: [],
          value: ':.',
          enclosureType: [],
          flags: [],
          divider: ':.',
          type: 'Divider'
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              type: 'Variant',
              tokens: [
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'kur',
                  enclosureType: [],
                  flags: [],
                  sign: null,
                  type: 'Reading',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'kur'
                    }
                  ],
                  name: 'kur'
                },
                {
                  modifiers: [],
                  subIndex: 1,
                  value: 'KUR#',
                  surrogate: [],
                  enclosureType: [],
                  flags: ['#'],
                  sign: null,
                  type: 'Logogram',
                  nameParts: [
                    {
                      type: 'Token',
                      enclosureType: [],
                      value: 'KUR'
                    }
                  ],
                  name: 'KUR'
                }
              ],
              enclosureType: [],
              value: 'kur/KUR#'
            }
          ],
          value: 'kur/KUR#',
          uniqueLemma: [],
          enclosureType: [],
          language: 'EMESAL',
          type: 'Word',
          lemmatizable: false
        }
      ],
      prefix: '9.'
    },
    {
      type: 'TextLine',
      content: [
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              side: 'LEFT',
              enclosureType: [],
              value: '<',
              type: 'AccidentalOmission'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['ACCIDENTAL_OMISSION'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['ACCIDENTAL_OMISSION'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '<kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['ACCIDENTAL_OMISSION'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['ACCIDENTAL_OMISSION'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              side: 'RIGHT',
              enclosureType: ['ACCIDENTAL_OMISSION'],
              value: '>',
              type: 'AccidentalOmission'
            }
          ],
          value: 'kur>',
          uniqueLemma: [],
          enclosureType: ['ACCIDENTAL_OMISSION'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              side: 'LEFT',
              enclosureType: [],
              value: '<(',
              type: 'IntentionalOmission'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['INTENTIONAL_OMISSION'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['INTENTIONAL_OMISSION'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '<(kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['INTENTIONAL_OMISSION'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['INTENTIONAL_OMISSION'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              side: 'RIGHT',
              enclosureType: ['INTENTIONAL_OMISSION'],
              value: ')>',
              type: 'IntentionalOmission'
            }
          ],
          value: 'kur)>',
          uniqueLemma: [],
          enclosureType: ['INTENTIONAL_OMISSION'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              side: 'LEFT',
              enclosureType: [],
              value: '<<',
              type: 'Removal'
            },
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['REMOVAL'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['REMOVAL'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            }
          ],
          value: '<<kur',
          uniqueLemma: [],
          enclosureType: [],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        },
        {
          erasure: 'NONE',
          normalized: false,
          parts: [
            {
              modifiers: [],
              subIndex: 1,
              value: 'kur',
              enclosureType: ['REMOVAL'],
              flags: [],
              sign: null,
              type: 'Reading',
              nameParts: [
                {
                  type: 'Token',
                  enclosureType: ['REMOVAL'],
                  value: 'kur'
                }
              ],
              name: 'kur'
            },
            {
              side: 'RIGHT',
              enclosureType: ['REMOVAL'],
              value: '>>',
              type: 'Removal'
            }
          ],
          value: 'kur>>',
          uniqueLemma: [],
          enclosureType: ['REMOVAL'],
          language: 'AKKADIAN',
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '10.'
    },
    {
      content: [
        {
          enclosureType: [],
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        },
        {
          enclosureType: [],
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          value: '{(',
          side: 'LEFT',
          type: 'DocumentOrientedGloss'
        },
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          parts: [
            {
              enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
              subIndex: 1,
              name: 'ra',
              sign: null,
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
                  value: 'ra',
                  type: 'Token'
                }
              ],
              flags: [],
              value: 'ra',
              type: 'Reading',
              modifiers: []
            }
          ],
          language: 'AKKADIAN',
          erasure: 'NONE',
          normalized: false,
          value: 'ra',
          uniqueLemma: [],
          type: 'Word',
          lemmatizable: true
        },
        {
          enclosureType: ['BROKEN_AWAY', 'DOCUMENT_ORIENTED_GLOSS'],
          value: ')}',
          side: 'RIGHT',
          type: 'DocumentOrientedGloss'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          value: ']',
          side: 'RIGHT',
          type: 'BrokenAway'
        },
        {
          enclosureType: [],
          parts: [
            {
              enclosureType: [],
              value: '[',
              side: 'LEFT',
              type: 'BrokenAway'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              value: 'X',
              flags: [],
              type: 'UnidentifiedSign'
            }
          ],
          language: 'AKKADIAN',
          erasure: 'NONE',
          normalized: false,
          value: '[X',
          uniqueLemma: [],
          type: 'Word',
          lemmatizable: false
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          parts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              value: 'x',
              flags: [],
              type: 'UnclearSign'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              value: ']',
              side: 'RIGHT',
              type: 'BrokenAway'
            },
            {
              enclosureType: [],
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: [],
              value: 'x',
              flags: [],
              type: 'UnclearSign'
            }
          ],
          language: 'AKKADIAN',
          erasure: 'NONE',
          normalized: false,
          value: 'x]-x',
          uniqueLemma: [],
          type: 'Word',
          lemmatizable: false
        },
        {
          enclosureType: [],
          value: '[',
          side: 'LEFT',
          type: 'BrokenAway'
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          divider: '::',
          flags: [],
          value: '::',
          type: 'Divider',
          modifiers: []
        },
        {
          enclosureType: ['BROKEN_AWAY'],
          parts: [
            {
              enclosureType: ['BROKEN_AWAY'],
              value: '(',
              side: 'LEFT',
              type: 'PerhapsBrokenAway'
            },
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              subIndex: 1,
              name: 'kur',
              sign: null,
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
                  value: 'kur',
                  type: 'Token'
                }
              ],
              flags: [],
              value: 'kur',
              type: 'Reading',
              modifiers: []
            },
            {
              enclosureType: ['BROKEN_AWAY', 'PERHAPS_BROKEN_AWAY'],
              value: ')',
              side: 'RIGHT',
              type: 'PerhapsBrokenAway'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              value: '-',
              type: 'Joiner'
            },
            {
              enclosureType: ['BROKEN_AWAY'],
              subIndex: 1,
              name: 'kur',
              sign: null,
              nameParts: [
                {
                  enclosureType: ['BROKEN_AWAY'],
                  value: 'ku',
                  type: 'Token'
                },
                {
                  enclosureType: ['BROKEN_AWAY'],
                  value: ']',
                  side: 'RIGHT',
                  type: 'BrokenAway'
                },
                {
                  enclosureType: [],
                  value: 'r',
                  type: 'Token'
                }
              ],
              flags: [],
              value: 'ku]r',
              type: 'Reading',
              modifiers: []
            }
          ],
          language: 'AKKADIAN',
          erasure: 'NONE',
          normalized: false,
          value: '(kur)-ku]r',
          uniqueLemma: [],
          type: 'Word',
          lemmatizable: true
        }
      ],
      prefix: '11.',
      type: 'TextLine'
    },
    {
      type: 'EmptyLine',
      content: [],
      prefix: ''
    },
    {
      prefix: '$',
      type: 'RulingDollarLine',
      number: 'SINGLE',
      displayValue: 'single ruling',
      content: [
        {
          type: 'Token',
          value: ' single ruling',
          enclosureType: []
        }
      ]
    }
  ]
})
