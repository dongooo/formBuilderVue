import bpmDivider from './bpm-divider.jsx'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  bpmDivider
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
