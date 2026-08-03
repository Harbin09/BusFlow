/**
 * Context object passed to rules during evaluation.
 * Contains all data needed for rule evaluation without database access.
 * Data should be pre-fetched and passed as a context object.
 */
export class RuleContext {
  /**
   * Date for which we're generating the trip
   */
  date: Date;

  /**
   * Route ID to be used for the trip
   */
  routeId: string;

  /**
   * Bus ID to be used for the trip
   */
  busId: string;

  /**
   * Bus capacity (total seats available)
   */
  busCapacity: number;

  /**
   * Driver ID to be assigned to the trip
   */
  driverId: string;

  /**
   * Planned departure time for the trip
   */
  departureTime: Date;

  /**
   * Planned arrival time for the trip
   */
  arrivalTime?: Date;

  /**
   * List of student IDs to be assigned to this trip
   */
  assignedStudentIds: string[];

  /**
   * Available driver IDs for this date
   * Pre-filtered list of drivers who are not already assigned elsewhere
   */
  availableDriverIds: string[];

  /**
   * Estimated duration in minutes for this route
   */
  estimatedDurationMinutes?: number;

  /**
   * Timetable information for this date
   * Type indicates what kind of day it is (CLASS, EXAM, HOLIDAY, EVENT)
   */
  timetableType?: 'CLASS' | 'EXAM' | 'HOLIDAY' | 'EVENT';

  /**
   * Boolean indicating if today is a holiday
   */
  isHoliday?: boolean;

  /**
   * Optional metadata for custom rule extensions
   * Allows rules to pass extra data without modifying the core context
   */
  metadata?: Record<string, unknown>;

  constructor(partial: Partial<RuleContext>) {
    Object.assign(this, partial);
  }
}
