const model = {
  type: 'divider',
  style: {
    width: '100%',
    height: '0px',
    margin: '20px auto 40px',
    borderStyle: 'dotted',
    borderWidth: '2px 0 0',
    borderColor: 'red'
  }
}

export default {
  props: {
    model: {
      default: function () {
        return Object.assign({}, model)
      },
      type: Object
    }
  },
  data () {
    return {
    }
  },
  computed: {
    cModel () {
      return this.model
    }
  },
  render (h) {
    const demo = (
      <div className='bpm-divider' style={this.cModel.style}></div>
    )

    return demo
  }
}
