import {
  DivisionAtLine,
  ObjectAtLine,
  SurfaceAtLine,
  HeadingAtLine,
  DiscourseAtLine,
  SealAtLine,
} from 'transliteration/domain/line'

export const surface: SurfaceAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'obverse?!',
      value: 'obverse?!',
      type: 'ValueToken',
    },
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  surface_label: {
    status: ['UNCERTAIN', 'CORRECTION'],
    surface: 'OBVERSE',
    text: '',
    abbreviation: 'o',
  },
  displayValue: 'obverse?!',
  type: 'SurfaceAtLine',
}

export const object: ObjectAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'object Stone wig',
      value: 'object Stone wig',
      type: 'ValueToken',
    },
  ],
  label: {
    status: [],
    object: 'OBJECT',
    text: 'stone wig',
    abbreviation: 'stone wig',
  },
  displayValue: 'object Stone wig',
  type: 'ObjectAtLine',
}

export const heading: HeadingAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'h1',
      value: 'h1',
      type: 'ValueToken',
    },
  ],
  number: 1,
  displayValue: 'h1',
  type: 'HeadingAtLine',
}

export const division: DivisionAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'm=division paragraph 1',
      value: 'm=division paragraph 1',
      type: 'ValueToken',
    },
  ],
  text: 'paragraph',
  number: 1,
  displayValue: 'm=division paragraph 1',
  type: 'DivisionAtLine',
}

export const discourse: DiscourseAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'colophon',
      value: 'colophon',
      type: 'ValueToken',
    },
  ],
  // eslint-disable-next-line @typescript-eslint/camelcase
  discourse_label: 'COLOPHON',
  displayValue: 'colophon',
  type: 'DiscourseAtLine',
}

export const seal: SealAtLine = {
  prefix: '@',
  content: [
    {
      enclosureType: [],
      erasure: 'NONE',
      cleanValue: 'seal 1',
      value: 'seal 1',
      type: 'ValueToken',
    },
  ],
  number: 1,
  displayValue: 'seal 1',
  type: 'SealAtLine',
}
