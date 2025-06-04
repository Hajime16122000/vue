import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { getListItems, headers } from './data.js';


const app = createApp({
  data() {
    return {
      items: [],
      headers: [],
      selectedIndex: -1,
      selectedItem: {},
      isLesserData: false
    };
  },
  computed: {
    componentClass() {
      return this.isLesserData ? 'lesser' : '';
    },
    gridColumnsValue() {
      const colsWidth = this.headers.map(header => header.width || 'auto');
      return colsWidth.join(' ');
    },
    detailData() {
      if (!this.isEmpty(this.selectedItem)) {
        return { ...this.selectedItem };
      } else {
        return {
          userName: '',
          age: '',
          gender: '',
          dateOfBirth: '',
        };
      }
    },
  },
  created() {
    this.items = [...getListItems(30)];
    this.headers = [...headers];
  },
  mounted() {
    this.handleCheckDataLesser();
  },
  methods: {
    handleCheckDataLesser() {
      const tableBody = this.$refs.tableBody;
      if (tableBody.offsetHeight === tableBody.scrollHeight) {
        this.isLesserData = true;
      } else {
        this.isLesserData = false;
      }
    },
    handleSelect(index) {
      if (this.selectedIndex === index) {
        this.selectedIndex = -1
        this.selectedItem = {}
      } else {
        this.selectedIndex = index;
        this.selectedItem = this.items.find((item, idx) => idx === index) || {};
      }
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
  },
});

app.mount('#app');

