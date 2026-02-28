import React, { useState } from 'react';
import type { FamilyMember } from '../types';

interface EditMemberModalProps {
  member: FamilyMember;
  members: FamilyMember[];
  onSave: (updated: FamilyMember) => void;
  onClose: () => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  member,
  members,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(member.name);
  const [gender, setGender] = useState(member.gender);
  const [birthDate, setBirthDate] = useState(member.birthDate);
  const [deathDate, setDeathDate] = useState(member.deathDate || '');
  const [fatherId, setFatherId] = useState(member.fatherId ? String(member.fatherId) : '');
  const [motherId, setMotherId] = useState(member.motherId ? String(member.motherId) : '');
  const [spouseId, setSpouseId] = useState(member.spouseId ? String(member.spouseId) : '');
  const [note, setNote] = useState(member.note || '');
  const [relationshipType, setRelationshipType] = useState<string>(member.relationshipType || '');

  // Filter out the member itself from selection lists
  const otherMembers = members.filter(m => m.id !== member.id);
  const males = otherMembers.filter(m => m.gender === 'Nam' || m.gender === 'male');
  const females = otherMembers.filter(m => m.gender === 'Nữ' || m.gender === 'female');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập họ tên.');
      return;
    }
    const dateRegex = /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{4})$/;
    if (birthDate && !dateRegex.test(birthDate.trim())) {
      alert('Ngày sinh không hợp lệ (dd/mm/yyyy hoặc yyyy).');
      return;
    }
    if (deathDate && !dateRegex.test(deathDate.trim())) {
      alert('Ngày mất không hợp lệ (dd/mm/yyyy hoặc yyyy).');
      return;
    }

    const updated: FamilyMember = {
      ...member,
      name: name.trim(),
      gender,
      birthDate: birthDate.trim(),
      deathDate: deathDate.trim() || undefined,
      fatherId: fatherId ? Number(fatherId) : undefined,
      motherId: motherId ? Number(motherId) : undefined,
      spouseId: spouseId ? Number(spouseId) : undefined,
      note: note.trim() || undefined,
      relationshipType: relationshipType
        ? (relationshipType as 'son-in-law' | 'daughter-in-law')
        : undefined,
    };

    onSave(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        <h2 className="modal-title">✏️ Chỉnh sửa: {member.name}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ID (read-only) */}
          <div className="form-row">
            <label>ID</label>
            <input type="text" value={member.id} disabled className="form-input disabled" />
          </div>

          {/* Họ tên */}
          <div className="form-row">
            <label>Họ tên <span className="required">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-input"
              placeholder="Nguyễn Văn ..."
              autoFocus
            />
          </div>

          {/* Giới tính */}
          <div className="form-row">
            <label>Giới tính <span className="required">*</span></label>
            <div className="radio-group">
              <label className={`radio-label ${gender === 'Nam' ? 'active male' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={gender === 'Nam'}
                  onChange={() => setGender('Nam')}
                />
                👨 Nam
              </label>
              <label className={`radio-label ${gender === 'Nữ' ? 'active female' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={gender === 'Nữ'}
                  onChange={() => setGender('Nữ')}
                />
                👩 Nữ
              </label>
            </div>
          </div>

          {/* Ngày sinh / Ngày mất */}
          <div className="form-row-double">
            <div className="form-row">
              <label>Ngày sinh</label>
              <input
                type="text"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="form-input"
                placeholder="dd/mm/yyyy hoặc yyyy"
              />
            </div>
            <div className="form-row">
              <label>Ngày mất</label>
              <input
                type="text"
                value={deathDate}
                onChange={e => setDeathDate(e.target.value)}
                className="form-input"
                placeholder="Để trống nếu còn sống"
              />
            </div>
          </div>

          {/* Cha */}
          <div className="form-row">
            <label>Cha (IDCha)</label>
            <select
              value={fatherId}
              onChange={e => setFatherId(e.target.value)}
              className="form-input"
            >
              <option value="">— Không chọn —</option>
              {males.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (ID: {m.id})
                </option>
              ))}
            </select>
          </div>

          {/* Mẹ */}
          <div className="form-row">
            <label>Mẹ (IDMẹ)</label>
            <select
              value={motherId}
              onChange={e => setMotherId(e.target.value)}
              className="form-input"
            >
              <option value="">— Không chọn —</option>
              {females.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (ID: {m.id})
                </option>
              ))}
            </select>
          </div>

          {/* Vợ/chồng */}
          <div className="form-row">
            <label>Vợ/Chồng</label>
            <select
              value={spouseId}
              onChange={e => setSpouseId(e.target.value)}
              className="form-input"
            >
              <option value="">— Không chọn —</option>
              {otherMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.gender === 'Nam' || m.gender === 'male' ? '♂' : '♀'}, ID: {m.id})
                </option>
              ))}
            </select>
          </div>

          {/* Quan hệ */}
          <div className="form-row">
            <label>Quan hệ (dâu/rể)</label>
            <select
              value={relationshipType}
              onChange={e => setRelationshipType(e.target.value)}
              className="form-input"
            >
              <option value="">— Không có —</option>
              <option value="daughter-in-law">Con dâu</option>
              <option value="son-in-law">Con rể</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div className="form-row">
            <label>Ghi chú</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="form-input form-textarea"
              placeholder="Thông tin bổ sung..."
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-save">
              💾 Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
