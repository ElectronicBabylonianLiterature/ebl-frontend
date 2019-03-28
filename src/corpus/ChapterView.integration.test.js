import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'

const text = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      period: 'NB',
      number: 1
    },
    {
      classification: 'Ancient',
      period: 'OB',
      number: 1
    }
  ]
}
const chapter = text.chapters[1]

let apiDriver
let reactDriver

beforeEach(async () => {
  apiDriver = new FakeApi().expectText(text)
  reactDriver = new AppDriver(apiDriver.client)
    .withPath(`/corpus/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}/${encodeURIComponent(chapter.period + ' ' + chapter.number)}`)
    .withSession()
    .render()

  await reactDriver.waitForText(`Edit ${text.name} ${chapter.period} ${chapter.number}`)
})

test('Breadcrumbs', async () => {
  reactDriver.expectBreadcrumbs([
    'eBL',
    'Corpus',
    `${text.category}.${text.index}`,
    `${chapter.period} ${chapter.number}`
  ])
})

test.each([
  ['Classification', 'classification'],
  ['Period', 'period'],
  ['Number', 'number']
])('%s', (label, property) => {
  reactDriver.expectInputElement(label, chapter[property])
})
