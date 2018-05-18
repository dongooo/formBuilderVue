/**
 *@author created by Devin
 *@description 入口组件，传入配置数据模型（model），分发生成表单
 *
 */

import idMixin from '../../mixins/id'
import {http} from '../../utils/http'
import bButton from '../button/button'
import './form-builder.css'
import ElementUI from 'element-ui'

const ELButton = ElementUI.Button

http.setApi('weather','data/forecast/101010100.html','http://mobile.weather.com.cn',false)

http.get('weather',(callback)=>{
  console.log(callback)
})

console.log('ELButton------>',ELButton)

export default {
  mixins: [idMixin],
  components: { bButton,ELButton },
  render (h) {

    const elemeButton = h(
      'el-button',
      {
        class: 'name',
        attrs: {
          type: 'primary'
        }
      },
      'form-builder'
    )

     return h('div',{attrs: {id: this.safeId()},class: 'form-builder-wrapper'},[elemeButton])

    // return h('div', { attrs: { id: this.safeId() }, class: this.dropdownClasses }, [
    //   split,
    //   toggle,
    //   menu
    // ])
  },
  props: {
    model:''
  },
  computed: {
    
  }
}
