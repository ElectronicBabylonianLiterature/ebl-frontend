jest.mock('./sitemapUpdater', () => ({ updateSitemaps: jest.fn() }))

const { updateSitemaps } = require('./sitemapUpdater')

describe('updateSitemaps entrypoint', () => {
  it('runs the sitemap update with the console as its logger', () => {
    jest.isolateModules(() => {
      require('./updateSitemaps')
    })
    expect(updateSitemaps).toHaveBeenCalledWith(console)
  })
})
