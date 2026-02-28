import React from 'react';
import type { FamilyMember } from '../types';

/** Extract year from dd/mm/yyyy or yyyy */
const extractYear = (dateStr: string): string => {
  if (!dateStr) return '';
  const m = dateStr.match(/(\d{4})/);
  return m ? m[1] : dateStr;
};

interface MemberDetailProps {
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onClose?: () => void;
  onAddChild?: (parent: FamilyMember) => void;
  onAddSpouse?: (member: FamilyMember) => void;
  onAddAncestor?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (member: FamilyMember) => void;
}

const MemberDetail: React.FC<MemberDetailProps> = ({
  member,
  allMembers,
  onClose,
  onAddChild,
  onAddSpouse,
  onAddAncestor,
  onEditMember,
  onDeleteMember,
}) => {
  if (!member) return null;

  const isMale = member.gender === 'Nam' || member.gender === 'male';

  // Find related people
  const father = member.fatherId ? allMembers.find(m => m.id === member.fatherId) : null;
  const mother = member.motherId ? allMembers.find(m => m.id === member.motherId) : null;
  const spouse = member.spouseId ? allMembers.find(m => m.id === member.spouseId) : null;
  const children = allMembers.filter(
    m => m.fatherId === member.id || m.motherId === member.id,
  );

  return (
    <div className="member-detail">
      <button className="close-button" onClick={onClose} aria-label="Đóng">✕</button>

      {/* Header banner */}
      <div className={`detail-banner ${isMale ? 'male' : 'female'}`}>
        <span className="detail-icon">{isMale ? '👨' : '👩'}</span>
        <h2 className="detail-name">{member.name}</h2>
        {member.relationshipType && (
          <span className="detail-rel-badge">
            {member.relationshipType === 'daughter-in-law' ? 'Con dâu' : 'Con rể'}
          </span>
        )}
      </div>

      {/* Info section */}
      <div className="detail-section">
        <h3 className="detail-section-title">📋 Thông tin cá nhân</h3>
        <div className="detail-row">
          <strong>ID:</strong> {member.id}
        </div>
        <div className="detail-row">
          <strong>Giới tính:</strong> {member.gender}
        </div>
        {member.birthDate && (
            <div className="detail-row">
            <strong>Năm sinh:</strong> {member.birthDate.match(/^\d{2}\/\d{2}\/\d{4}$/) ? member.birthDate : extractYear(member.birthDate)}
            </div>
        )}
        {member.deathDate && (
          <div className="detail-row">
            <strong>Năm mất:</strong> {member.deathDate.match(/^\d{2}\/\d{2}\/\d{4}$/) ? member.deathDate : extractYear(member.deathDate || '')}
          </div>
        )}
        {member.note && (
          <div className="detail-row">
            <strong>Ghi chú:</strong> {member.note}
          </div>
        )}
      </div>

      {/* Relationships section */}
      <div className="detail-section">
        <h3 className="detail-section-title">👪 Quan hệ gia đình</h3>
        {father && (
          <div className="detail-row">
            <strong>Cha:</strong> {father.name}
          </div>
        )}
        {mother && (
          <div className="detail-row">
            <strong>Mẹ:</strong> {mother.name}
          </div>
        )}
        {spouse && (
          <div className="detail-row">
            <strong>{isMale ? 'Vợ:' : 'Chồng:'}</strong> {spouse.name}
          </div>
        )}
        {children.length > 0 && (
          <div className="detail-row">
            <strong>Con ({children.length}):</strong>
            <ul className="detail-children-list">
              {children.map(c => (
                <li key={c.id}>
                  {c.gender === 'Nam' || c.gender === 'male' ? '👦' : '👧'} {c.name}{c.birthDate ? ` (${extractYear(c.birthDate)})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {!father && !mother && !spouse && children.length === 0 && (
          <div className="detail-row" style={{ opacity: 0.5 }}>Chưa có thông tin quan hệ</div>
        )}
      </div>

      {/* Action buttons */}
      <div className="detail-section">
        <h3 className="detail-section-title">⚡ Thao tác</h3>
        <div className="detail-actions">
          <button className="btn btn-action btn-edit" onClick={() => onEditMember?.(member)}>
            ✏️ Chỉnh sửa
          </button>
          <button className="btn btn-action btn-add-child" onClick={() => onAddChild?.(member)}>
            👶 Thêm con
          </button>
          <button className="btn btn-action btn-add-spouse" onClick={() => onAddSpouse?.(member)}>
            💍 Thêm vợ/chồng
          </button>
          {(!father || !mother) && (
            <button className="btn btn-action btn-add-ancestor" onClick={() => onAddAncestor?.(member)}>
              👴 Thêm cha/mẹ
            </button>
          )}
          <button className="btn btn-action btn-delete" onClick={() => onDeleteMember?.(member)}>
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
