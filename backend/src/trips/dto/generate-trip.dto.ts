import { IsDateString, IsNotEmpty } from 'class-validator';

/**
 * DTO for trip generation request
 */
export class GenerateTripDto {
  /**
   * Date for which to generate trips (ISO 8601 format)
   * @example "2026-07-30"
   */
  @IsNotEmpty({ message: 'Date is required' })
  @IsDateString({}, { message: 'Date must be a valid ISO 8601 date string' })
  date: string;
}
