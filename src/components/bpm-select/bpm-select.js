import idMixin from '../../mixins/id'
import { http } from '../../utils/http'
import ElementUI from 'element-ui'
import bpmSelect from './bpm-select.vue'
const ELSelect = ElementUI.Select
const ELOption = ElementUI.Option
const ELSelectProps = ELSelect.props
const ELInput = ElementUI.Input

// http.setApi('weather', 'data/forecast/101010100.html', 'http://mobile.weather.com.cn', false)

// http.get('weather', (callback) => {
//   console.log(callback)
// })

console.log(bpmSelect)

export default {
  mixins: [idMixin],
  components: { ELOption,ELSelect },
  inheritAttrs: false,
  render(h,context) {
    console.log('ref------>',this)
  
    console.log('context---->',context)
    const self = this
    console.log('_props__',self)
    const {attributes,event} = this.model
    const options = attributes['choices']
    const elemeOptions = options.map((option,index) => {
        return h(
          'el-option',
          {
            attrs: { 
              id: this.safeId(),
              key:option.DicId,
              label:option.DicDesc,
              value:option.DicCode
            }
          }
      )
    })


    const elemeSelect = h(
      'el-select',
      {
        class: 'bpm-select-container',
        domProps: {
          value: self.value
        },
        attrs: {
          type: 'primary',
          value:'',
          placeholder: '请选择',
        }
      },
      [elemeOptions]
    )

    return bpmSelect
  },
  props: {
    model:{
      type:Object
    }
  },
  computed: {

  }
}