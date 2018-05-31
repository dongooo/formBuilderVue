import bpmSelect from './bpm-select.vue'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  bpmSelect,
  bpmSelect: bpmSelect
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
