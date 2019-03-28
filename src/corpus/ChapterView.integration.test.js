import Promise from 'bluebird'
import AppDriver from 'test-helpers/AppDriver'

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

class FakeApi {
  gets = []
  client = {
    fetchJson: (path, authenticate) => {
      const expectation = this.gets.find(entry => entry.path === path && entry.authenticate === authenticate)
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} GET request: ${path}`))
    }
  }

  expectText (text) {
    this.gets.push({
      path: `/texts/${text.category}.${text.index}`,
      authenticate: true,
      response: text
    })
    return this
  }
}

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
