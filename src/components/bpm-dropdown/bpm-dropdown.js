
import idMixin from '../../utils/identity';
// import ElTable from 'element-ui/lib/table';
// import ElementUI from 'element-ui';
//console.log('dropdown',Dropdown)
// import './bpm-dropdown.css'

export default {
  mixins: [idMixin],
  render (h) {
   
    const menu = h(
      'Dropdown',
      {
        ref: 'bpm-dropdown',
        on: {
          mouseover: this.onMouseOver,
          keydown: this.onKeydown // tab, up, down, esc
        }
      },
      [this.$slots.default]
    )
    return h('div', { attrs: { id: this.safeId() }, class: this.dropdownClasses }, [
      menu
    ])
  },
  computed: {
   
  }
}
