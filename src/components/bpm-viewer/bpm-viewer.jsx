import ElementUI from 'element-ui'

const Collapse = ElementUI.Collapse

const Pstyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

export default {
  components: {
    Collapse
  },
  props: {
    title: {
      default: 'Component View',
      type: String
    },
    name: {
      default: '',
      require: true,
      type: String
    }
  },
  data () {
    return {
      Pstyle: Object.assign({}, Pstyle)
    }
  },
  render (h) {
    const cpt = h('div', [
      h(this.name)
    ])

    const demo = (
      <el-collapse accordion>
        <el-collapse-item>
          <template slot="title">
            { this.title }
          </template>
          <div style={this.Pstyle}>
            <div style={{flex: 1}}>
              {cpt}
            </div>
            <div style={{flex: 1}}>
              <slot name='describe'></slot>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    )

    return demo
  }
}
