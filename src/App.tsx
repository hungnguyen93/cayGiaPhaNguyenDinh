import { useState } from 'react';
import * as XLSX from 'xlsx';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './App.css';
import type { FamilyMember } from './types';
import FamilyTree from './components/FamilyTree';
import MemberDetail from './components/MemberDetail';
import AddMemberModal from './components/AddMemberModal';
import type { AddMode } from './components/AddMemberModal';
import EditMemberModal from './components/EditMemberModal';

/** Convert various date-like values from Excel into dd/mm/yyyy string */
function parseExcelDate(value: unknown): string {
  if (!value && value !== 0) return '';
  const s = String(value).trim();
  // Already dd/mm/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
  // yyyy-mm-dd (ISO)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  const n = Number(s);
  if (!isNaN(n)) {
    // Plain year (e.g. 1920)
    if (n >= 1000 && n <= 2999) return `01/01/${n}`;
    // Excel serial date (e.g. 44927)
    if (n > 2999) {
      const epoch = new Date(1899, 11, 30);
      const d = new Date(epoch.getTime() + n * 86400000);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
  }
  return s; // fallback
}

function App() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('root');
  const [addRelativeTo, setAddRelativeTo] = useState<FamilyMember | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMember, setEditMember] = useState<FamilyMember | null>(null);

  // Hamburger menu state
  const [menuOpen, setMenuOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const familyMembers: FamilyMember[] = jsonData.map((row: any) => {
          const rawBirth = row['Ngày sinh'] || row['Năm sinh'] || row['birthDate'] || row['birthYear'] || '';
          const rawDeath = row['Ngày mất'] || row['Năm mất'] || row['deathDate'] || row['deathYear'] || '';
          const member: FamilyMember = {
            id: Number(row['ID']),
            name: row['Họ tên'] || row['name'] || '',
            gender: row['Giới tính'] || row['gender'] || '',
            birthDate: parseExcelDate(rawBirth),
            deathDate: rawDeath ? parseExcelDate(rawDeath) : undefined,
            fatherId: row['IDCha'] || row['fatherId'] ? Number(row['IDCha'] || row['fatherId']) : undefined,
            motherId: row['IDMẹ'] || row['motherId'] ? Number(row['IDMẹ'] || row['motherId']) : undefined,
            spouseId: row['ID vợ/chồng'] || row['spouseId'] ? Number(row['ID vợ/chồng'] || row['spouseId']) : undefined,
            note: row['Ghi chú'] || row['note'] || '',
          };

          // Read relationshipType from Excel if present
          const rawRel = row['Quan hệ'] || row['relationshipType'] || '';
          if (rawRel === 'Con dâu' || rawRel === 'daughter-in-law') {
            member.relationshipType = 'daughter-in-law';
          } else if (rawRel === 'Con rể' || rawRel === 'son-in-law') {
            member.relationshipType = 'son-in-law';
          } else if (member.spouseId && !member.fatherId && !member.motherId) {
            // Auto-detect in-laws as fallback
            member.relationshipType = member.gender === 'Nam' || member.gender === 'male'
              ? 'son-in-law'
              : 'daughter-in-law';
          }

          return member;
        });

        setMembers(familyMembers);
        setSelectedMember(null);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // ─── Add member ────────────────────────────────────────────────────
  const openAddModal = (mode: AddMode, relative?: FamilyMember | null) => {
    setAddMode(mode);
    setAddRelativeTo(relative || null);
    setShowAddModal(true);
  };

  const handleSaveMember = (newMember: FamilyMember) => {
    let updatedMembers = [...members, newMember];

    // If adding a spouse, also update the other person's spouseId
    if (newMember.spouseId) {
      updatedMembers = updatedMembers.map(m =>
        m.id === newMember.spouseId && !m.spouseId
          ? { ...m, spouseId: newMember.id }
          : m,
      );
    }

    // If adding an ancestor, update the child's fatherId or motherId
    if (addMode === 'ancestor' && addRelativeTo) {
      const isMale = newMember.gender === 'Nam' || newMember.gender === 'male';
      updatedMembers = updatedMembers.map(m => {
        if (m.id === addRelativeTo.id) {
          if (isMale && !m.fatherId) {
            return { ...m, fatherId: newMember.id };
          } else if (!isMale && !m.motherId) {
            return { ...m, motherId: newMember.id };
          }
        }
        return m;
      });
    }

    setMembers(updatedMembers);
    setShowAddModal(false);
    setSelectedMember(null);
  };

  // ─── Delete member ────────────────────────────────────────────────
  const handleDeleteMember = (member: FamilyMember) => {
    const hasChildren = members.some(m => m.fatherId === member.id || m.motherId === member.id);

    const confirmMsg = hasChildren
      ? `"${member.name}" còn có con trong gia phả. Nếu xóa, liên kết cha/mẹ của các con sẽ bị gỡ bỏ. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa "${member.name}" khỏi gia phả?`;

    if (!confirm(confirmMsg)) return;

    let updatedMembers = members.filter(m => m.id !== member.id);

    // Clear spouseId references
    updatedMembers = updatedMembers.map(m =>
      m.spouseId === member.id ? { ...m, spouseId: undefined } : m,
    );

    // Clear fatherId / motherId references
    updatedMembers = updatedMembers.map(m => {
      let updated = m;
      if (m.fatherId === member.id) updated = { ...updated, fatherId: undefined };
      if (m.motherId === member.id) updated = { ...updated, motherId: undefined };
      return updated;
    });

    setMembers(updatedMembers);
    setSelectedMember(null);
  };

  // ─── Edit member ─────────────────────────────────────────────────
  const openEditModal = (member: FamilyMember) => {
    setEditMember(member);
    setShowEditModal(true);
  };

  const handleEditSave = (updated: FamilyMember) => {
    let updatedMembers = members.map(m => (m.id === updated.id ? updated : m));

    // Handle spouse changes
    const oldMember = members.find(m => m.id === updated.id);
    const oldSpouseId = oldMember?.spouseId;
    const newSpouseId = updated.spouseId;

    // Remove old spouse link if spouse changed
    if (oldSpouseId && oldSpouseId !== newSpouseId) {
      updatedMembers = updatedMembers.map(m =>
        m.id === oldSpouseId && m.spouseId === updated.id
          ? { ...m, spouseId: undefined }
          : m,
      );
    }

    // Set new spouse link (bidirectional)
    if (newSpouseId && newSpouseId !== oldSpouseId) {
      updatedMembers = updatedMembers.map(m =>
        m.id === newSpouseId ? { ...m, spouseId: updated.id } : m,
      );
    }

    setMembers(updatedMembers);
    setShowEditModal(false);
    // Update selectedMember to reflect the changes
    setSelectedMember(updated);
  };

  // ─── Export to Excel ──────────────────────────────────────────────
  const handleExport = () => {
    if (members.length === 0) {
      alert('Chưa có dữ liệu để xuất.');
      return;
    }

    const relLabel = (r?: string) =>
      r === 'daughter-in-law' ? 'Con dâu' : r === 'son-in-law' ? 'Con rể' : '';

    const data = members.map(m => ({
      'ID': m.id,
      'Họ tên': m.name,
      'Giới tính': m.gender,
      'Ngày sinh': m.birthDate,
      'Ngày mất': m.deathDate || '',
      'IDCha': m.fatherId || '',
      'IDMẹ': m.motherId || '',
      'ID vợ/chồng': m.spouseId || '',
      'Quan hệ': relLabel(m.relationshipType),
      'Ghi chú': m.note || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 10 }, { wch: 12 },
      { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Gia phả');
    XLSX.writeFile(wb, 'giapha-export.xlsx');
  };

  return (
    <div className="app">
      {/* Hamburger menu */}
      <div className="hamburger-wrapper">
        <button
          className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className={`hamburger-menu ${menuOpen ? 'open' : ''}`}>
          <label htmlFor="file-upload" className="menu-item" onClick={() => setMenuOpen(false)}>
            📁 Tải file Excel
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => { handleFileUpload(e); setMenuOpen(false); }}
            style={{ display: 'none' }}
          />
          <a
            href="/giapha-mau.xlsx"
            download="giapha-mau.xlsx"
            className="menu-item"
            onClick={() => setMenuOpen(false)}
          >
            ⬇️ Tải file mẫu
          </a>
          {members.length > 0 && (
            <>
              <button className="menu-item" onClick={() => { openAddModal('root'); setMenuOpen(false); }}>
                ➕ Thêm người
              </button>
              <button className="menu-item" onClick={() => { handleExport(); setMenuOpen(false); }}>
                💾 Xuất Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Overlay to close menu */}
      {menuOpen && <div className="hamburger-overlay" onClick={() => setMenuOpen(false)} />}

      <div className="main-content">
        <div className="tree-container">
          {members.length === 0 ? (
            <div className="empty-tree">
              <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>👋 Chào mừng đến với Cây Gia Phả</p>
              <p>Chưa có dữ liệu gia phả. Vui lòng tải lên file Excel hoặc thêm thành viên đầu tiên.</p>
              <button
                className="header-btn btn-add-root"
                style={{ marginTop: '15px', fontSize: '1em' }}
                onClick={() => openAddModal('root')}
              >
                ➕ Thêm thành viên đầu tiên
              </button>
            </div>
          ) : (
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={3}
              centerOnInit={false}
              limitToBounds={false}
              disablePadding={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false }}
              panning={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform, setTransform }) => {
                const handleReset = () => {
                  resetTransform();
                  // Scroll to the first root node after reset
                  setTimeout(() => {
                    const firstNode = document.querySelector('.genealogy-tree .ft-person');
                    if (firstNode) {
                      firstNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                      setTransform(0, 0, 1);
                    }
                  }, 100);
                };
                return (
                <>
                  <div className="zoom-controls">
                    <button onClick={() => zoomIn()} className="zoom-button">➕</button>
                    <button onClick={() => zoomOut()} className="zoom-button">➖</button>
                    <button onClick={handleReset} className="zoom-button">🔄</button>
                  </div>
                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%' }}
                    contentStyle={{ width: '100%', height: '100%' }}
                  >
                    <FamilyTree
                      members={members}
                      onSelectMember={setSelectedMember}
                      selectedMemberId={selectedMember?.id}
                    />
                  </TransformComponent>
                </>
                );
              }}
            </TransformWrapper>
          )}
        </div>
        {selectedMember && (
          <div className="detail-container">
            <MemberDetail
              member={selectedMember}
              allMembers={members}
              onClose={() => setSelectedMember(null)}
              onAddChild={(parent) => openAddModal('child', parent)}
              onAddSpouse={(member) => openAddModal('spouse', member)}
              onAddAncestor={(member) => openAddModal('ancestor', member)}
              onEditMember={openEditModal}
              onDeleteMember={handleDeleteMember}
            />
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showAddModal && (
        <AddMemberModal
          members={members}
          mode={addMode}
          relativeTo={addRelativeTo}
          onSave={handleSaveMember}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit member modal */}
      {showEditModal && editMember && (
        <EditMemberModal
          member={editMember}
          members={members}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

export default App;
