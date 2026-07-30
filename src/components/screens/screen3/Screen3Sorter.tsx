import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../../store/useStore';
import type { CardCategory } from '../../../store/useStore';
import { VARIABLE_CARDS, VariableCard } from './variableCards';

// HTML5 Drag and Drop API 금지 (갤럭시탭 미동작) — Pointer Events 커스텀 드래그 + 탭-투-탭 병행 구현.
// spec.md §6 참조.

const BOX_INFO: { key: CardCategory; title: string; hint: string }[] = [
  { key: 'manipulated', title: '조작 변인', hint: '내가 의도적으로 바꾸는 값' },
  { key: 'dependent', title: '종속 변인', hint: '그 결과로 달라지는 값' },
  { key: 'controlled', title: '통제 변인', hint: '같게 유지해야 하는 값' },
];

const DRAG_THRESHOLD = 6; // px. 이보다 적게 움직이면 탭으로 처리한다.

export default function Screen3Sorter() {
  const screen3 = useStore((state) => state.screen3);
  const updateScreen3 = useStore((state) => state.updateScreen3);
  const { placements, firstAttempt, moveCount } = screen3;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ id: string; x: number; y: number } | null>(null);
  const [hoveredBox, setHoveredBox] = useState<CardCategory | null>(null);

  const draggedRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  // 드래그가 막 끝난 직후에는 상자의 탭(onClick) 반응을 잠깐 무시한다.
  // (드롭된 카드가 상자 안으로 다시 그려지면서 브라우저가 뒤늦게 만들어내는 click이
  //  엉뚱한 상자 탭으로 처리되어, 예전에 선택해 둔 다른 카드가 같이 들어가 버리는 문제를 막기 위함)
  const suppressBoxTapRef = useRef(false);

  // 안전망: 카드 자체의 pointerup/pointercancel이 무슨 이유로든 안 걸린 채 드래그가 남아 있으면
  // (예: 캡처가 이상하게 풀려서 이벤트가 엉뚱한 곳으로 갔을 때) window 레벨에서 강제로 정리한다.
  // 배치는 적용하지 않고 "고스트가 커서에 영원히 붙어 있는" 상태만 막는다.
  useEffect(() => {
    if (!dragState) return;
    const forceReset = () => {
      draggedRef.current = false;
      setDragState(null);
      setHoveredBox(null);
    };
    window.addEventListener('pointerup', forceReset);
    window.addEventListener('pointercancel', forceReset);
    window.addEventListener('blur', forceReset);
    return () => {
      window.removeEventListener('pointerup', forceReset);
      window.removeEventListener('pointercancel', forceReset);
      window.removeEventListener('blur', forceReset);
    };
  }, [dragState]);

  const isAllPlaced = (p: Record<string, CardCategory | null>) =>
    VARIABLE_CARDS.every((c) => p[c.id] !== null && p[c.id] !== undefined);

  const applyPlacement = (cardId: string, category: CardCategory | null) => {
    const prevCategory = placements[cardId] ?? null;
    if (prevCategory === category) return;

    const nextPlacements = { ...placements, [cardId]: category };
    // 이미 어딘가(상자 또는 원위치 복귀)에 있던 카드를 다시 옮긴 경우만 '수정'으로 센다.
    const wasAlreadyPlaced = prevCategory !== null;
    const nextMoveCount = wasAlreadyPlaced ? moveCount + 1 : moveCount;

    const nextFirstAttempt =
      !firstAttempt && isAllPlaced(nextPlacements) ? nextPlacements : firstAttempt;

    updateScreen3({
      placements: nextPlacements,
      moveCount: nextMoveCount,
      firstAttempt: nextFirstAttempt,
    });
  };

  // ---- 탭-투-탭 (필수) ----
  const handleCardTap = (card: VariableCard) => {
    const current = placements[card.id] ?? null;
    if (current !== null) {
      // 상자 안의 카드를 다시 탭하면 원래 자리(미분류)로 되돌아온다.
      applyPlacement(card.id, null);
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => (prev === card.id ? null : card.id));
  };

  const handleBoxTap = (category: CardCategory) => {
    if (suppressBoxTapRef.current) return; // 드래그 직후의 잔여 클릭은 무시
    if (!selectedId) return;
    applyPlacement(selectedId, category);
    setSelectedId(null);
  };

  // ---- 포인터 드래그 ----
  const handlePointerDown = (e: React.PointerEvent, cardId: string) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    draggedRef.current = false;
    // 새 카드를 누르는 순간, 예전에 탭으로 선택해 뒀던 다른 카드가 남아 있으면 반드시 지운다.
    // (선택이 남아 있으면 이번 드래그와 무관하게 그 카드가 상자에 같이 들어가는 사고로 이어진다)
    setSelectedId(null);
    setDragState({ id: cardId, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !startPosRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      draggedRef.current = true;
    }
    setDragState({ id: dragState.id, x: e.clientX, y: e.clientY });

    if (draggedRef.current) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const boxEl = el?.closest('[data-box]') as HTMLElement | null;
      setHoveredBox((boxEl?.dataset.box as CardCategory) ?? null);
    }
  };

  const releaseCapture = (e: React.PointerEvent) => {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // 이미 캡처가 풀려 있으면 조용히 무시한다.
    }
  };

  const handlePointerUp = (e: React.PointerEvent, card: VariableCard) => {
    releaseCapture(e);
    if (draggedRef.current) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const boxEl = el?.closest('[data-box]') as HTMLElement | null;
      const poolEl = el?.closest('[data-pool]') as HTMLElement | null;
      if (boxEl) {
        applyPlacement(card.id, boxEl.dataset.box as CardCategory);
      } else if (poolEl) {
        applyPlacement(card.id, null);
      }
      // 드래그 직후 뒤따라오는 click 이벤트가 탭으로 오인되지 않도록 다음 틱에 플래그를 내린다.
      suppressBoxTapRef.current = true;
      setTimeout(() => {
        draggedRef.current = false;
        suppressBoxTapRef.current = false;
      }, 250);
    }
    setDragState(null);
    setHoveredBox(null);
  };

  // 브라우저(특히 트랙패드)는 드래그 도중 pointerup 대신 pointercancel을 보낼 때가 있다.
  // 이걸 처리하지 않으면 드래그 상태가 영원히 안 풀려서 고스트가 커서를 계속 따라다니고,
  // 이후 다른 카드 조작까지 꼬인다. 취소이므로 배치는 적용하지 않고 상태만 원복한다.
  const handlePointerCancel = (e: React.PointerEvent) => {
    releaseCapture(e);
    draggedRef.current = false;
    startPosRef.current = null;
    setDragState(null);
    setHoveredBox(null);
  };

  const handleCardClick = (e: React.MouseEvent, card: VariableCard) => {
    e.stopPropagation();
    if (draggedRef.current) return; // 드래그였다면 탭 로직을 실행하지 않는다.
    handleCardTap(card);
  };

  const cardsInBox = (category: CardCategory) =>
    VARIABLE_CARDS.filter((c) => placements[c.id] === category);
  const unsortedCards = VARIABLE_CARDS.filter((c) => !placements[c.id]);

  const manipulatedCards = cardsInBox('manipulated');
  const confoundedCard =
    manipulatedCards.length > 1 ? manipulatedCards.find((c) => c.id !== 'cushion_count') : null;

  const draggedCard = dragState ? VARIABLE_CARDS.find((c) => c.id === dragState.id) : null;

  return (
    <div className="flex flex-col h-full space-y-3 select-none" onPointerMove={handlePointerMove}>
      {/* 드래그 중인 카드를 따라다니는 고스트 (position: fixed + transform) */}
      {dragState && draggedRef.current && draggedCard && (
        <div
          className="fixed z-50 pointer-events-none px-3 py-2 bg-blue-600 text-white rounded shadow-lg text-sm font-bold"
          style={{ left: dragState.x, top: dragState.y, transform: 'translate(-50%, -50%)' }}
        >
          {draggedCard.label}
        </div>
      )}

      {/* 카드 풀 (미분류) */}
      <div
        data-pool
        className="touch-none flex flex-wrap gap-2 p-3 bg-gray-50 border rounded min-h-[64px]"
      >
        {unsortedCards.length === 0 && (
          <span className="text-xs text-gray-400">모든 카드를 분류했습니다</span>
        )}
        {unsortedCards.map((card) => (
          <button
            key={card.id}
            onPointerDown={(e) => handlePointerDown(e, card.id)}
            onPointerUp={(e) => handlePointerUp(e, card)}
            onPointerCancel={handlePointerCancel}
            onClick={(e) => handleCardClick(e, card)}
            className={`touch-none px-3 py-2 rounded border-2 text-sm font-bold shadow-sm transition-colors min-h-[44px]
              ${
                selectedId === card.id
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
          >
            {card.label}
          </button>
        ))}
      </div>

      {/* 조작·종속·통제 상자 3개 */}
      <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
        {BOX_INFO.map((box) => (
          <div
            key={box.key}
            data-box={box.key}
            onClick={() => handleBoxTap(box.key)}
            className={`touch-none flex flex-col p-2 border-2 rounded overflow-y-auto transition-colors
              ${
                hoveredBox === box.key
                  ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50'
                  : selectedId
                    ? 'border-blue-300 bg-blue-50/40'
                    : 'border-gray-200 bg-white'
              }`}
          >
            <h4 className="text-sm font-bold text-gray-700 mb-1">{box.title}</h4>
            <p className="text-[11px] text-gray-400 mb-2">{box.hint}</p>
            <div className="flex flex-col gap-1">
              {cardsInBox(box.key).map((card) => (
                <button
                  key={card.id}
                  onPointerDown={(e) => handlePointerDown(e, card.id)}
                  onPointerUp={(e) => handlePointerUp(e, card)}
                  onPointerCancel={handlePointerCancel}
                  onClick={(e) => handleCardClick(e, card)}
                  className="touch-none px-2 py-2 bg-blue-100 border border-blue-300 rounded text-sm font-bold text-blue-800 min-h-[44px] text-left"
                >
                  {card.label}
                </button>
              ))}
            </div>
            {box.key === 'manipulated' && confoundedCard && (
              <p className="mt-2 text-xs text-orange-700 font-bold bg-orange-50 border border-orange-200 rounded p-2">
                완충재 개수와 {confoundedCard.label}을(를) 동시에 바꾸면, 결과가 달라진 원인을 어느
                쪽 때문이라고 판단할 수 있을까요?
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
