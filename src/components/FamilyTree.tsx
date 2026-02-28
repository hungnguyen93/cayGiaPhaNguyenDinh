import React from 'react';
import type { FamilyMember } from '../types';

interface FamilyTreeProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  selectedMemberId?: number;
}

interface Couple {
  father?: FamilyMember;
  mothers: FamilyMember[];
  childrenByMother: Map<number, FamilyMember[]>;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ members, onSelectMember, selectedMemberId }) => {
  // ─── Build couple data ────────────────────────────────────────────
  const buildCouples = (): Map<number, Couple> => {
    const couples = new Map<number, Couple>();

    members.forEach(member => {
      if (!member.fatherId) return;

      if (!couples.has(member.fatherId)) {
        const father = members.find(m => m.id === member.fatherId);
        couples.set(member.fatherId, {
          father,
          mothers: [],
          childrenByMother: new Map(),
        });
      }

      const couple = couples.get(member.fatherId)!;

      if (member.motherId) {
        const mother = members.find(m => m.id === member.motherId);
        if (mother && !couple.mothers.find(m => m.id === mother.id)) {
          couple.mothers.push(mother);
        }
        if (!couple.childrenByMother.has(member.motherId)) {
          couple.childrenByMother.set(member.motherId, []);
        }
        couple.childrenByMother.get(member.motherId)!.push(member);
      } else {
        if (!couple.childrenByMother.has(0)) {
          couple.childrenByMother.set(0, []);
        }
        couple.childrenByMother.get(0)!.push(member);
      }
    });

    return couples;
  };

  const allCouples = buildCouples();

  const findCoupleForPerson = (personId: number): Couple | undefined =>
    allCouples.get(personId);

  /** Find all spouses of a person (bidirectional spouseId lookup) */
  const findAllSpouses = (personId: number): FamilyMember[] => {
    const spouseIds = new Set<number>();
    const person = members.find(m => m.id === personId);
    if (person?.spouseId) spouseIds.add(person.spouseId);
    // Also find members whose spouseId points to this person
    members.forEach(m => {
      if (m.spouseId === personId && m.id !== personId) spouseIds.add(m.id);
    });
    return Array.from(spouseIds)
      .map(id => members.find(m => m.id === id))
      .filter((m): m is FamilyMember => !!m);
  };

  /** Merge additional spouses (from spouseId links) into a couple's mothers list */
  const mergeSpousesIntoCouple = (couple: Couple): Couple => {
    if (!couple.father) return couple;
    const allSpouses = findAllSpouses(couple.father.id);
    const existingMotherIds = new Set(couple.mothers.map(m => m.id));
    const extraMothers = allSpouses.filter(s => !existingMotherIds.has(s.id));
    if (extraMothers.length === 0) return couple;
    return {
      ...couple,
      mothers: [...couple.mothers, ...extraMothers],
    };
  };

  /** Find ALL couples where a person is a mother */
  const findAllCouplesWhereMotherIs = (personId: number): Couple[] => {
    const found: Couple[] = [];
    allCouples.forEach(couple => {
      if (couple.mothers.some(m => m.id === personId)) found.push(couple);
    });
    return found;
  };

  const findRootCouples = (): Couple[] => {
    const roots: Couple[] = [];
    const childCoupleIds = new Set<number>();

    allCouples.forEach(parentCouple => {
      parentCouple.childrenByMother.forEach(children => {
        children.forEach(child => {
          const cc = findCoupleForPerson(child.id);
          if (cc?.father) childCoupleIds.add(cc.father.id);
        });
      });
    });

    allCouples.forEach((couple, fatherId) => {
      if (couple.father) {
        const fatherIsRoot = !couple.father.fatherId && !couple.father.motherId;
        const anyMotherHasParents = couple.mothers.some(m => m.fatherId || m.motherId);
        if (!childCoupleIds.has(fatherId) && fatherIsRoot && !anyMotherHasParents) {
          roots.push(couple);
        }
      }
    });

    return roots;
  };

  // ─── Generation calculation (with cycle detection) ────────────────
  const genCache = new Map<number, number>();
  const computing = new Set<number>();

  const getGeneration = (memberId: number): number => {
    if (genCache.has(memberId)) return genCache.get(memberId)!;
    if (computing.has(memberId)) return 1;

    computing.add(memberId);
    const member = members.find(m => m.id === memberId);
    if (!member) { genCache.set(memberId, 1); computing.delete(memberId); return 1; }

    let gen = 1;
    if (member.fatherId) {
      gen = getGeneration(member.fatherId) + 1;
    } else if (member.motherId) {
      gen = getGeneration(member.motherId) + 1;
    } else if (member.spouseId) {
      gen = getGeneration(member.spouseId);
    }

    genCache.set(memberId, gen);
    computing.delete(memberId);
    return gen;
  };

  // Pre-compute generations
  members.forEach(m => getGeneration(m.id));

  const rootCouples = findRootCouples();

  // Find standalone members not part of any couple (as father, mother, or child)
  const membersInCouples = new Set<number>();
  allCouples.forEach((couple) => {
    if (couple.father) membersInCouples.add(couple.father.id);
    couple.mothers.forEach(m => membersInCouples.add(m.id));
    couple.childrenByMother.forEach(kids => kids.forEach(k => membersInCouples.add(k.id)));
  });

  // Also exclude spouses of members already in couples (they render in pseudo-couples)
  members.forEach(m => {
    if (membersInCouples.has(m.id) && m.spouseId) {
      membersInCouples.add(m.spouseId);
    }
    // Also exclude if someone in a couple references this member as spouse
    if (m.spouseId && membersInCouples.has(m.spouseId)) {
      membersInCouples.add(m.id);
    }
  });

  const standaloneMembers = members.filter(m => !membersInCouples.has(m.id));

  if (rootCouples.length === 0 && standaloneMembers.length === 0) {
    return (
      <div className="empty-tree">
        <p>Chưa có dữ liệu gia phả. Vui lòng tải lên file Excel.</p>
      </div>
    );
  }

  // ─── Render helpers ───────────────────────────────────────────────

  /** Extract year from dd/mm/yyyy or yyyy */
  const extractYear = (dateStr: string): string => {
    if (!dateStr) return '';
    const m = dateStr.match(/(\d{4})/);
    return m ? m[1] : dateStr;
  };

  /** Single person card */
  const renderPersonCard = (member: FamilyMember) => {
    const isMale = member.gender === 'Nam' || member.gender === 'male';
    const isSelected = member.id === selectedMemberId;
    const gen = (genCache.get(member.id) || 0) + 14;
    const isDeceased = !!member.deathDate;

    return (
      <div
        className={`ft-person ${isMale ? 'ft-male' : 'ft-female'} ${isSelected ? 'ft-selected' : ''} ${isDeceased ? 'ft-deceased' : ''}`}
        onClick={e => { e.stopPropagation(); onSelectMember(member); }}
      >
        {member.relationshipType && (
          <span className="ft-badge">
            {member.relationshipType === 'daughter-in-law' ? 'Con dâu' : 'Con rể'}
          </span>
        )}
        {(!member.relationshipType && <div className="ft-gen">Đời {gen}</div>)}
        <div className="ft-name">{member.name}</div>
        {(member.birthDate || member.deathDate) && (
          <div className="ft-years">
            {member.birthDate ? extractYear(member.birthDate) : '?'}{member.deathDate ? ` – ${extractYear(member.deathDate)}` : ''}
          </div>
        )}
        {member.note && <div className="ft-note">{member.note}</div>}
      </div>
    );
  };

  /** Couple card: [Father] ♥ [Mother1] ♥ [Mother2] */
  const renderCoupleCard = (couple: Couple) => (
    <div className="ft-couple">
      {couple.father && renderPersonCard(couple.father)}
      {couple.mothers.map(mother => (
        <React.Fragment key={mother.id}>
          <div className="ft-bond">
            <div className="ft-bond-line" />
            <span className="ft-bond-heart">♥</span>
            <div className="ft-bond-line" />
          </div>
          {renderPersonCard(mother)}
        </React.Fragment>
      ))}
    </div>
  );

  /** Parse dd/mm/yyyy to timestamp for comparison */
  const parseDateStr = (s: string): number => {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };

  /** Gather all children of a couple, sorted by birth date */
  const getAllChildren = (couple: Couple): FamilyMember[] => {
    const children: FamilyMember[] = [];
    couple.childrenByMother.forEach(kids => kids.forEach(k => children.push(k)));
    return children.sort((a, b) => parseDateStr(a.birthDate) - parseDateStr(b.birthDate));
  };

  /** Render a single child: may be a full family unit, a couple, or a single node */
  const renderChildNode = (child: FamilyMember): React.ReactNode => {
    // Child is a father in a couple
    const childCouple = findCoupleForPerson(child.id);
    if (childCouple) return renderFamilyUnit(childCouple);

    // Child is a mother in one or more couples (each couple has a different husband/father)
    const childCouplesAsMother = findAllCouplesWhereMotherIs(child.id);
    if (childCouplesAsMother.length > 0) {
      // Gather husband IDs already in couples
      const coupledHusbandIds = new Set(
        childCouplesAsMother.map(c => c.father?.id).filter((id): id is number => !!id),
      );

      // Find extra husbands via spouseId not represented in any couple
      const allHusbands = findAllSpouses(child.id).filter(
        s => (s.gender === 'Nam' || s.gender === 'male') && !coupledHusbandIds.has(s.id),
      );

      // Multiple husbands → render mother in center with husbands on same row
      if (childCouplesAsMother.length === 1 && allHusbands.length === 0) {
        return renderFamilyUnit(childCouplesAsMother[0]);
      }

      // Collect all husbands (from couples + extra) and all children
      const allCoupleChildren: FamilyMember[] = [];
      const allHusbandMembers: FamilyMember[] = [];
      childCouplesAsMother.forEach(couple => {
        if (couple.father) allHusbandMembers.push(couple.father);
        getAllChildren(couple).forEach(c => allCoupleChildren.push(c));
      });
      allHusbands.forEach(h => allHusbandMembers.push(h));

      // Build a horizontal couple card: husband1 ♥ mother ♥ husband2
      const renderMultiHusbandCard = () => (
        <div className="ft-couple">
          {allHusbandMembers.map((husband, idx) => (
            <React.Fragment key={husband.id}>
              {idx > 0 && (
                <div className="ft-bond">
                  <div className="ft-bond-line" />
                  <span className="ft-bond-heart">♥</span>
                  <div className="ft-bond-line" />
                </div>
              )}
              {renderPersonCard(husband)}
              {idx === 0 && (
                <>
                  <div className="ft-bond">
                    <div className="ft-bond-line" />
                    <span className="ft-bond-heart">♥</span>
                    <div className="ft-bond-line" />
                  </div>
                  {renderPersonCard(child)}
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      );

      return (
        <li key={child.id}>
          {renderMultiHusbandCard()}
          {allCoupleChildren.length > 0 && (
            <ul>{allCoupleChildren.map(c => renderChildNode(c))}</ul>
          )}
        </li>
      );
    }

    // Has spouse(s) but no children recorded
    const allSpouses = findAllSpouses(child.id);
    if (allSpouses.length > 0) {
      const isMale = child.gender === 'Nam' || child.gender === 'male';
      if (isMale) {
        const pseudoCouple: Couple = { father: child, mothers: allSpouses, childrenByMother: new Map() };
        return <li key={child.id}>{allSpouses.length >= 2 ? renderFamilyUnit(pseudoCouple) : renderCoupleCard(pseudoCouple)}</li>;
      } else {
        // child is female with husband(s) but no children
        const husbands = allSpouses.filter(s => s.gender === 'Nam' || s.gender === 'male');
        if (husbands.length >= 2) {
          // Multiple husbands, no children → all on same row
          const renderMultiHusbandRow = () => (
            <div className="ft-couple">
              {husbands.map((husband, idx) => (
                <React.Fragment key={husband.id}>
                  {idx > 0 && (
                    <div className="ft-bond">
                      <div className="ft-bond-line" />
                      <span className="ft-bond-heart">♥</span>
                      <div className="ft-bond-line" />
                    </div>
                  )}
                  {renderPersonCard(husband)}
                  {idx === 0 && (
                    <>
                      <div className="ft-bond">
                        <div className="ft-bond-line" />
                        <span className="ft-bond-heart">♥</span>
                        <div className="ft-bond-line" />
                      </div>
                      {renderPersonCard(child)}
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
          return <li key={child.id}>{renderMultiHusbandRow()}</li>;
        }
        if (husbands.length === 1) {
          const pseudoCouple: Couple = { father: husbands[0], mothers: [child], childrenByMother: new Map() };
          return <li key={child.id}>{renderCoupleCard(pseudoCouple)}</li>;
        }
        // No male spouse found, use first spouse as "father"
        const pseudoCouple: Couple = { father: allSpouses[0], mothers: [child], childrenByMother: new Map() };
        return <li key={child.id}>{renderCoupleCard(pseudoCouple)}</li>;
      }
    }

    // Single person
    return <li key={child.id}>{renderPersonCard(child)}</li>;
  };

  /** Get sorted children for a specific mother */
  const getChildrenOfMother = (couple: Couple, motherId: number): FamilyMember[] => {
    const kids = couple.childrenByMother.get(motherId) || [];
    return [...kids].sort((a, b) => parseDateStr(a.birthDate) - parseDateStr(b.birthDate));
  };

  /** Recursive family unit: couple + children */
  const renderFamilyUnit = (couple: Couple): React.ReactNode => {
    // Merge in any spouses linked via spouseId but not yet in mothers
    const mergedCouple = mergeSpousesIntoCouple(couple);
    const key = mergedCouple.father?.id || mergedCouple.mothers[0]?.id || 0;

    // ── All spouses on the same row, children grouped below ──
    const children = getAllChildren(mergedCouple);
    return (
      <li key={key}>
        {renderCoupleCard(mergedCouple)}
        {children.length > 0 && (
          <ul>{children.map(child => renderChildNode(child))}</ul>
        )}
      </li>
    );
  };

  // ─── Main render ──────────────────────────────────────────────────
  return (
    <div className="genealogy-tree">
      <ul>
        {rootCouples.map(couple => renderFamilyUnit(couple))}
        {standaloneMembers.map(member => (
          <li key={member.id}>{renderPersonCard(member)}</li>
        ))}
      </ul>
    </div>
  );
};

export default FamilyTree;
