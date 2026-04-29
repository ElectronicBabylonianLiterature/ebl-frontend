// See: https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const log = require('lighthouse-logger')

function launchChromeAndRunLighthouse(url, flags, config = null) {
  return chromeLauncher
    .launch({ chromeFlags: flags.chromeFlags })
    .then((chrome) =>
      lighthouse(url, { ...flags, port: chrome.port }, config).then((results) =>
        chrome.kill().then(() => results.lhr),
      ),
    )
}

const flags = {
  chromeFlags: ['--show-paint-rects'],
  logLevel: 'info',
}
log.setLevel(flags.logLevel)

launchChromeAndRunLighthouse(process.argv[2], flags)
  .then((results) => {
    const errors = results.audits['errors-in-console'].details.items
    if (errors.length === 0) {
      process.exit(0)
    } else {
      console.log(errors)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
