export type MenuState = {
  unitName?: string;   // Tên Unit (VD: "UNIT 1")
  unitTitle?: string;  // Tiêu đề Unit (VD: "FAMILY")
  title?: string;      // Tiêu đề đầy đủ để hiển thị trên Header
  unitId?: string | number; // ID để kiểm tra khớp dữ liệu trong LocalStorage
};