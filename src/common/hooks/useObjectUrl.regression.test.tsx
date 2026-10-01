import { installObjectUrlMocks } from 'common/hooks/useObjectUrl.regression.testSupport'
import { describeLifecycleScenarios } from 'common/hooks/useObjectUrl.lifecycleScenarios.testSupport'

describe('useObjectUrl - Blob URL Lifecycle Regression Tests', () => {
  installObjectUrlMocks()
  describeLifecycleScenarios()
})
