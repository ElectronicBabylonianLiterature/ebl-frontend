import { createChapter } from 'corpus/domain/text'
import { Chapter } from 'corpus/domain/chapter'

it('fills every missing field with its default', () => {
  expect(createChapter({})).toEqual(
    new Chapter({
      textId: { genre: 'L', category: 0, index: 0 },
      textHasDoi: false,
      classification: 'Ancient',
      stage: 'Neo-Assyrian',
      version: '',
      name: '',
      order: 0,
      manuscripts: [],
      uncertainFragments: [],
      lines: [],
    }),
  )
})

it('keeps the fields it is given', () => {
  const textId = { genre: 'D', category: 2, index: 3 }

  const chapter = createChapter({ textId, name: 'II', order: 4 })

  expect(chapter.textId).toEqual(textId)
  expect(chapter.name).toEqual('II')
  expect(chapter.order).toEqual(4)
  expect(chapter.stage).toEqual('Neo-Assyrian')
})
