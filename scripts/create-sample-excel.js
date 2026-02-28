import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dữ liệu mẫu cho gia phả
const sampleData = [
  {
    'ID': 1,
    'Họ tên': 'Nguyễn Văn A',
    'Giới tính': 'Nam',
    'Ngày sinh': '15/03/1920',
    'Ngày mất': '20/11/1995',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': '',
    'Ghi chú': 'Tổ tiên đời đầu'
  },
  {
    'ID': 2,
    'Họ tên': 'Trần Thị B',
    'Giới tính': 'Nữ',
    'Ngày sinh': '08/07/1925',
    'Ngày mất': '05/02/2000',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': 1,
    'Ghi chú': 'Vợ cả của Nguyễn Văn A'
  },
  {
    'ID': 9,
    'Họ tên': 'Phạm Thị X',
    'Giới tính': 'Nữ',
    'Ngày sinh': '22/09/1930',
    'Ngày mất': '',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': 1,
    'Ghi chú': 'Vợ hai của Nguyễn Văn A'
  },
  {
    'ID': 3,
    'Họ tên': 'Nguyễn Văn C',
    'Giới tính': 'Nam',
    'Ngày sinh': '10/05/1950',
    'Ngày mất': '',
    'IDCha': 1,
    'IDMẹ': 2,
    'ID vợ/chồng': 5,
    'Ghi chú': 'Con trai cả (vợ cả)'
  },
  {
    'ID': 4,
    'Họ tên': 'Nguyễn Thị D',
    'Giới tính': 'Nữ',
    'Ngày sinh': '03/12/1955',
    'Ngày mất': '',
    'IDCha': 1,
    'IDMẹ': 2,
    'ID vợ/chồng': 12,
    'Ghi chú': 'Con gái (vợ cả) - lấy chồng nhưng chưa có con'
  },
  {
    'ID': 10,
    'Họ tên': 'Nguyễn Văn Y',
    'Giới tính': 'Nam',
    'Ngày sinh': '14/08/1958',
    'Ngày mất': '',
    'IDCha': 1,
    'IDMẹ': 9,
    'ID vợ/chồng': 13,
    'Ghi chú': 'Con trai (vợ hai) - đã lấy vợ nhưng chưa có con'
  },
  {
    'ID': 11,
    'Họ tên': 'Nguyễn Thị Z',
    'Giới tính': 'Nữ',
    'Ngày sinh': '27/01/1960',
    'Ngày mất': '',
    'IDCha': 1,
    'IDMẹ': 9,
    'ID vợ/chồng': '',
    'Ghi chú': 'Con gái (vợ hai) - chưa lấy chồng'
  },
  {
    'ID': 5,
    'Họ tên': 'Lê Thị E',
    'Giới tính': 'Nữ',
    'Ngày sinh': '19/04/1952',
    'Ngày mất': '',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': 3,
    'Ghi chú': 'Con dâu - Vợ của Nguyễn Văn C'
  },
  {
    'ID': 6,
    'Họ tên': 'Nguyễn Văn F',
    'Giới tính': 'Nam',
    'Ngày sinh': '06/06/1975',
    'Ngày mất': '',
    'IDCha': 3,
    'IDMẹ': 5,
    'ID vợ/chồng': '',
    'Ghi chú': 'Cháu nội'
  },
  {
    'ID': 7,
    'Họ tên': 'Nguyễn Thị G',
    'Giới tính': 'Nữ',
    'Ngày sinh': '30/10/1978',
    'Ngày mất': '',
    'IDCha': 3,
    'IDMẹ': 5,
    'ID vợ/chồng': '',
    'Ghi chú': 'Cháu nội'
  },
  {
    'ID': 8,
    'Họ tên': 'Nguyễn Văn H',
    'Giới tính': 'Nam',
    'Ngày sinh': '12/02/2000',
    'Ngày mất': '',
    'IDCha': 6,
    'IDMẹ': '',
    'ID vợ/chồng': '',
    'Ghi chú': 'Chắt nội'
  },
  {
    'ID': 12,
    'Họ tên': 'Lê Văn K',
    'Giới tính': 'Nam',
    'Ngày sinh': '25/06/1953',
    'Ngày mất': '',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': 4,
    'Ghi chú': 'Con rể - Chồng của Nguyễn Thị D (chưa có con)'
  },
  {
    'ID': 13,
    'Họ tên': 'Võ Thị M',
    'Giới tính': 'Nữ',
    'Ngày sinh': '11/11/1960',
    'Ngày mất': '',
    'IDCha': '',
    'IDMẹ': '',
    'ID vợ/chồng': 10,
    'Ghi chú': 'Con dâu - Vợ của Nguyễn Văn Y (chưa có con)'
  }
];

// Tạo workbook và worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Điều chỉnh độ rộng cột
ws['!cols'] = [
  { wch: 5 },   // ID
  { wch: 20 },  // Họ tên
  { wch: 10 },  // Giới tính
  { wch: 12 },  // Ngày sinh
  { wch: 12 },  // Ngày mất
  { wch: 8 },   // IDCha
  { wch: 8 },   // IDMẹ
  { wch: 12 },  // ID vợ/chồng
  { wch: 40 }   // Ghi chú
];

// Thêm worksheet vào workbook
XLSX.utils.book_append_sheet(wb, ws, 'Gia phả');

// Lưu file
const outputPath = join(__dirname, '..', 'public', 'giapha-mau.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('✅ Đã tạo file giapha-mau.xlsx thành công tại:', outputPath);
