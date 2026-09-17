import fs from 'fs'
import path from 'path'
import { EBL_COLOR_BRAND_PRIMARY } from 'designTokens'

function readSassToken(tokenName: string): string | undefined {
  const tokens = fs.readFileSync(
    path.join(__dirname, '_design-tokens.sass'),
    'utf8',
  )
  return new RegExp(`^\\$${tokenName}: (.+)$`, 'm').exec(tokens)?.[1]
}

test('brand primary stays in sync with the Sass design token', () => {
  expect(readSassToken('ebl-color-brand-primary')).toBe(EBL_COLOR_BRAND_PRIMARY)
})
