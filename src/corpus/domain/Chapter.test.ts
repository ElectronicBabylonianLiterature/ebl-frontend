import { chapter } from 'test-support/test-corpus-text'
import { createManuscriptLine } from 'corpus/domain/line'

describe('getSiglum', () => {
  it('returns the siglum of the manuscript of the line', () => {
    const manuscript = chapter.manuscripts[0]

    expect(
      chapter.getSiglum(
        createManuscriptLine({ manuscriptId: Number(manuscript.id) }),
      ),
    ).toEqual(manuscript.siglum)
  })

  it('names the id of a manuscript that is not in the chapter', () => {
    expect(
      chapter.getSiglum(createManuscriptLine({ manuscriptId: 9999 })),
    ).toEqual('<unknown ID: 9999>')
  })
})
