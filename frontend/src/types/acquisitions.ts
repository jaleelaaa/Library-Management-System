/**
 * TypeScript types for Acquisitions module
 */

// ============================================================================
// Vendor Types
// ============================================================================

export type VendorStatus = 'active' | 'inactive' | 'pending'

export interface VendorContact {
  id: string
  vendor_id: string
  name: string
  email?: string
  phone?: string
  role?: string
  created_at: string
  updated_at: string
}

export interface VendorAddress {
  id: string
  vendor_id: string
  address_line1: string
  address_line2?: string
  city: string
  state_region?: string
  postal_code?: string
  country: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  code: string
  name: string
  description?: string
  vendor_status: VendorStatus
  payment_method?: string
  discount_percent?: number
  tax_id?: string
  language: string
  currency: string
  is_vendor: boolean
  is_customer: boolean
  contacts: VendorContact[]
  addresses: VendorAddress[]
  created_at: string
  updated_at: string
}

export interface VendorListItem {
  id: string
  code: string
  name: string
  vendor_status: VendorStatus
  payment_method?: string
  is_vendor: boolean
  is_customer: boolean
  created_at: string
}

export interface VendorContactCreate {
  name: string
  email?: string
  phone?: string
  role?: string
}

export interface VendorAddressCreate {
  address_line1: string
  address_line2?: string
  city: string
  state_region?: string
  postal_code?: string
  country: string
  is_primary?: boolean
}

export interface VendorCreate {
  code: string
  name: string
  description?: string
  vendor_status?: VendorStatus
  payment_method?: string
  discount_percent?: number
  tax_id?: string
  language?: string
  currency?: string
  is_vendor?: boolean
  is_customer?: boolean
  contacts?: VendorContactCreate[]
  addresses?: VendorAddressCreate[]
}

export interface VendorUpdate {
  code?: string
  name?: string
  description?: string
  vendor_status?: VendorStatus
  payment_method?: string
  discount_percent?: number
  tax_id?: string
  language?: string
  currency?: string
  is_vendor?: boolean
  is_customer?: boolean
}

// ============================================================================
// Fund Types
// ============================================================================

export type FundStatus = 'active' | 'inactive' | 'frozen'

export interface Fund {
  id: string
  code: string
  name: string
  description?: string
  fund_status: FundStatus
  fund_type?: string
  allocated_amount: number
  available_amount: number
  expenditure_amount: number
  encumbrance_amount: number
  currency: string
  created_at: string
  updated_at: string
}

export interface FundCreate {
  code: string
  name: string
  description?: string
  fund_status?: FundStatus
  fund_type?: string
  allocated_amount?: number
  currency?: string
}

export interface FundUpdate {
  code?: string
  name?: string
  description?: string
  fund_status?: FundStatus
  fund_type?: string
  allocated_amount?: number
  currency?: string
}

// ============================================================================
// Purchase Order Types
// ============================================================================

export type OrderType = 'one_time' | 'ongoing'
export type WorkflowStatus = 'pending' | 'open' | 'closed' | 'cancelled'

export interface PurchaseOrder {
  id: string
  po_number: string
  vendor_id: string
  vendor_name?: string
  order_type: OrderType
  workflow_status: WorkflowStatus
  approved: boolean
  total_items: number
  total_estimated_price: number
  ship_to?: string
  bill_to?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderListItem {
  id: string
  po_number: string
  vendor_id: string
  vendor_name?: string
  order_type: OrderType
  workflow_status: WorkflowStatus
  approved: boolean
  total_items: number
  total_estimated_price: number
  created_at: string
}

export interface PurchaseOrderCreate {
  po_number: string
  vendor_id: string
  order_type: OrderType
  workflow_status?: WorkflowStatus
  approved?: boolean
  ship_to?: string
  bill_to?: string
  notes?: string
}

export interface PurchaseOrderUpdate {
  vendor_id?: string
  order_type?: OrderType
  workflow_status?: WorkflowStatus
  approved?: boolean
  ship_to?: string
  bill_to?: string
  notes?: string
}

// ============================================================================
// Order Line Types
// ============================================================================

export type ReceiptStatus = 'pending' | 'partially_received' | 'received' | 'cancelled'
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'cancelled'

export interface OrderLine {
  id: string
  po_id: string
  po_number?: string
  title: string
  item_id?: string
  quantity: number
  quantity_received: number
  unit_price: number
  total_price: number
  currency: string
  fund_id?: string
  fund_code?: string
  acquisition_method?: string
  receipt_status: ReceiptStatus
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

export interface OrderLineCreate {
  po_id: string
  title: string
  item_id?: string
  quantity: number
  unit_price: number
  currency?: string
  fund_id?: string
  acquisition_method?: string
  receipt_status?: ReceiptStatus
  payment_status?: PaymentStatus
}

export interface OrderLineUpdate {
  title?: string
  quantity?: number
  unit_price?: number
  currency?: string
  fund_id?: string
  acquisition_method?: string
  receipt_status?: ReceiptStatus
  payment_status?: PaymentStatus
}

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = 'open' | 'approved' | 'paid' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  vendor_id: string
  vendor_name?: string
  invoice_date: string
  payment_due_date?: string
  payment_terms?: string
  status: InvoiceStatus
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceListItem {
  id: string
  invoice_number: string
  vendor_id: string
  vendor_name?: string
  invoice_date: string
  payment_due_date?: string
  status: InvoiceStatus
  total_amount: number
  created_at: string
}

export interface InvoiceCreate {
  invoice_number: string
  vendor_id: string
  invoice_date: string
  payment_due_date?: string
  payment_terms?: string
  status?: InvoiceStatus
  notes?: string
}

export interface InvoiceUpdate {
  vendor_id?: string
  invoice_date?: string
  payment_due_date?: string
  payment_terms?: string
  status?: InvoiceStatus
  notes?: string
}

export interface InvoiceLine {
  id: string
  invoice_id: string
  order_line_id?: string
  description: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
  updated_at: string
}

export interface InvoiceLineCreate {
  invoice_id: string
  order_line_id?: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface InvoiceLineUpdate {
  description?: string
  quantity?: number
  unit_price?: number
  total?: number
}

// ============================================================================
// Filter Types
// ============================================================================

export interface VendorsFilter {
  page?: number
  page_size?: number
  search?: string
  vendor_status?: VendorStatus
  is_vendor?: boolean
}

export interface FundsFilter {
  page?: number
  page_size?: number
  search?: string
  fund_status?: FundStatus
}

export interface PurchaseOrdersFilter {
  page?: number
  page_size?: number
  search?: string
  vendor_id?: string
  workflow_status?: WorkflowStatus
  approved?: boolean
}

export interface OrderLinesFilter {
  page?: number
  page_size?: number
  po_id?: string
  fund_id?: string
  receipt_status?: ReceiptStatus
  payment_status?: PaymentStatus
}

export interface InvoicesFilter {
  page?: number
  page_size?: number
  search?: string
  vendor_id?: string
  status?: InvoiceStatus
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface PaginatedVendorsResponse {
  data: VendorListItem[]
  meta: PaginationMeta
}

export interface PaginatedFundsResponse {
  data: Fund[]
  meta: PaginationMeta
}

export interface PaginatedPurchaseOrdersResponse {
  data: PurchaseOrderListItem[]
  meta: PaginationMeta
}

export interface PaginatedOrderLinesResponse {
  data: OrderLine[]
  meta: PaginationMeta
}

export interface PaginatedInvoicesResponse {
  data: InvoiceListItem[]
  meta: PaginationMeta
}
