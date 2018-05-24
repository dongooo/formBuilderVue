import bpmDescribedtext from './bpm-describedtext.jsx'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  bpmDescribedtext
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
