import { Text } from 'fragmentarium/domain/text'

export default new Text({
  lines: [
    {
      prefix: '1.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur₂',
              sign: null,
              name: 'kur',
              subIndex: 2,
              type: 'Reading'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              side: 'LEFT',
              type: 'BrokenAway',
              value: '['
            },
            {
              side: 'LEFT',
              type: 'PerhapsBrokenAway',
              value: '('
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'KUR'
                }
              ],
              modifiers: [],
              value: 'KUR₂',
              sign: null,
              name: 'KUR',
              subIndex: 2,
              type: 'Logogram',
              surrogate: []
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'RA'
                    }
                  ],
                  modifiers: [],
                  value: 'RA',
                  sign: null,
                  name: 'RA',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Variant',
              value: 'kur/RA'
            },
            {
              side: 'RIGHT',
              type: 'PerhapsBrokenAway',
              value: ')'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur₂-[(KUR₂-kur/RA)',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          type: 'UnknownNumberOfSigns',
          value: '...'
        },
        {
          side: 'RIGHT',
          type: 'BrokenAway',
          value: ']'
        }
      ]
    },
    {
      prefix: '2.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR.KUR|'
            }
          ],
          language: 'AKKADIAN',
          value: '|KUR.KUR|',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
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
          parts: [
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  type: 'CompoundGrapheme',
                  value: '|RA|'
                }
              ],
              type: 'Variant',
              value: 'kur/|RA|'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur/|RA|',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          side: 'LEFT',
          type: 'BrokenAway',
          value: '['
        },
        {
          type: 'UnknownNumberOfSigns',
          value: '...'
        },
        {
          side: 'RIGHT',
          type: 'BrokenAway',
          value: ']'
        }
      ]
    },
    {
      prefix: '3.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              flags: ['#', '*'],
              nameParts: [
                {
                  type: 'Token',
                  value: '1'
                }
              ],
              modifiers: ['@v'],
              value: '1@v#*',
              sign: null,
              name: '1',
              subIndex: 1,
              type: 'Number'
            }
          ],
          language: 'AKKADIAN',
          value: '1@v#*',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: ['#', '!'],
              type: 'UnclearSign',
              value: 'x#!'
            }
          ],
          language: 'AKKADIAN',
          value: 'x#!',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: ['#', '?'],
              type: 'UnidentifiedSign',
              value: 'X#?'
            }
          ],
          language: 'AKKADIAN',
          value: 'X#?',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          flags: ['#', '?'],
          divider: '::',
          modifiers: ['@v', '@44'],
          value: '::@v@44#?',
          type: 'Divider'
        },
        {
          parts: [
            {
              side: 'LEFT',
              type: 'BrokenAway',
              value: '['
            },
            {
              side: 'LEFT',
              type: 'PerhapsBrokenAway',
              value: '('
            },
            {
              flags: [],
              type: 'UnclearSign',
              value: 'x'
            },
            {
              side: 'RIGHT',
              type: 'PerhapsBrokenAway',
              value: ')'
            }
          ],
          language: 'AKKADIAN',
          value: '[(x)',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              type: 'UnclearSign',
              value: 'x'
            },
            {
              side: 'RIGHT',
              type: 'BrokenAway',
              value: ']'
            }
          ],
          language: 'AKKADIAN',
          value: 'x]',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '1.',
      type: 'TextLine',
      content: [
        {
          type: 'Tabulation',
          value: '($___$)'
        },
        {
          parts: [
            {
              flags: ['#', '!'],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: ['@v'],
              value: 'kurₓ@v#!(KUR@v#?)',
              sign: {
                flags: ['#', '?'],
                modifiers: ['@v'],
                value: 'KUR@v#?',
                name: 'KUR',
                type: 'Grapheme'
              },
              name: 'kur',
              subIndex: null,
              type: 'Reading'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              flags: ['#', '?'],
              nameParts: [
                {
                  type: 'Token',
                  value: 'KUR'
                }
              ],
              modifiers: ['@v'],
              value: 'KUR₂@v#?<(kur-kur)>',
              sign: null,
              name: 'KUR',
              subIndex: 2,
              type: 'Logogram',
              surrogate: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ]
            }
          ],
          language: 'AKKADIAN',
          value: 'kurₓ@v#!(KUR@v#?)-KUR₂@v#?<(kur-kur)>',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '5.',
      type: 'TextLine',
      content: [
        {
          side: 'LEFT',
          type: 'Erasure',
          value: '°'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'ERASED'
        },
        {
          side: 'CENTER',
          type: 'Erasure',
          value: '\\'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'OVER_ERASED'
        },
        {
          side: 'RIGHT',
          type: 'Erasure',
          value: '°'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              side: 'LEFT',
              type: 'Erasure',
              value: '°'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'CENTER',
              type: 'Erasure',
              value: '\\'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'Erasure',
              value: '°'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur-°kur\\kur°-kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '6.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              parts: [
                {
                  flags: ['#'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'd'
                    }
                  ],
                  modifiers: [],
                  value: 'd#',
                  sign: null,
                  name: 'd',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  flags: ['?'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur₂?',
                  sign: null,
                  name: 'kur',
                  subIndex: 2,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{d#-kur₂?}'
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'd'
                    }
                  ],
                  modifiers: [],
                  value: 'd',
                  sign: null,
                  name: 'd',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  flags: ['!'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'RA'
                    }
                  ],
                  modifiers: [],
                  value: 'RA!',
                  sign: null,
                  name: 'RA',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Determinative',
              value: '{d-RA!}'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'LinguisticGloss',
              value: '{{kur}}'
            }
          ],
          language: 'AKKADIAN',
          value: '{d#-kur₂?}{d-RA!}kur{{kur}}',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          side: 'LEFT',
          type: 'DocumentOrientedGloss',
          value: '{('
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              parts: [
                {
                  flags: ['!'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'd'
                    }
                  ],
                  modifiers: [],
                  value: 'd!',
                  sign: null,
                  name: 'd',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{d!}'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur{d!}',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: ['!'],
              nameParts: [
                {
                  type: 'Token',
                  value: 'KUR'
                }
              ],
              modifiers: [],
              value: 'KUR₂!',
              sign: null,
              name: 'KUR',
              subIndex: 2,
              type: 'Logogram',
              surrogate: []
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'ra'
                }
              ],
              modifiers: [],
              value: 'ra',
              sign: null,
              name: 'ra',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'KUR₂!-ra',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          normalized: false,
          language: 'EMESAL',
          type: 'LanguageShift',
          value: '%es'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'k'
                    },
                    {
                      side: 'LEFT',
                      type: 'BrokenAway',
                      value: '['
                    },
                    {
                      type: 'Token',
                      value: 'ur'
                    }
                  ],
                  modifiers: [],
                  value: 'k[ur',
                  sign: null,
                  name: 'k[ur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  side: 'RIGHT',
                  type: 'BrokenAway',
                  value: ']'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'RA'
                    }
                  ],
                  modifiers: [],
                  value: 'RA',
                  sign: null,
                  name: 'RA',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'PhoneticGloss',
              value: '{+k[ur]-RA}'
            }
          ],
          language: 'EMESAL',
          value: 'kur{+k[ur]-RA}',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{kur}'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur₂',
              sign: null,
              name: 'kur',
              subIndex: 2,
              type: 'Reading'
            }
          ],
          language: 'EMESAL',
          value: '{kur}kur₂',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          side: 'RIGHT',
          type: 'DocumentOrientedGloss',
          value: ')}'
        }
      ]
    },
    {
      prefix: '7.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              side: 'LEFT',
              type: 'BrokenAway',
              value: '['
            },
            {
              side: 'LEFT',
              type: 'PerhapsBrokenAway',
              value: '('
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'PerhapsBrokenAway',
              value: ')'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              side: 'LEFT',
              type: 'BrokenAway',
              value: '['
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'k'
                    },
                    {
                      side: 'RIGHT',
                      type: 'BrokenAway',
                      value: ']'
                    },
                    {
                      type: 'Token',
                      value: 'ur'
                    }
                  ],
                  modifiers: [],
                  value: 'k]ur',
                  sign: null,
                  name: 'k]ur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  type: 'Joiner',
                  value: '-'
                },
                {
                  side: 'LEFT',
                  type: 'BrokenAway',
                  value: '['
                },
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'LinguisticGloss',
              value: '{{k]ur-[kur}}'
            },
            {
              side: 'RIGHT',
              type: 'BrokenAway',
              value: ']'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'k'
                },
                {
                  side: 'LEFT',
                  type: 'BrokenAway',
                  value: '['
                },
                {
                  type: 'Token',
                  value: 'ur'
                }
              ],
              modifiers: [],
              value: 'k[ur',
              sign: null,
              name: 'k[ur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'BrokenAway',
              value: ']'
            }
          ],
          language: 'AKKADIAN',
          value: '[(kur)-[{{k]ur-[kur}}]k[ur]',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '8.',
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
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          normalized: false,
          language: 'SUMERIAN',
          type: 'LanguageShift',
          value: '%sux'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'd'
                    }
                  ],
                  modifiers: [],
                  value: 'd',
                  sign: null,
                  name: 'd',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{d}'
            }
          ],
          language: 'SUMERIAN',
          value: 'kur{d}',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'KUR'
                }
              ],
              modifiers: [],
              value: 'KUR',
              sign: null,
              name: 'KUR',
              subIndex: 1,
              type: 'Logogram',
              surrogate: []
            }
          ],
          language: 'SUMERIAN',
          value: 'KUR',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          normalized: false,
          language: 'AKKADIAN',
          type: 'LanguageShift',
          value: '%akk'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          normalized: false,
          language: 'EMESAL',
          type: 'LanguageShift',
          value: '%es'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'EMESAL',
          value: 'kur',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'KUR'
                }
              ],
              modifiers: [],
              value: 'KUR',
              sign: null,
              name: 'KUR',
              subIndex: 1,
              type: 'Logogram',
              surrogate: []
            },
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'D'
                    }
                  ],
                  modifiers: [],
                  value: 'D',
                  sign: null,
                  name: 'D',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Determinative',
              value: '{D}'
            }
          ],
          language: 'EMESAL',
          value: 'KUR{D}',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          normalized: false,
          language: 'AKKADIAN',
          type: 'LanguageShift',
          value: '%akk'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '9.',
      type: 'TextLine',
      content: [
        {
          normalized: false,
          language: 'SUMERIAN',
          type: 'LanguageShift',
          value: '%sux'
        },
        {
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR₂.KUR|'
            }
          ],
          language: 'SUMERIAN',
          value: '|KUR₂.KUR|',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{kur}'
            },
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'ra'
                    }
                  ],
                  modifiers: [],
                  value: 'ra',
                  sign: null,
                  name: 'ra',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  flags: ['#'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'RA'
                    }
                  ],
                  modifiers: [],
                  value: 'RA#',
                  sign: null,
                  name: 'RA',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Variant',
              value: 'ra/RA#'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur₂',
              sign: null,
              name: 'kur',
              subIndex: 2,
              type: 'Reading'
            }
          ],
          language: 'SUMERIAN',
          value: '{kur}ra/RA#-kur₂',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'PhoneticGloss',
              value: '{+kur}'
            },
            {
              flags: ['!'],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur!',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'SUMERIAN',
          value: '{+kur}kur!',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          flags: [],
          divider: ':.',
          modifiers: [],
          value: ':.',
          type: 'Divider'
        },
        {
          parts: [
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  flags: ['#'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'KUR'
                    }
                  ],
                  modifiers: [],
                  value: 'KUR#',
                  sign: null,
                  name: 'KUR',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Variant',
              value: 'kur/KUR#'
            }
          ],
          language: 'SUMERIAN',
          value: 'kur/KUR#',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '9.',
      type: 'TextLine',
      content: [
        {
          normalized: false,
          language: 'EMESAL',
          type: 'LanguageShift',
          value: '%es'
        },
        {
          parts: [
            {
              type: 'CompoundGrapheme',
              value: '|KUR₂.KUR|'
            }
          ],
          language: 'EMESAL',
          value: '|KUR₂.KUR|',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'Determinative',
              value: '{kur}'
            },
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'ra'
                    }
                  ],
                  modifiers: [],
                  value: 'ra',
                  sign: null,
                  name: 'ra',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  flags: ['#'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'RA'
                    }
                  ],
                  modifiers: [],
                  value: 'RA#',
                  sign: null,
                  name: 'RA',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Variant',
              value: 'ra/RA#'
            },
            {
              type: 'Joiner',
              value: '-'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur₂',
              sign: null,
              name: 'kur',
              subIndex: 2,
              type: 'Reading'
            }
          ],
          language: 'EMESAL',
          value: '{kur}ra/RA#-kur₂',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              parts: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                }
              ],
              type: 'PhoneticGloss',
              value: '{+kur}'
            },
            {
              flags: ['!'],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur!',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'EMESAL',
          value: '{+kur}kur!',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          flags: [],
          divider: ':.',
          modifiers: [],
          value: ':.',
          type: 'Divider'
        },
        {
          parts: [
            {
              tokens: [
                {
                  flags: [],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'kur'
                    }
                  ],
                  modifiers: [],
                  value: 'kur',
                  sign: null,
                  name: 'kur',
                  subIndex: 1,
                  type: 'Reading'
                },
                {
                  flags: ['#'],
                  nameParts: [
                    {
                      type: 'Token',
                      value: 'KUR'
                    }
                  ],
                  modifiers: [],
                  value: 'KUR#',
                  sign: null,
                  name: 'KUR',
                  subIndex: 1,
                  type: 'Logogram',
                  surrogate: []
                }
              ],
              type: 'Variant',
              value: 'kur/KUR#'
            }
          ],
          language: 'EMESAL',
          value: 'kur/KUR#',
          normalized: false,
          lemmatizable: false,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '10.',
      type: 'TextLine',
      content: [
        {
          parts: [
            {
              side: 'LEFT',
              type: 'AccidentalOmission',
              value: '<'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: '<kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'AccidentalOmission',
              value: '>'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur>',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              side: 'LEFT',
              type: 'IntentionalOmission',
              value: '<('
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: '<(kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'IntentionalOmission',
              value: ')>'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur)>',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              side: 'LEFT',
              type: 'Removal',
              value: '<<'
            },
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: '<<kur',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'kur'
                }
              ],
              modifiers: [],
              value: 'kur',
              sign: null,
              name: 'kur',
              subIndex: 1,
              type: 'Reading'
            },
            {
              side: 'RIGHT',
              type: 'Removal',
              value: '>>'
            }
          ],
          language: 'AKKADIAN',
          value: 'kur>>',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        }
      ]
    },
    {
      prefix: '11.',
      type: 'TextLine',
      content: [
        {
          side: 'RIGHT',
          type: 'BrokenAway',
          value: ']'
        },
        {
          side: 'LEFT',
          type: 'BrokenAway',
          value: '['
        },
        {
          side: 'LEFT',
          type: 'DocumentOrientedGloss',
          value: '{('
        },
        {
          parts: [
            {
              flags: [],
              nameParts: [
                {
                  type: 'Token',
                  value: 'ra'
                }
              ],
              modifiers: [],
              value: 'ra',
              sign: null,
              name: 'ra',
              subIndex: 1,
              type: 'Reading'
            }
          ],
          language: 'AKKADIAN',
          value: 'ra',
          normalized: false,
          lemmatizable: true,
          type: 'Word',
          uniqueLemma: [],
          erasure: 'NONE'
        },
        {
          side: 'RIGHT',
          type: 'DocumentOrientedGloss',
          value: ')}'
        },
        {
          side: 'RIGHT',
          type: 'BrokenAway',
          value: ']'
        }
      ]
    },
    {
      prefix: '$',
      type: 'ControlLine',
      content: [
        {
          type: 'Token',
          value: ' single ruling'
        }
      ]
    }
  ]
})
