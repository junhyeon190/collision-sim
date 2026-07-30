// 1차시 응답을 서버 없이 18자 코드로 압축한다 (spec.md §7).
// 학생은 이 코드를 학습지에 적고, 3차시 시작 시 같은 코드를 입력하면 응답이 복원된다.
// 순수 함수만 둔다. React에 의존하지 않는다.

import type { CardCategory } from '../store/useStore';
import { VARIABLE_CARDS } from '../components/screens/screen3/variableCards';

// I, L, O, U를 뺀 Crockford Base32 (손글씨·구두 전달 시 혼동 방지)
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const CARD_ORDER = VARIABLE_CARDS.map((c) => c.id);

const SCREEN2_CHOICES = ['맨바닥이 큼', '완충재가 큼', '같음', '모르겠음'] as const;
type Screen2Choice = (typeof SCREEN2_CHOICES)[number];

const CHECKSUM_BITS = 6;
const PAYLOAD_BITS = 80;
const TOTAL_BITS = PAYLOAD_BITS + CHECKSUM_BITS; // 86비트 -> 18자(90비트 중 하위 4비트는 0 패딩)

export interface ResultCodePayload {
  studentId: string;
  screen0: { choice: number | null; confidence: number | null };
  screen1: { forcePrediction: number | null; motionPrediction: number | null; reasonChoice: number | null };
  screen2: {
    predictions: { momentum: string | null; impulse: string | null; time: string | null; avgForce: string | null };
    reasonChoice: number | null;
  };
  screen3: {
    placements: Record<string, CardCategory | null>;
    firstAttempt: Record<string, CardCategory | null> | null;
    moveCount: number;
  };
  screen5: { modifiedChoice: number | null; finalConfidence: number | null };
  exitQuestions: { q1: number | null; q2: number | null };
}

export interface DecodedResultCode {
  studentCode: number;
  screen0: { choice: number; confidence: number };
  screen1: { forcePrediction: number; motionPrediction: number; reasonChoice: number };
  screen2: {
    predictions: { momentum: Screen2Choice; impulse: Screen2Choice; time: Screen2Choice; avgForce: Screen2Choice };
    reasonChoice: number;
  };
  screen3: {
    firstAttempt: Record<string, CardCategory | null>;
    final: Record<string, CardCategory | null>;
    moveCount: number;
  };
  screen5: { modifiedChoice: number; finalConfidence: number };
  exitQuestions: { q1: number; q2: number };
}

// ---- 값 <-> n비트 인덱스 변환 (1~max 선택지를 0~(max-1)로) ----
function choiceToIndex(value: number | null, max: number): bigint {
  if (value === null || value < 1 || value > max) return 0n;
  return BigInt(Math.round(value) - 1);
}
function indexToChoice(index: bigint, max: number): number {
  const v = Number(index) + 1;
  return v >= 1 && v <= max ? v : 1;
}

function categoryToCode(cat: CardCategory | null | undefined): bigint {
  if (cat === 'manipulated') return 1n;
  if (cat === 'dependent') return 2n;
  if (cat === 'controlled') return 3n;
  return 0n; // 미분류
}
function codeToCategory(code: bigint): CardCategory | null {
  const n = Number(code);
  if (n === 1) return 'manipulated';
  if (n === 2) return 'dependent';
  if (n === 3) return 'controlled';
  return null;
}

function screen2ChoiceToIndex(v: string | null): bigint {
  const idx = v ? SCREEN2_CHOICES.indexOf(v as Screen2Choice) : -1;
  return idx >= 0 ? BigInt(idx) : 0n;
}
function indexToScreen2Choice(i: bigint): Screen2Choice {
  return SCREEN2_CHOICES[Number(i)] ?? SCREEN2_CHOICES[0];
}

// 학번 원문(예: "10900")에서 6비트(0~63) 안에 들어가는 짧은 확인용 숫자를 뽑아낸다.
// 학번 전체를 복원하는 용도가 아니라, 교사가 별도로 보관한 종이 매칭표와 대조하는 용도다.
function deriveStudentCode(studentId: string): number {
  const digits = studentId.replace(/\D/g, '');
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n % 64 : 0;
}

