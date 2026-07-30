import React from 'react';
import { Badge } from '../ui/Badge';
import { formatStatusLabel } from '@/utils/format';

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (s: string) => {
    switch (s.toUpperCase()) {
      case 'ACTIVE':
      case 'ON_TRIP':
      case 'ON_DUTY':
      case 'IN_PROGRESS':
        return 'success';
      case 'MAINTENANCE':
      case 'DELAYED':
      case 'PENDING':
        return 'warning';
      case 'INACTIVE':
      case 'EXPIRED':
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return <Badge variant={getVariant(status)}>{formatStatusLabel(status)}</Badge>;
};
