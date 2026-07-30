// 교사 설정을 6자리 코드로 압축한다 (spec.md §7 "수업 설정 코드").
// 교사 기기의 localStorage에만 저장되고 학생 기기에는 전파되지 않으므로,
// 교사가 칠판에 이 코드를 적어 주면 학생이 직접 입력해 동기화한다.
// 순수 함수만 둔다. React에 의존하지 않는다.

const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// null = 전체 개방(제한 없음). 그 외 값은 "이 화면까지만 진행 가능"을 뜻한다.
const SCREEN_VALUES: (number | null)[] = [0, 1, 2, 3, 5, null];

export interface ClassSettings {
  openScreenLimit: number | null;
  feedbackUnlocked: boolean;
  showNumbers: boolean;
}

export const DEFAULT_CLASS_SETTINGS: ClassSettings = {
  openScreenLimit: null,
  feedbackUnlocked: false,
  showNumbers: false,
};

const PAYLOAD_BITS = 5; // 화면 3비트 + 피드백 1비트 + 수치표시 1비트
const CHECKSUM_BITS = 25;
const TOTAL_BITS = PAYLOAD_BITS + CHECKSUM_BITS; // 30비트 = Base32 정확히 6자

function packPayload(settings: ClassSettings): bigint {
  const idx = SCREEN_VALUES.indexOf(settings.openScreenLimit);
  const screenBits = BigInt(idx >= 0 ? idx : SCREEN_VALUES.length - 1);
  let payload = screenBits & 0x7n; // 3비트
  payload = (payload << 1n) | (settings.feedbackUnlocked ? 1n : 0n);
  payload = (payload << 1n) | (settings.showNumbers ? 1n : 0n);
  return payload;
}

function unpackPayload(payload: bigint): ClassSettings {
  const showNumbers = (payload & 0x1n) === 1n;
  const feedbackUnlocked = ((payload >> 1n) & 0x1n) === 1n;
  const screenIdx = Number((payload >> 2n) & 0x7n);
  return {
    openScreenLimit: SCREEN_VALUES[screenIdx] ?? null,
    feedbackUnlocked,
    showNumbers,
  };
}

// 5비트 페이로드를 25비트로 넓게 섞어 6자리 전체가 그럴듯하게 채워지도록 한다.
// 강한 암호화가 아니라 "한 글자 옮겨 적다가 틀렸는지" 확인용 해시다.
function computeChecksum(payload: bigint): bigint {
  const mixed = (payload * 2654435761n + 12345n) & ((1n << BigInt(CHECKSUM_BITS)) - 1n);
  return mixed;
}

function bigIntToBase32(value: bigint, totalBits: number): string {
  const charCount = Math.ceil(totalBits / 5);
  const paddedBits = charCount * 5;
  const shifted = value << BigInt(paddedBits - totalBits);
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

export function encodeClassSettings(settings: ClassSettings): string {
  const payload = packPayload(settings);
  const checksum = computeChecksum(payload);
  const full = (payload << BigInt(CHECKSUM_BITS)) | checksum;
  return bigIntToBase32(full, TOTAL_BITS);
}

export function decodeClassSettings(input: string): ClassSettings | null {
  const raw = input.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const full = base32ToBigInt(raw, TOTAL_BITS);
  if (full === null) return null;
  const checksum = full & ((1n << BigInt(CHECKSUM_BITS)) - 1n);
  const payload = full >> BigInt(CHECKSUM_BITS);
  if (computeChecksum(payload) !== checksum) return null;
  return unpackPayload(payload);
}
