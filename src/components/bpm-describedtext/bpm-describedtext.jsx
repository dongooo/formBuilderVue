import {} from 'element-ui'

const model = {
  type: 'describedtext',
  style: {
    width: '100%',
    minHeight: '60px',
    maxHeight: '200px',
    overflow: 'auto',
    padding: '20px',
    borderStyle: 'dotted',
    borderWidth: '1px',
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: '6px'
  },
  props: {
    value: '',
    hidden: false
  }
}

export default {
  props: {
    model: {
      default: function () {
        return Object.assign({}, model)
      },
      type: Object
    },
    style: {
      default: function () {
        return Object.assign({}, model.style)
      }
    }
  },
  data() {
    return {
    }
  },
  computed: {
    cModel () {
      return this.model
    },
    cStyle () {
      return this.model.style
    }
  },
  render(h) {
    const demo = (
      <div className='bpm-describedtext' style={this.cStyle}></div>
    )

    return demo
  }
}
