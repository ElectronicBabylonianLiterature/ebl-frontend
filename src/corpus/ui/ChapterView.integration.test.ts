import { waitFor } from '@testing-library/react'
import { textIdToString } from 'transliteration/domain/text-id'
import { lines } from 'test-support/test-fragment'
import { singleRulingDto } from 'test-support/lines/dollar'
import {
  chapter,
  registerChapterViewSetup,
} from 'corpus/ui/ChapterView.integration.testSupport'

describe('Display chapter', () => {
  const context = registerChapterViewSetup()

  test('Breadcrumbs', () => {
    context.appDriver.breadcrumbs.expectCrumbs([
      'eBL',
      'Corpus',
      `${textIdToString(chapter.id.textId)} ${chapter.textName}`,
      `Chapter ${chapter.id.stage} ${chapter.id.name}`,
    ])
  })

  test('Snapshot', () => {
    expect(context.appDriver.getView().container).toMatchSnapshot()
    expect(
      context.appDriver
        .getView()
        .getByText(`Chapter ${chapter.id.stage} ${chapter.id.name}`),
    ).toBeVisible()
  })

  test('Show notes', () => {
    context.appDriver.clickByRole('button', 'Show notes', 0)
    expect(context.appDriver.getView().container).toMatchSnapshot()
  })

  test('Show parallels', () => {
    context.appDriver.clickByRole('button', 'Show parallels', 0)
    expect(context.appDriver.getView().container).toMatchSnapshot()
  })

  test('Sidebar', async () => {
    chapter.lines.forEach((line) => {
      context.fakeApi.expectLineDetails(chapter.id, line.originalIndex, {
        variants: [
          {
            originalIndex: 0,
            manuscripts: [
              {
                provenance: 'Standard Text',
                periodModifier: 'None',
                period: 'None',
                siglumDisambiguator: '',
                oldSigla: [],
                type: 'None',
                labels: [],
                line: lines[line.originalIndex],
                paratext: [singleRulingDto],
                references: [],
                joins: [],
                museumNumber: 'BM.X',
                isInFragmentarium: false,
                accession: 'X.1',
              },
            ],
          },
        ],
      })
    })
    context.appDriver.click('Settings')
    await context.appDriver.waitForText('Score')
    context.appDriver.click('Score')
    await waitFor(() => {
      expect(
        context.appDriver.getView().queryAllByText(/Loading/).length,
      ).toEqual(0)
    })
    context.appDriver.click('Meter')
    context.appDriver.click('Parallels')
    context.appDriver.click('Notes')
    context.appDriver.click('Deutsch')
    context.appDriver.click('Close')
    await context.appDriver.waitForTextToDisappear('Close')

    context.appDriver.click('Settings')
    await context.appDriver.waitForText('Score')
    context.appDriver.expectChecked('Score')
    context.appDriver.expectChecked('Meter')
    context.appDriver.expectChecked('Parallels')
    context.appDriver.expectChecked('Notes')
    context.appDriver.click('Meter')
    context.appDriver.expectNotChecked('Meter')
    context.appDriver.click('Meter')
    context.appDriver.expectChecked('Meter')
    context.appDriver.click('Close')
    await context.appDriver.waitForTextToDisappear('Close')

    expect(context.appDriver.getView().container).toMatchSnapshot()
    expect(
      context.appDriver.getView().queryByText('Score'),
    ).not.toBeInTheDocument()
  })

  test('How to cite', async () => {
    context.appDriver.click('How to cite')
    const bibtexButton = await context.appDriver
      .getView()
      .findByRole('button', { name: /BibTeX/i })
    expect(context.appDriver.getView().container).toMatchSnapshot()
    expect(bibtexButton).toBeVisible()
  })
})
