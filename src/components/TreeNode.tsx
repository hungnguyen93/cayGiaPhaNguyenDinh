import React from 'react';
import type { FamilyMember } from '../types';

interface TreeNodeProps {
  member: FamilyMember;
  onSelect: (member: FamilyMember) => void;
  selectedId?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ member, onSelect, selectedId }) => {
  const isSelected = member.id === selectedId;
  const isMale = member.gender === 'Nam';

  return (
    <div className="tree-node">
      <div
        className={`node-card ${isSelected ? 'selected' : ''} ${isMale ? 'male' : 'female'}`}
        onClick={() => onSelect(member)}
      >
        <div className="node-name">{member.name}</div>
        <div className="node-year">
          Sinh: {member.birthDate}
          {member.deathDate && ` - ${member.deathDate}`}
        </div>
        {member.note && (
          <div className="node-year">{member.note}</div>
        )}
      </div>

      {member.children && member.children.length > 0 && (
        <div className="children-container">
          <div className="vertical-line"></div>
          <div className="children-list">
            {member.children.map((child) => (
              <div key={child.id} className="child-wrapper">
                <div className="horizontal-line"></div>
                <TreeNode member={child} onSelect={onSelect} selectedId={selectedId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeNode;
