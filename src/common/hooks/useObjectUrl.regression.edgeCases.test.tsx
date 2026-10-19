import { installObjectUrlMocks } from 'common/hooks/useObjectUrl.regression.testSupport'
import { describeEdgeCaseScenarios } from 'common/hooks/useObjectUrl.edgeCaseScenarios.testSupport'

describe('useObjectUrl - Blob URL Lifecycle Regression Tests', () => {
  installObjectUrlMocks()
  describeEdgeCaseScenarios()
})
