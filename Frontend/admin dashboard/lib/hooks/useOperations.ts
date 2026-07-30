import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  operationsService,
  TripGenerationResult,
  DriverTodayResponse,
  StudentTodayResponse,
  BusLocationResponse,
  PassengerListResponse,
} from '../services/operations';

/**
 * Generate trips for a date
 */
export function useGenerateTrips(date: string, enabled = true) {
  return useQuery({
    queryKey: ['trips', 'generate', date],
    queryFn: () => operationsService.generateTrips(date),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Get today's trip for driver
 */
export function useDriverTodayTrip() {
  return useQuery({
    queryKey: ['driver', 'today-trip'],
    queryFn: () => operationsService.getDriverTodayTrip(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });
}

/**
 * Get passenger list for a trip
 */
export function useTripPassengers(tripId: string | null) {
  return useQuery({
    queryKey: ['trip', tripId, 'passengers'],
    queryFn: () => operationsService.getTripPassengers(tripId!),
    enabled: !!tripId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
  });
}

/**
 * Get today's trip for student
 */
export function useStudentTodayTrip() {
  return useQuery({
    queryKey: ['student', 'today-trip'],
    queryFn: () => operationsService.getStudentTodayTrip(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });
}

/**
 * Get current bus location for student's trip
 */
export function useBusLocation(tripId: string | null) {
  return useQuery({
    queryKey: ['bus', tripId, 'location'],
    queryFn: () => operationsService.getBusLocation(tripId!),
    enabled: !!tripId,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: 3 * 1000, // Refetch every 3 seconds
  });
}

/**
 * Start trip mutation
 */
export function useStartTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => operationsService.startTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'today-trip'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
}

/**
 * End trip mutation
 */
export function useEndTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => operationsService.endTrip(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'today-trip'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    },
  });
}

/**
 * Update location mutation
 */
export function useUpdateLocation() {
  return useMutation({
    mutationFn: operationsService.updateLocation,
  });
}

/**
 * Activate tracking mutation
 */
export function useActivateTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => operationsService.activateTracking(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}

/**
 * Complete tracking mutation
 */
export function useCompleteTracking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => operationsService.completeTracking(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });
}