// ---- 비트 패킹 ----
interface BitField {
  value: bigint;
  bits: number;
}

function packFields(fields: BitField[]): bigint {
  let acc = 0n;
  for (const f of fields) {
    const mask = (1n << BigInt(f.bits)) - 1n;
    acc = (acc << BigInt(f.bits)) | (f.value & mask);
  }
  return acc;
}

function unpackFields(total: bigint, bitsList: number[]): bigint[] {
  const reversedBits = [...bitsList].reverse();
  const reversedValues: bigint[] = [];
  let remaining = total;
  for (const bits of reversedBits) {
    const mask = (1n << BigInt(bits)) - 1n;
    reversedValues.push(remaining & mask);
    remaining >>= BigInt(bits);
  }
  return reversedValues.reverse();
}

// 80비트 페이로드를 5비트씩 16조각으로 끊어 더한 나머지(mod 64)를 체크섬으로 쓴다.
// 암호학적 무결성이 아니라 "손으로 옮겨 적다가 한 글자 틀렸는지" 확인용이다.
function computeChecksum(payload: bigint): bigint {
  let sum = 0n;
  let v = payload;
  const chunks = Math.ceil(PAYLOAD_BITS / 5);
  for (let i = 0; i < chunks; i++) {
    sum += v & 0x1fn;
    v >>= 5n;
  }
  return sum % 64n;
}

// ---- Base32 (Crockford) <-> BigInt ----
function bigIntToBase32(value: bigint, totalBits: number): string {
  const charCount = Math.ceil(totalBits / 5);
  const paddedBits = charCount * 5;
  const shifted = value << BigInt(paddedBits - totalBits); // 남는 하위 비트는 0 패딩
  let out = '';
  for (let i = 0; i < charCount; i++) {
    const shiftAmount = BigInt((charCount - 1 - i) * 5);
    const idx = Number((shifted >> shiftAmount) & 0x1fn);
    out += CROCKFORD_ALPHABET[idx];
  }
  return out;
}

function base32ToBigInt(chars: string, totalBits: number): bigint | null {
  const charCount = Math.ceil(totalBits / 5);
  if (chars.length !== charCount) return null;
  let value = 0n;
  for (const ch of chars) {
    const idx = CROCKFORD_ALPHABET.indexOf(ch);
    if (idx < 0) return null;
    value = (value << 5n) | BigInt(idx);
  }
  const paddedBits = charCount * 5;
  return value >> BigInt(paddedBits - totalBits);
}

// ---- 필드 순서 (인코딩·디코딩 양쪽에서 반드시 같은 순서를 써야 한다) ----
function buildFieldList(payload: ResultCodePayload): BitField[] {
  const fields: BitField[] = [];
  fields.push({ value: BigInt(deriveStudentCode(payload.studentId)), bits: 6 });

  fields.push({ value: choiceToIndex(payload.screen0.choice, 5), bits: 3 });
  fields.push({ value: choiceToIndex(payload.screen0.confidence, 5), bits: 3 });

  fields.push({ value: choiceToIndex(payload.screen1.forcePrediction, 4), bits: 2 });
  fields.push({ value: choiceToIndex(payload.screen1.motionPrediction, 4), bits: 2 });
  fields.push({ value: choiceToIndex(payload.screen1.reasonChoice, 5), bits: 3 });

  fields.push({ value: screen2ChoiceToIndex(payload.screen2.predictions.momentum), bits: 2 });
  fields.push({ value: screen2ChoiceToIndex(payload.screen2.predictions.impulse), bits: 2 });
  fields.push({ value: screen2ChoiceToIndex(payload.screen2.predictions.time), bits: 2 });
  fields.push({ value: screen2ChoiceToIndex(payload.screen2.predictions.avgForce), bits: 2 });
  fields.push({ value: choiceToIndex(payload.screen2.reasonChoice, 5), bits: 3 });

  for (const id of CARD_ORDER) {
    fields.push({ value: categoryToCode(payload.screen3.firstAttempt?.[id]), bits: 2 });
  }
  for (const id of CARD_ORDER) {
    fields.push({ value: categoryToCode(payload.screen3.placements[id]), bits: 2 });
  }
  const moveCount = Math.max(0, Math.min(15, Math.round(payload.screen3.moveCount)));
  fields.push({ value: BigInt(moveCount), bits: 4 });

  fields.push({ value: choiceToIndex(payload.screen5.modifiedChoice, 5), bits: 3 });
  fields.push({ value: choiceToIndex(payload.screen5.finalConfidence, 5), bits: 3 });

  fields.push({ value: choiceToIndex(payload.exitQuestions.q1, 4), bits: 2 });
  fields.push({ value: choiceToIndex(payload.exitQuestions.q2, 4), bits: 2 });

  return fields;
}

