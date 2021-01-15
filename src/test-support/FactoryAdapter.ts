import { DefaultAdapter } from 'factory-girl'

export default class FactoryAdapter extends DefaultAdapter {
  build(Factory, props) {
    const model = Factory(props)
    return model
  }
  async save(model, Factory) {
    return model
  }
  async destroy(model, Factory) {
    return model
  }
  get(model, attr, Factory) {
    return model[attr]
  }
  set(props, model, Factory): void {
    throw new Error('FactoryAdapter.set is not implemented.')
  }
}
