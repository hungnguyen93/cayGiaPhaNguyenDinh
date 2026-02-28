const XLSX = require('xlsx');

const data = [
  {
    'ID': 1,
    'Họ tên': 'Nguyễn Văn A',
    'Giới tính': 'Nam',
    'Năm sinh': 1920,
    'Năm mất': 1990,
    'IDCha': '',
    'IDMẹ': '',
    'Ghi chú': 'Ông cố'
  },
  {
    'ID': 2,
    'Họ tên': 'Trần Thị B',
    'Giới tính': 'Nữ',
    'Năm sinh': 1925,
    'Năm mất': 1995,
    'IDCha': '',
    'IDMẹ': '',
    'Ghi chú': 'Bà cố'
  },
  {
    'ID': 3,
    'Họ tên': 'Nguyễn Văn C',
    'Giới tính': 'Nam',
    'Năm sinh': 1945,
    'Năm mất': 2010,
    'IDCha': 1,
    'IDMẹ': 2,
    'Ghi chú': 'Con trai cả'
  },
  {
    'ID': 4,
    'Họ tên': 'Lê Thị D',
    'Giới tính': 'Nữ',
    'Năm sinh': 1950,
    'Năm mất': '',
    'IDCha': '',
    'IDMẹ': '',
    'Ghi chú': 'Vợ của C'
  },
  {
    'ID': 5,
    'Họ tên': 'Nguyễn Văn E',
    'Giới tính': 'Nam',
    'Năm sinh': 1970,
    'Năm mất': '',
    'IDCha': 3,
    'IDMẹ': 4,
    'Ghi chú': 'Cháu nội'
  },
  {
    'ID': 6,
    'Họ tên': 'Nguyễn Thị F',
    'Giới tính': 'Nữ',
    'Năm sinh': 1975,
    'Năm mất': '',
    'IDCha': 3,
    'IDMẹ': 4,
    'Ghi chú': 'Cháu nội'
  },
  {
    'ID': 7,
    'Họ tên': 'Nguyễn Văn G',
    'Giới tính': 'Nam',
    'Năm sinh': 1948,
    'Năm mất': '',
    'IDCha': 1,
    'IDMẹ': 2,
    'Ghi chú': 'Con trai thứ hai'
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Gia Phả');
XLSX.writeFile(wb, 'giapha-mau.xlsx');
console.log('File Excel đã được tạo thành công!');
