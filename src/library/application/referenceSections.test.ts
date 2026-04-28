import {
  getIntroductionFeatureCards,
  getReferenceLibrarySections,
} from 'library/application/referenceSections'

describe('referenceSections', () => {
  it('returns reference library sidebar sections', () => {
    expect(getReferenceLibrarySections()).toEqual([
      {
        key: 'signs',
        title: 'Signs',
        icon: '𒀀',
        path: '/reference-library/signs',
        description: 'Cuneiform sign search',
      },
      {
        key: 'dictionary',
        title: 'Dictionary',
        icon: 'Aa',
        path: '/reference-library/dictionary',
        description: 'Akkadian & Sumerian words',
      },
      {
        key: 'bibliography',
        title: 'Bibliography',
        icon: '⊞',
        path: '/reference-library/bibliography',
        description: 'References & citations',
      },
    ])
  })

  it('returns introduction feature cards', () => {
    expect(getIntroductionFeatureCards()).toEqual([
      {
        key: 'signs',
        title: 'Signs',
        icon: '𒀀',
        description:
          'Comprehensive reference tool for cuneiform script with palaeographic resources',
        to: '/tools/signs',
        linkText: 'Explore Signs →',
      },
      {
        key: 'dictionary',
        title: 'Dictionary',
        icon: 'Aa',
        description:
          'Flexible reference for Akkadian vocabulary with CDA and guide words',
        to: '/tools/dictionary',
        linkText: 'Browse Dictionary →',
      },
      {
        key: 'bibliography',
        title: 'Bibliography',
        icon: '⊞',
        description:
          'Complete bibliography of cuneiform publications with 11,497+ entries',
        to: '/tools/references',
        linkText: 'View Bibliography →',
      },
    ])
  })
})
