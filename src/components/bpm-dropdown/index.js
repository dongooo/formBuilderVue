//import bpmDropdown from './bpm-dropdown'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  bpmDropdown,
  bpmDropdown:bpmDropdown
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
