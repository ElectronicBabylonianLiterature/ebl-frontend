import {
  ParallelComposition,
  ParallelFragment,
  ParallelText,
} from 'transliteration/domain/parallel-line'

export const fragment = new ParallelFragment({
  content: [],
  hasCf: false,
  museumNumber: {
    prefix: 'X',
    number: '1',
    suffix: '',
  },
  surface: null,
  lineNumber: {
    number: 1,
    hasPrime: true,
    prefixModifier: '',
    suffixModifier: '',
  },
  hasDuplicates: false,
  exists: true,
})

export const text = new ParallelText({
  content: [],
  hasCf: true,
  text: {
    genre: 'L',
    category: 1,
    index: 1,
  },
  chapter: {
    stage: 'Old Babylonian',
    version: '',
    name: 'II',
  },
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: '',
    suffixModifier: '',
  },
  exists: true,
  implicitChapter: null,
})

export const textWithImplicitChapter = new ParallelText({
  content: [],
  hasCf: true,
  text: {
    genre: 'L',
    category: 1,
    index: 1,
  },
  chapter: null,
  lineNumber: {
    number: 2,
    hasPrime: false,
    prefixModifier: '',
    suffixModifier: '',
  },
  exists: true,
  implicitChapter: {
    stage: 'Old Babylonian',
    version: '',
    name: 'II',
  },
})

export const composition = new ParallelComposition({
  content: [],
  hasCf: false,
  name: 'Some Composition',
  lineNumber: {
    number: 1,
    hasPrime: false,
    prefixModifier: '',
    suffixModifier: '',
  },
})
