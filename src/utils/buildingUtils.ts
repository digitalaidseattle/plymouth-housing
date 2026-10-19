/**
 *  buildingUtils.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { VOUCHER_BUILDING_CODES } from '../types/constants';

export const isVoucherBuilding = (buildingCode: string | null | undefined): boolean =>
  !!buildingCode && (VOUCHER_BUILDING_CODES as readonly string[]).includes(buildingCode);
