import formBuilder from './form-builder'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  formBuilder,
  formBuilder: formBuilder
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
