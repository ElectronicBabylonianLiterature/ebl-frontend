import { factory } from 'factory-girl'
import { Text } from 'fragmentarium/domain/text'
import Word from 'dictionary/domain/Word'

export default async function createLemmatizationTestText(): Promise<
  [Text, [Word, Word, Word, Word]]
> {
  const words = await factory.buildMany('word', 4)
  const text = new Text({
    lines: [
      {
        type: 'TextLine',
        prefix: '1.',
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: [words[0]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE',
            parts: []
          },
          {
            type: 'Word',
            value: 'nu',
            uniqueLemma: [words[1]._id],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true,
            erasure: 'NONE',
            parts: []
          }
        ]
      }
    ]
  })
  return [text, words]
}
