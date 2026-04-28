export type ReferenceSectionKey = 'signs' | 'dictionary' | 'bibliography'

export type ReferenceSection = {
  key: ReferenceSectionKey
  title: string
  icon: string
}

export type ReferenceLibrarySection = ReferenceSection & {
  path: string
  description: string
}

export type IntroductionFeatureCard = ReferenceSection & {
  description: string
  to: string
  linkText: string
}

const referenceSections: readonly ReferenceSection[] = [
  { key: 'signs', title: 'Signs', icon: '𒀀' },
  { key: 'dictionary', title: 'Dictionary', icon: 'Aa' },
  { key: 'bibliography', title: 'Bibliography', icon: '⊞' },
]

const sectionByKey: Readonly<Record<ReferenceSectionKey, ReferenceSection>> =
  referenceSections.reduce(
    (accumulator, section) => ({
      ...accumulator,
      [section.key]: section,
    }),
    {} as Record<ReferenceSectionKey, ReferenceSection>,
  )

export function getReferenceLibrarySections(): readonly ReferenceLibrarySection[] {
  return [
    {
      ...sectionByKey.signs,
      path: '/reference-library/signs',
      description: 'Cuneiform sign search',
    },
    {
      ...sectionByKey.dictionary,
      path: '/reference-library/dictionary',
      description: 'Akkadian & Sumerian words',
    },
    {
      ...sectionByKey.bibliography,
      path: '/reference-library/bibliography',
      description: 'References & citations',
    },
  ]
}

export function getIntroductionFeatureCards(): readonly IntroductionFeatureCard[] {
  return [
    {
      ...sectionByKey.signs,
      description:
        'Comprehensive reference tool for cuneiform script with palaeographic resources',
      to: '/tools/signs',
      linkText: 'Explore Signs →',
    },
    {
      ...sectionByKey.dictionary,
      description:
        'Flexible reference for Akkadian vocabulary with CDA and guide words',
      to: '/tools/dictionary',
      linkText: 'Browse Dictionary →',
    },
    {
      ...sectionByKey.bibliography,
      description:
        'Complete bibliography of cuneiform publications with 11,497+ entries',
      to: '/tools/references',
      linkText: 'View Bibliography →',
    },
  ]
}
