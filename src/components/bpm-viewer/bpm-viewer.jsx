const style = {

}

const sty = new stylesheet({
  .test {
    color: 'red'
  }
})

export default {
  props: {
    title: {
      default: 'Component View'
    }
  },
  data() {
    return {
      style
    }
  },
  render(h) {
    const demo = (
      <div className='bpm-divider' style={this.cModel.style}></div>
    )

    return demo
  }
}
