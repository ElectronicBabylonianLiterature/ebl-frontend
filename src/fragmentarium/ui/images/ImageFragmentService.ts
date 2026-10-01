import FragmentService from 'fragmentarium/application/FragmentService'

export type ImageFragmentService = Pick<
  FragmentService,
  'findPhoto' | 'findFolio' | 'folioPager'
>
