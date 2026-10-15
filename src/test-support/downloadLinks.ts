import { screen } from '@testing-library/react'

export type DownloadLink = [name: string, extension: string, url: string]

export function describeDownloadLinks(
  links: readonly DownloadLink[],
  setup: () => Promise<void>,
  fileBaseName: () => string,
): void {
  describe.each(links)('%s download link', (name, extension, url) => {
    test('href', async () => {
      await setup()
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', url)
    })

    test('download', async () => {
      await setup()
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'download',
        `${fileBaseName()}.${extension}`,
      )
    })
  })
}
