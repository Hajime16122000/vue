import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { getListItems, headers } from './data.js';

const app = createApp({
  data() {
    return {
      items: [],
      headers: [],
      selectedIndex: -1,
      selectedItem: {},
      isLesserData: false,
      thumbHeight: 0,
      thumbTop: 0,
      isDragging: false,
      startY: 0,
      startThumbTop: 0,
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
    this.$nextTick(() => {
      this.updateThumb();

      window.addEventListener('mousemove', this.drag);
      window.addEventListener('mouseup', this.stopDrag);
    });
  },
  beforeUnmounted() {
    window.removeEventListener('mousemove', this.drag);
    window.removeEventListener('mouseup', this.stopDrag);
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
    updateThumb() {
      const tableBody = this.$refs.tableBody;
      if (!tableBody) return;

      const scrollHeight = tableBody.scrollHeight; // Tổng chiều cao nội dung cuộn
      const clientHeight = tableBody.clientHeight; // Chiều cao hiển thị của vùng cuộn

      // Tính chiều cao của thumb
      this.thumbHeight = (clientHeight / scrollHeight) * (tableBody.offsetHeight - 20);
      this.thumbHeight = Math.max(this.thumbHeight, 20); // Đảm bảo thumb không quá nhỏ

      // Cập nhật vị trí của thumb dựa trên scrollbar
      this.handleScroll();
    },
    handleScroll() {
      const tableBody = this.$refs.tableBody;
      if (!tableBody) return;

      const scrollTop = tableBody.scrollTop;
      const scrollHeight = tableBody.scrollHeight;
      const clientHeight = tableBody.clientHeight;
      const scrollbarHeight = tableBody.offsetHeight - 20; // Chiều cao của rãnh scrollbar (scrollbar div)

      // Tính toán vị trí của thumb
      // thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (scrollbarHeight - this.thumbHeight);
      // Đảm bảo thumbTop không vượt quá rãnh
      this.thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (scrollbarHeight - this.thumbHeight);
      this.thumbTop = Math.min(this.thumbTop, scrollbarHeight - this.thumbHeight);
      this.thumbTop = Math.max(0, this.thumbTop);
    },
    startDrag(e) {
      this.isDragging = true;
      this.startY = e.clientY;
      this.startThumbTop = this.thumbTop;
      e.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
    },
    drag(e) {
      if (!this.isDragging) return;

      const tableBody = this.$refs.tableBody;
      if (!tableBody) return;

      const deltaY = e.clientY - this.startY;
      const scrollbarHeight = tableBody.offsetHeight - 20; // Chiều cao của rãnh scrollbar (scrollbar div)
      const scrollRange = scrollbarHeight - this.thumbHeight; // Phạm vi di chuyển của thumb

      // Tính toán vị trí mới của thumb
      let newThumbTop = this.startThumbTop + deltaY;
      newThumbTop = Math.min(Math.max(0, newThumbTop), scrollRange); // Giới hạn trong phạm vi

      this.thumbTop = newThumbTop;

      // Đồng bộ hóa vị trí cuộn của tableBody với vị trí của thumb
      const scrollHeight = tableBody.scrollHeight;
      const clientHeight = tableBody.clientHeight;
      tableBody.scrollTop = (newThumbTop / scrollRange) * (scrollHeight - clientHeight);
    },
    stopDrag() {
      this.isDragging = false;
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
  },
});

app.mount('#app');

