import { factory } from 'factory-girl'

factory.define('author', Object, {
  given: factory.chance('sentence', { words: 2 }),
  family: factory.chance('sentence', { words: 2 })
})

factory.define('bibliographyEntry', Object, {
  id: factory.chance('string'),
  title: factory.chance('sentence'),
  type: factory.chance('pickone', ['article-journal', 'paper-conference']),
  'DOI': '10.1210/MEND.16.4.0808',
  'issued': {
    'date-parts': [
      [
        factory.chance('integer', { min: 800, max: 2019 }),
        factory.chance('integer', { min: 1, max: 12 }),
        factory.chance('integer', { min: 1, max: 28 })
      ]
    ]
  },
  volume: async () => String(await factory.chance('integer', { min: 1, max: 99 })),
  page: async () => `${await factory.chance('integer', { min: 1, max: 99 })}-${await factory.chance('integer', { min: 100, max: 999 })}`,
  issue: factory.chance('integer', { min: 1, max: 99 }),
  'container-title': factory.chance('sentence'),
  'author': factory.assocAttrsMany('author', 2)
})
