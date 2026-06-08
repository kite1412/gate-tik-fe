import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (dateString) => {
  return format(new Date(dateString), 'd MMMM yyyy, HH:mm:ss', { locale: id });
};
