import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { getListItems, headers } from './data.js';

const app = createApp({
  data() {
    return {
      items: [],
      originItems: [],
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
    scrollConfig() {
      const tableBody = this.$refs.tableBody;

      return {
        scrollHeight: tableBody.scrollHeight, // Tổng chiều cao nội dung cuộn
        clientHeight: tableBody.clientHeight, // Chiều cao hiển thị của vùng cuộn
        scrollbarHeight: tableBody.offsetHeight - 20, // Chiều cao của rãnh scrollbar (scrollbar div)
      };
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
    const initItems = [...getListItems(30)];
    this.items = [ ...initItems ];
    this.originItems = [ ...initItems ];
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
    handleSort(clickedIndex) {
      this.selectedIndex = -1;
      this.headers = this.headers.map((header, index) => {
        if (clickedIndex === index) {
          if (header.sort === 'asc') {
            return { ...header, sort: 'desc' };
          } else if (header.sort === 'desc') {
            return { ...header, sort: '' };
          } else {
            return { ...header, sort: 'asc' };
          }
        } else {
          return { ...header, sort: '' };
        }
      });

      const colName = this.headers[clickedIndex].value;
      const sortDirection = this.headers[clickedIndex].sort;
      if (sortDirection) {
        this.sortColumn(colName, sortDirection);
      } else {
        this.items = [ ...this.originItems ];
      }
    },
    sortColumn(columnName, sortDirection) {
      const sortFactor = sortDirection === 'asc' ? 1 : -1;

      const sortItems = this.items.sort((itemA, itemB) => {
        const valueA = itemA[columnName];
        const valueB = itemB[columnName];

        let comparison = 0;
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          // Sắp xếp chuỗi không phân biệt chữ hoa/thường, hoặc theo ngôn ngữ cụ thể
          comparison = valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
        } else {
          // Sắp xếp số hoặc các kiểu dữ liệu có thể so sánh trực tiếp
          if (valueA > valueB) {
            comparison = 1;
          } else if (valueA < valueB) {
            comparison = -1;
          }
        }

        // Áp dụng hệ số sắp xếp
        return comparison * sortFactor;
      });

      this.items = [ ...sortItems ];
    },
    updateThumb() {
      const tableBody = this.$refs.tableBody;
      if (!tableBody) return;

      // Tính chiều cao của thumb
      this.thumbHeight = this.computeThumbHeight(this.scrollConfig)

      // Cập nhật vị trí của thumb dựa trên scrollbar
      this.handleScroll();
    },
    handleScroll() {
      const tableBody = this.$refs.tableBody;
      if (!tableBody) return;

      const scrollTop = tableBody.scrollTop;

      // Tính toán vị trí của thumb
      // thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (scrollbarHeight - this.thumbHeight);
      // Đảm bảo thumbTop không vượt quá rãnh
      this.thumbTop = this.computeScrollThumbTop(scrollTop, this.thumbHeight, this.scrollConfig);
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
      this.thumbTop = this.computeDragThumbTop(scrollRange, this.startThumbTop, deltaY);

      // Đồng bộ hóa vị trí cuộn của tableBody với vị trí của thumb
      tableBody.scrollTop = this.computeDragScrollTop(scrollRange, this.thumbTop, this.scrollConfig);
    },
    stopDrag() {
      this.isDragging = false;
    },
    computeDragScrollTop(scrollRange, thumbTop, scrollConfig) {
      const { scrollHeight, clientHeight } = scrollConfig;
      return (thumbTop / scrollRange) * (scrollHeight - clientHeight);
    },
    computeScrollThumbTop(scrollTop, thumbHeight, scrollConfig) {
      const { scrollHeight, clientHeight, scrollbarHeight } = scrollConfig;

      let newThumbTop = (scrollTop / (scrollHeight - clientHeight)) * (scrollbarHeight - thumbHeight);
      newThumbTop = Math.max(0, Math.min(newThumbTop, scrollbarHeight - thumbHeight));

      return newThumbTop;
    },
    computeDragThumbTop(scrollRange, startThumbTop, deltaY) {
      let newThumbTop = startThumbTop + deltaY;
      newThumbTop = Math.min(Math.max(0, newThumbTop), scrollRange); // Giới hạn trong phạm vi

      return newThumbTop;
    },
    computeThumbHeight({ clientHeight, scrollHeight, scrollbarHeight }) {
      let thumbHeight = (clientHeight / scrollHeight) * scrollbarHeight;
      thumbHeight = Math.max(thumbHeight, 20); // Đảm bảo thumb không quá nhỏ

      return thumbHeight;
    },
    getSortIcon(isAsc) {
      return isAsc === 'asc' ? '/public/images/ic_asc_sort.svg' : '/public/images/ic_desc_sort.svg';
    },
    isEmpty(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    },
  },
});

app.mount('#app');

