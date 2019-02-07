import { factory, DefaultAdapter } from 'factory-girl'
import Reference from 'bibliography/reference'
import BibliographyEntry from './bibliography/bibliographyEntry'

export default class ReferenceAdapter extends DefaultAdapter {
  build (Model, props) {
    const model = new Model(props.type, props.pages, props.notes, props.linesCited, props.document)
    return model
  }
  async save (model, Model) {
    return model
  }
  async destroy (model, Model) {
    return model
  }
  get (model, attr, Model) {
    return model[attr]
  }
  set (props, model, Model) {
    throw new Error('ReferenceAdapter.set is not implemented.')
  }
}

function integer (min, max) {
  return factory.chance('integer', { min: min, max: max })
}

factory.define('author', Object, {
  given: factory.chance('first'),
  family: factory.chance('last')
})

factory.define('cslData', Object, {
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
  author: factory.assocAttrsMany('author', 2),
  URL: factory.chance('url')
})

factory.define('bibliographyEntry', BibliographyEntry, async buildOptions =>
  buildOptions.cslData || factory.build('cslData'))

factory.define('referenceDto', Object, {
  id: factory.chance('string'),
  type: factory.chance('pickone', ['EDITION', 'DISCUSSION', 'COPY', 'PHOTO']),
  pages: async () => `${await factory.chance('natural')()}-${await factory.chance('natural')()}`,
  notes: factory.chance('string'),
  linesCited: factory.chance('pickset', ['1.', '2.', '3\'.', '4\'.2.'], 2)
})

factory.define('reference', Reference, async buildOptions => ({
  ...(await factory.build('referenceDto')),
  document: await factory.build('bibliographyEntry')
}))
factory.setAdapter(new ReferenceAdapter(), 'reference')
