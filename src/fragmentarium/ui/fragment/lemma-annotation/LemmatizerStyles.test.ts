import { readFileSync } from 'fs'
import { join } from 'path'

it('lays out the lemma select and action button in one flex row', () => {
  const styles = readFileSync(join(__dirname, 'Lemmatizer.sass'), 'utf8')

  expect(styles).toMatch(
    /&__row\n(?:\s+[^\n]+\n){0,6}\s+display: flex\n(?:\s+[^\n]+\n){0,6}\s+flex-wrap: nowrap/,
  )
})
