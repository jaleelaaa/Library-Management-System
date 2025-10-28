import api from './api';

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface ReportFilters {
  date_range?: DateRange;
  user_id?: string;
  patron_group_id?: string;
  item_id?: string;
  instance_id?: string;
  vendor_id?: string;
  fund_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CirculationReportRequest {
  report_type: 'circulation';
  filters?: ReportFilters;
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  include_charts?: boolean;
  group_by?: string;
}

export interface CollectionReportRequest {
  report_type: 'collection';
  filters?: ReportFilters;
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  include_statistics?: boolean;
  group_by?: string;
}

export interface FinancialReportRequest {
  report_type: 'financial';
  filters?: ReportFilters;
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  include_charts?: boolean;
  summary_only?: boolean;
}

export interface OverdueReportRequest {
  report_type: 'overdue';
  filters?: ReportFilters;
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  min_days_overdue?: number;
  include_fines?: boolean;
}

export interface ReportData {
  report_type: string;
  title: string;
  description?: string;
  generated_at: string;
  filters_applied: Record<string, any>;
  total_records: number;
  data: any[];
  summary?: Record<string, any>;
  charts?: any[];
}

export interface CirculationStats {
  total_checkouts: number;
  total_checkins: number;
  total_renewals: number;
  active_loans: number;
  overdue_loans: number;
  holds_placed: number;
  holds_filled: number;
  average_loan_period?: number;
  top_borrowed_items?: any[];
  busiest_days?: any[];
}

export interface CollectionStats {
  total_instances: number;
  total_items: number;
  items_available: number;
  items_checked_out: number;
  items_on_hold: number;
  items_in_transit: number;
  by_type?: Record<string, number>;
  by_language?: Record<string, number>;
  by_subject?: Record<string, number>;
  top_circulating?: any[];
  least_circulating?: any[];
}

export interface FinancialStats {
  total_allocated: number;
  total_expended: number;
  total_encumbered: number;
  total_available: number;
  total_invoices: number;
  total_invoice_amount: number;
  paid_invoices: number;
  paid_amount: number;
  pending_invoices: number;
  pending_amount: number;
  by_fund?: Record<string, Record<string, number>>;
  by_vendor?: Record<string, number>;
  top_expenditures?: any[];
}

export interface UserStats {
  total_users: number;
  active_users: number;
  by_patron_group?: Record<string, number>;
  users_with_overdues: number;
  users_with_holds: number;
  users_with_fines: number;
  average_items_per_user?: number;
  top_borrowers?: any[];
}

export interface DashboardStats {
  circulation: CirculationStats;
  collection: CollectionStats;
  financial: FinancialStats;
  users: UserStats;
  generated_at: string;
}

const reportsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/reports/dashboard-stats');
    return response.data;
  },

  generateCirculationReport: async (request: CirculationReportRequest): Promise<ReportData | Blob> => {
    if (request.export_format === 'json') {
      const response = await api.post('/reports/circulation', request);
      return response.data;
    } else {
      const response = await api.post('/reports/circulation', request, {
        responseType: 'blob',
      });
      return response.data;
    }
  },

  generateCollectionReport: async (request: CollectionReportRequest): Promise<ReportData | Blob> => {
    if (request.export_format === 'json') {
      const response = await api.post('/reports/collection', request);
      return response.data;
    } else {
      const response = await api.post('/reports/collection', request, {
        responseType: 'blob',
      });
      return response.data;
    }
  },

  generateOverdueReport: async (request: OverdueReportRequest): Promise<ReportData | Blob> => {
    if (request.export_format === 'json') {
      const response = await api.post('/reports/overdue', request);
      return response.data;
    } else {
      const response = await api.post('/reports/overdue', request, {
        responseType: 'blob',
      });
      return response.data;
    }
  },

  generateFinancialReport: async (request: FinancialReportRequest): Promise<ReportData | Blob> => {
    if (request.export_format === 'json') {
      const response = await api.post('/reports/financial', request);
      return response.data;
    } else {
      const response = await api.post('/reports/financial', request, {
        responseType: 'blob',
      });
      return response.data;
    }
  },

  downloadReport: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reportsService;
