/**
 * Acquisitions API Service
 */
import api from './api'
import type {
  Vendor,
  VendorCreate,
  VendorUpdate,
  PaginatedVendorsResponse,
  VendorsFilter,
  Fund,
  FundCreate,
  FundUpdate,
  PaginatedFundsResponse,
  FundsFilter,
  PurchaseOrder,
  PurchaseOrderCreate,
  PurchaseOrderUpdate,
  PaginatedPurchaseOrdersResponse,
  PurchaseOrdersFilter,
  OrderLine,
  OrderLineCreate,
  OrderLineUpdate,
  PaginatedOrderLinesResponse,
  OrderLinesFilter,
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  PaginatedInvoicesResponse,
  InvoicesFilter
} from '../types/acquisitions'

const ACQUISITIONS_BASE_URL = '/api/v1/acquisitions'

// ============================================================================
// Vendors
// ============================================================================

export const fetchVendors = async (filters: VendorsFilter = {}): Promise<PaginatedVendorsResponse> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.vendor_status) params.append('vendor_status', filters.vendor_status)
  if (filters.is_vendor !== undefined) params.append('is_vendor', filters.is_vendor.toString())

  const response = await api.get(`${ACQUISITIONS_BASE_URL}/vendors/?${params.toString()}`)
  return response.data
}

export const fetchVendorById = async (vendorId: string): Promise<Vendor> => {
  const response = await api.get(`${ACQUISITIONS_BASE_URL}/vendors/${vendorId}`)
  return response.data
}

export const createVendor = async (vendorData: VendorCreate): Promise<Vendor> => {
  const response = await api.post(`${ACQUISITIONS_BASE_URL}/vendors/`, vendorData)
  return response.data
}

export const updateVendor = async (vendorId: string, vendorData: VendorUpdate): Promise<Vendor> => {
  const response = await api.patch(`${ACQUISITIONS_BASE_URL}/vendors/${vendorId}`, vendorData)
  return response.data
}

export const deleteVendor = async (vendorId: string): Promise<void> => {
  await api.delete(`${ACQUISITIONS_BASE_URL}/vendors/${vendorId}`)
}

// ============================================================================
// Funds
// ============================================================================

export const fetchFunds = async (filters: FundsFilter = {}): Promise<PaginatedFundsResponse> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.fund_status) params.append('fund_status', filters.fund_status)

  const response = await api.get(`${ACQUISITIONS_BASE_URL}/funds/?${params.toString()}`)
  return response.data
}

export const fetchFundById = async (fundId: string): Promise<Fund> => {
  const response = await api.get(`${ACQUISITIONS_BASE_URL}/funds/${fundId}`)
  return response.data
}

export const createFund = async (fundData: FundCreate): Promise<Fund> => {
  const response = await api.post(`${ACQUISITIONS_BASE_URL}/funds/`, fundData)
  return response.data
}

export const updateFund = async (fundId: string, fundData: FundUpdate): Promise<Fund> => {
  const response = await api.patch(`${ACQUISITIONS_BASE_URL}/funds/${fundId}`, fundData)
  return response.data
}

export const deleteFund = async (fundId: string): Promise<void> => {
  await api.delete(`${ACQUISITIONS_BASE_URL}/funds/${fundId}`)
}

// ============================================================================
// Purchase Orders
// ============================================================================

export const fetchPurchaseOrders = async (filters: PurchaseOrdersFilter = {}): Promise<PaginatedPurchaseOrdersResponse> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.vendor_id) params.append('vendor_id', filters.vendor_id)
  if (filters.workflow_status) params.append('workflow_status', filters.workflow_status)
  if (filters.approved !== undefined) params.append('approved', filters.approved.toString())

  const response = await api.get(`${ACQUISITIONS_BASE_URL}/purchase-orders/?${params.toString()}`)
  return response.data
}

export const fetchPurchaseOrderById = async (poId: string): Promise<PurchaseOrder> => {
  const response = await api.get(`${ACQUISITIONS_BASE_URL}/purchase-orders/${poId}`)
  return response.data
}

export const createPurchaseOrder = async (poData: PurchaseOrderCreate): Promise<PurchaseOrder> => {
  const response = await api.post(`${ACQUISITIONS_BASE_URL}/purchase-orders/`, poData)
  return response.data
}

export const updatePurchaseOrder = async (poId: string, poData: PurchaseOrderUpdate): Promise<PurchaseOrder> => {
  const response = await api.patch(`${ACQUISITIONS_BASE_URL}/purchase-orders/${poId}`, poData)
  return response.data
}

export const deletePurchaseOrder = async (poId: string): Promise<void> => {
  await api.delete(`${ACQUISITIONS_BASE_URL}/purchase-orders/${poId}`)
}

// ============================================================================
// Order Lines
// ============================================================================

export const fetchOrderLines = async (filters: OrderLinesFilter = {}): Promise<PaginatedOrderLinesResponse> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.po_id) params.append('po_id', filters.po_id)
  if (filters.fund_id) params.append('fund_id', filters.fund_id)
  if (filters.receipt_status) params.append('receipt_status', filters.receipt_status)
  if (filters.payment_status) params.append('payment_status', filters.payment_status)

  const response = await api.get(`${ACQUISITIONS_BASE_URL}/order-lines/?${params.toString()}`)
  return response.data
}

export const createOrderLine = async (olData: OrderLineCreate): Promise<OrderLine> => {
  const response = await api.post(`${ACQUISITIONS_BASE_URL}/order-lines/`, olData)
  return response.data
}

export const updateOrderLine = async (olId: string, olData: OrderLineUpdate): Promise<OrderLine> => {
  const response = await api.patch(`${ACQUISITIONS_BASE_URL}/order-lines/${olId}`, olData)
  return response.data
}

// ============================================================================
// Invoices
// ============================================================================

export const fetchInvoices = async (filters: InvoicesFilter = {}): Promise<PaginatedInvoicesResponse> => {
  const params = new URLSearchParams()
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.page_size) params.append('page_size', filters.page_size.toString())
  if (filters.search) params.append('search', filters.search)
  if (filters.vendor_id) params.append('vendor_id', filters.vendor_id)
  if (filters.status) params.append('status', filters.status)

  const response = await api.get(`${ACQUISITIONS_BASE_URL}/invoices/?${params.toString()}`)
  return response.data
}

export const fetchInvoiceById = async (invoiceId: string): Promise<Invoice> => {
  const response = await api.get(`${ACQUISITIONS_BASE_URL}/invoices/${invoiceId}`)
  return response.data
}

export const createInvoice = async (invoiceData: InvoiceCreate): Promise<Invoice> => {
  const response = await api.post(`${ACQUISITIONS_BASE_URL}/invoices/`, invoiceData)
  return response.data
}

export const updateInvoice = async (invoiceId: string, invoiceData: InvoiceUpdate): Promise<Invoice> => {
  const response = await api.patch(`${ACQUISITIONS_BASE_URL}/invoices/${invoiceId}`, invoiceData)
  return response.data
}

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  await api.delete(`${ACQUISITIONS_BASE_URL}/invoices/${invoiceId}`)
}
