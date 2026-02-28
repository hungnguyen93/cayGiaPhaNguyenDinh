import React, { useState, useMemo } from 'react';
import type { FamilyMember } from '../types';

export type AddMode = 'child' | 'spouse' | 'root' | 'ancestor';

interface AddMemberModalProps {
  members: FamilyMember[];
  mode: AddMode;
  /** The member we're adding relative to (parent when mode='child', partner when mode='spouse') */
  relativeTo?: FamilyMember | null;
  onSave: (member: FamilyMember) => void;
  onClose: () => void;
}

/** Compute initial form values based on mode and relativeTo */
function computeInitialValues(mode: AddMode, relativeTo?: FamilyMember | null) {
  let gender = 'Nam';
  let fatherId = '';
  let motherId = '';
  let spouseId = '';

  if (!relativeTo) return { gender, fatherId, motherId, spouseId };

  if (mode === 'child') {
    const isMaleParent = relativeTo.gender === 'Nam' || relativeTo.gender === 'male';
    if (isMaleParent) {
      fatherId = String(relativeTo.id);
      if (relativeTo.spouseId) motherId = String(relativeTo.spouseId);
    } else {
      motherId = String(relativeTo.id);
      if (relativeTo.spouseId) fatherId = String(relativeTo.spouseId);
    }
  }

  if (mode === 'spouse') {
    spouseId = String(relativeTo.id);
    const parentIsMale = relativeTo.gender === 'Nam' || relativeTo.gender === 'male';
    gender = parentIsMale ? 'Nữ' : 'Nam';
  }

  if (mode === 'ancestor') {
    // New ancestor will become a parent of relativeTo
    // Default to male (father) if relativeTo has no father yet, otherwise female (mother)
    if (!relativeTo.fatherId) {
      gender = 'Nam';
    } else if (!relativeTo.motherId) {
      gender = 'Nữ';
    } else {
      gender = 'Nam';
    }
  }

  return { gender, fatherId, motherId, spouseId };
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  members,
  mode,
  relativeTo,
  onSave,
  onClose,
}) => {
  const nextId = useMemo(() => {
    const maxId = members.reduce((max, m) => Math.max(max, m.id), 0);
    return maxId + 1;
  }, [members]);

  const initial = useMemo(() => computeInitialValues(mode, relativeTo), [mode, relativeTo]);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<string>(initial.gender);
  const [birthDate, setBirthDate] = useState<string>('');
  const [deathDate, setDeathDate] = useState<string>('');
  const [fatherId, setFatherId] = useState<string>(initial.fatherId);
  const [motherId, setMotherId] = useState<string>(initial.motherId);
  const [spouseId, setSpouseId] = useState<string>(initial.spouseId);
  const [note, setNote] = useState('');

  const males = members.filter(m => m.gender === 'Nam' || m.gender === 'male');
  const females = members.filter(m => m.gender === 'Nữ' || m.gender === 'female');

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

    const newMember: FamilyMember = {
      id: nextId,
      name: name.trim(),
      gender,
      birthDate: birthDate.trim(),
      deathDate: deathDate.trim() || undefined,
      fatherId: fatherId ? Number(fatherId) : undefined,
      motherId: motherId ? Number(motherId) : undefined,
      spouseId: spouseId ? Number(spouseId) : undefined,
      note: note.trim() || undefined,
    };

    // Auto-detect relationship type (in-law)
    if (newMember.spouseId && !newMember.fatherId && !newMember.motherId) {
      newMember.relationshipType =
        newMember.gender === 'Nam' || newMember.gender === 'male'
          ? 'son-in-law'
          : 'daughter-in-law';
    }

    onSave(newMember);
  };

  const modeLabel =
    mode === 'child'
      ? `Thêm con cho ${relativeTo?.name || ''}`
      : mode === 'spouse'
        ? `Thêm vợ/chồng cho ${relativeTo?.name || ''}`
        : mode === 'ancestor'
          ? `Thêm cha/mẹ cho ${relativeTo?.name || ''}`
          : 'Thêm thành viên gốc mới';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
        <h2 className="modal-title">{modeLabel}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ID (read-only) */}
          <div className="form-row">
            <label>ID</label>
            <input type="text" value={nextId} disabled className="form-input disabled" />
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
              disabled={mode === 'child' && !!fatherId}
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
              disabled={mode === 'child' && !!motherId}
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
              disabled={mode === 'spouse'}
            >
              <option value="">— Không chọn —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.gender === 'Nam' || m.gender === 'male' ? '♂' : '♀'}, ID: {m.id})
                </option>
              ))}
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
              ✅ Lưu thành viên
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
