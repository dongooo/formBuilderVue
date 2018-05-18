import idMixin from '../../mixins/id'
import { http } from '../../utils/http'
import ElementUI from 'element-ui'

const ELSelect = ElementUI.Select
const ELOption = ElementUI.Option

http.setApi('weather', 'data/forecast/101010100.html', 'http://mobile.weather.com.cn', false)

http.get('weather', (callback) => {
  console.log(callback)
})

export default {
  mixins: [idMixin],
  components: { ELSelect,ELOption },
  inheritAttrs: false,
  render(h) {
    const $slots = this.$slots
    const options = [
      {
      "DicId": 11,
      "DicCode": "35",
      "DicDesc": "福建"
      },
      {
      "DicId": 12,
      "DicCode": "62",
      "DicDesc": "甘肃"
      },
      {
      "DicId": 13,
      "DicCode": "41",
      "DicDesc": "河南"
      },
      {
      "DicId": 14,
      "DicCode": "64",
      "DicDesc": "宁夏"
      },
      {
      "DicId": 15,
      "DicCode": "12",
      "DicDesc": "天津"
      }]

    const elemeOptions = options.map((option,index) => {
        return h(
          'el-option',
          {
          attrs: { 
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
        class: 'name',
        attrs: {
          type: 'primary',
          placeholder: '请选择',
        }
      }
    )

    return h('div', { attrs: { id: this.safeId() }, class: 'bpm-select-container' }, [elemeSelect,elemeOptions])

    // return h('div', { attrs: { id: this.safeId() }, class: this.dropdownClasses }, [
    //   split,
    //   toggle,
    //   menu
    // ])
  },
  props: {
    ops: {}
  },
  computed: {

  }
}

const model = {
  type: "dropdown",
  name: "dropdownName",
  width: "200",
  indent: 2,
  title: {
    "zh-cn": "dropdown"
  },
  description: {
    "zh-cn": "描述"
  },
  valueName: "dropdownValueName",
  isRequired: true,
  requiredErrorText: {
    "zh-cn": "请选择一项"
  },
  titleLocation: "left",
  choices: [
    {
      value: "item1",
      text: {
        "zh-cn": "选项1"
      }
    },
    {
      value: "item2",
      text: {
        "zh-cn": "选项2"
      }
    },
    {
      value: "item3",
      text: {
        "zh-cn": "选项3"
      }
    }
  ],
  otherText: {
    "zh-cn": "填写其他答案哦"
  },
  otherErrorText: {
    "zh-cn": "填写其他答案啊"
  },
  optionsCaption: {
    "zh-cn": "dropdownCaption"
  }
}