const FIELD_BITS_ORDER: number[] = [
  6, // 학번
  3, 3, // 화면0
  2, 2, 3, // 화면1
  2, 2, 2, 2, 3, // 화면2
  ...CARD_ORDER.map(() => 2), // 화면3 첫 시도
  ...CARD_ORDER.map(() => 2), // 화면3 최종
  4, // 화면3 수정 횟수
  3, 3, // 화면5
  2, 2, // 출구 1·2
];

function formatResultCode(raw: string): string {
  const groups = [4, 4, 4, 4, 2];
  let i = 0;
  const parts: string[] = [];
  for (const len of groups) {
    parts.push(raw.slice(i, i + len));
    i += len;
  }
  return parts.join('-');
}

export function encodeResultCode(payload: ResultCodePayload): string {
  const fields = buildFieldList(payload);
  const payloadValue = packFields(fields);
  const checksum = computeChecksum(payloadValue);
  const full = (payloadValue << BigInt(CHECKSUM_BITS)) | checksum;
  const raw = bigIntToBase32(full, TOTAL_BITS);
  return formatResultCode(raw);
}

export function decodeResultCode(input: string): DecodedResultCode | null {
  const raw = input.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const full = base32ToBigInt(raw, TOTAL_BITS);
  if (full === null) return null;

  const checksum = full & ((1n << BigInt(CHECKSUM_BITS)) - 1n);
  const payloadValue = full >> BigInt(CHECKSUM_BITS);
  if (computeChecksum(payloadValue) !== checksum) return null; // 체크섬 불일치 -> "코드를 다시 확인해 주세요"

  const values = unpackFields(payloadValue, FIELD_BITS_ORDER);
  let cursor = 0;
  const next = () => values[cursor++];

  const studentCode = Number(next());
  const screen0 = { choice: indexToChoice(next(), 5), confidence: indexToChoice(next(), 5) };
  const screen1 = {
    forcePrediction: indexToChoice(next(), 4),
    motionPrediction: indexToChoice(next(), 4),
    reasonChoice: indexToChoice(next(), 5),
  };
  const screen2 = {
    predictions: {
      momentum: indexToScreen2Choice(next()),
      impulse: indexToScreen2Choice(next()),
      time: indexToScreen2Choice(next()),
      avgForce: indexToScreen2Choice(next()),
    },
    reasonChoice: indexToChoice(next(), 5),
  };

  const firstAttempt: Record<string, CardCategory | null> = {};
  for (const id of CARD_ORDER) firstAttempt[id] = codeToCategory(next());
  const final: Record<string, CardCategory | null> = {};
  for (const id of CARD_ORDER) final[id] = codeToCategory(next());
  const moveCount = Number(next());

  const screen5 = { modifiedChoice: indexToChoice(next(), 5), finalConfidence: indexToChoice(next(), 5) };
  const exitQuestions = { q1: indexToChoice(next(), 4), q2: indexToChoice(next(), 4) };

  return {
    studentCode,
    screen0,
    screen1,
    screen2,
    screen3: { firstAttempt, final, moveCount },
    screen5,
    exitQuestions,
  };
}
