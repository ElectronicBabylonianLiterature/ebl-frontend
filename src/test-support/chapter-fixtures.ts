import { Factory } from 'fishery'
import Chance from 'chance'
import { ChapterDisplay, ChapterId, LineDisplay } from 'corpus/domain/chapter'
import { TextId } from 'corpus/domain/text'
import { periods } from 'corpus/domain/period'
import _ from 'lodash'
import { reconstructionTokens } from './test-corpus-text'
import { LineNumber } from 'transliteration/domain/line-number'

const defaultChance = new Chance()

export const textIdFactory = Factory.define<TextId>(() => ({
  genre: defaultChance.pickone(['L', 'D', 'Lex']),
  category: defaultChance.integer({ min: 0 }),
  index: defaultChance.integer({ min: 0 }),
}))

export const chapterIdFactory = Factory.define<ChapterId>(() => ({
  textId: textIdFactory.build(),
  stage: defaultChance.pickone([...periods]).name,
  name: defaultChance.sentence(),
}))

export const lineNumberFactory = Factory.define<LineNumber>(({ sequence }) => ({
  number: sequence,
  hasPrime: false,
  prefixModifier: null,
  suffixModifier: null,
  type: 'LineNumber',
}))

export const lineDisplayFactory = Factory.define<LineDisplay>(() => ({
  number: lineNumberFactory.build(),
  isSecondLineOfParallelism: defaultChance.bool(),
  isBeginningOfSection: defaultChance.bool(),
  intertext: [
    {
      text: defaultChance.sentence(),
      type: 'StringPart',
    },
  ],
  reconstruction: _.cloneDeep(reconstructionTokens),
  translation: [
    {
      text: defaultChance.sentence(),
      type: 'StringPart',
    },
  ],
}))

export const chapterDisplayFactory = Factory.define<ChapterDisplay>(() => ({
  id: chapterIdFactory.build(),
  textName: defaultChance.sentence(),
  isSingleStage: defaultChance.bool(),
  title: [
    {
      text: defaultChance.sentence(),
      type: 'StringPart',
    },
  ],
  lines: lineDisplayFactory.buildList(2),
}))
