// rf-payload.interface.ts (или можно оставить прямо в сервисе)
export interface RfPayload {
  decimal: string;
  hex: string;
  bit: string;
  proto: string;
}
