import { factory } from 'factory-girl'

function integer (min, max) {
  return factory.chance('integer', { min: min, max: max })
}

factory.define('author', Object, {
  given: factory.chance('first'),
  family: factory.chance('last')
})

factory.define('bibliographyEntry', Object, {
  id: factory.chance('guid'),
  title: factory.chance('sentence'),
  type: factory.chance('pickone', ['article-journal', 'paper-conference']),
  issued: () => {
    const date = factory.chance('date')()
    return {
      'date-parts': [
        [
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ]
      ]
    }
  },
  volume: () => String(integer(1, 99)()),
  page: () => `${integer(1, 99)()}-${integer(100, 999)()}`,
  issue: integer(1, 99),
  'container-title': factory.chance('sentence'),
  author: factory.assocAttrsMany('author', 2)
})
