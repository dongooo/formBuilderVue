import bpmViewer from './bpm-viewer.jsx'
import { registerComponents, vueUse } from '../../utils/plugins'

const components = {
  bpmViewer
}

const VuePlugin = {
  install (Vue) {
    registerComponents(Vue, components)
  }
}

vueUse(VuePlugin)

export default VuePlugin
