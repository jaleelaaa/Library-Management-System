import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type {
  Vendor,
  VendorListItem,
  VendorsFilter,
  Fund,
  FundsFilter,
  PurchaseOrder,
  PurchaseOrderListItem,
  PurchaseOrdersFilter,
  OrderLine,
  OrderLinesFilter,
  Invoice,
  InvoiceListItem,
  InvoicesFilter,
  PaginationMeta
} from '../../types/acquisitions'
import * as acquisitionsService from '../../services/acquisitionsService'
import { toast } from 'react-toastify'

interface AcquisitionsState {
  // Vendors
  vendors: VendorListItem[]
  selectedVendor: Vendor | null
  vendorsMeta: PaginationMeta | null
  vendorsFilters: VendorsFilter

  // Funds
  funds: Fund[]
  selectedFund: Fund | null
  fundsMeta: PaginationMeta | null
  fundsFilters: FundsFilter

  // Purchase Orders
  purchaseOrders: PurchaseOrderListItem[]
  selectedPurchaseOrder: PurchaseOrder | null
  purchaseOrdersMeta: PaginationMeta | null
  purchaseOrdersFilters: PurchaseOrdersFilter

  // Order Lines
  orderLines: OrderLine[]
  orderLinesMeta: PaginationMeta | null
  orderLinesFilters: OrderLinesFilter

  // Invoices
  invoices: InvoiceListItem[]
  selectedInvoice: Invoice | null
  invoicesMeta: PaginationMeta | null
  invoicesFilters: InvoicesFilter

  loading: boolean
  error: string | null
}

const initialState: AcquisitionsState = {
  vendors: [],
  selectedVendor: null,
  vendorsMeta: null,
  vendorsFilters: { page: 1, page_size: 20 },

  funds: [],
  selectedFund: null,
  fundsMeta: null,
  fundsFilters: { page: 1, page_size: 20 },

  purchaseOrders: [],
  selectedPurchaseOrder: null,
  purchaseOrdersMeta: null,
  purchaseOrdersFilters: { page: 1, page_size: 20 },

  orderLines: [],
  orderLinesMeta: null,
  orderLinesFilters: { page: 1, page_size: 20 },

  invoices: [],
  selectedInvoice: null,
  invoicesMeta: null,
  invoicesFilters: { page: 1, page_size: 20 },

  loading: false,
  error: null
}

// ============================================================================
// Async Thunks - Vendors
// ============================================================================

export const fetchVendors = createAsyncThunk(
  'acquisitions/fetchVendors',
  async (filters: VendorsFilter = {}, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchVendors(filters)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch vendors')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const fetchVendorById = createAsyncThunk(
  'acquisitions/fetchVendorById',
  async (vendorId: string, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchVendorById(vendorId)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch vendor')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const createVendor = createAsyncThunk(
  'acquisitions/createVendor',
  async (vendorData: any, { rejectWithValue, dispatch }) => {
    try {
      const vendor = await acquisitionsService.createVendor(vendorData)
      toast.success('Vendor created successfully')
      dispatch(fetchVendors())
      return vendor
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create vendor')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const updateVendor = createAsyncThunk(
  'acquisitions/updateVendor',
  async ({ vendorId, vendorData }: { vendorId: string; vendorData: any }, { rejectWithValue, dispatch }) => {
    try {
      const vendor = await acquisitionsService.updateVendor(vendorId, vendorData)
      toast.success('Vendor updated successfully')
      dispatch(fetchVendors())
      return vendor
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update vendor')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const deleteVendor = createAsyncThunk(
  'acquisitions/deleteVendor',
  async (vendorId: string, { rejectWithValue, dispatch }) => {
    try {
      await acquisitionsService.deleteVendor(vendorId)
      toast.success('Vendor deleted successfully')
      dispatch(fetchVendors())
      return vendorId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete vendor')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

// ============================================================================
// Async Thunks - Funds
// ============================================================================

export const fetchFunds = createAsyncThunk(
  'acquisitions/fetchFunds',
  async (filters: FundsFilter = {}, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchFunds(filters)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch funds')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const createFund = createAsyncThunk(
  'acquisitions/createFund',
  async (fundData: any, { rejectWithValue, dispatch }) => {
    try {
      const fund = await acquisitionsService.createFund(fundData)
      toast.success('Fund created successfully')
      dispatch(fetchFunds())
      return fund
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create fund')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const updateFund = createAsyncThunk(
  'acquisitions/updateFund',
  async ({ fundId, fundData }: { fundId: string; fundData: any }, { rejectWithValue, dispatch }) => {
    try {
      const fund = await acquisitionsService.updateFund(fundId, fundData)
      toast.success('Fund updated successfully')
      dispatch(fetchFunds())
      return fund
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update fund')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const deleteFund = createAsyncThunk(
  'acquisitions/deleteFund',
  async (fundId: string, { rejectWithValue, dispatch }) => {
    try {
      await acquisitionsService.deleteFund(fundId)
      toast.success('Fund deleted successfully')
      dispatch(fetchFunds())
      return fundId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete fund')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

// ============================================================================
// Async Thunks - Purchase Orders
// ============================================================================

export const fetchPurchaseOrders = createAsyncThunk(
  'acquisitions/fetchPurchaseOrders',
  async (filters: PurchaseOrdersFilter = {}, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchPurchaseOrders(filters)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch purchase orders')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const fetchPurchaseOrderById = createAsyncThunk(
  'acquisitions/fetchPurchaseOrderById',
  async (poId: string, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchPurchaseOrderById(poId)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch purchase order')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const createPurchaseOrder = createAsyncThunk(
  'acquisitions/createPurchaseOrder',
  async (poData: any, { rejectWithValue, dispatch }) => {
    try {
      const po = await acquisitionsService.createPurchaseOrder(poData)
      toast.success('Purchase order created successfully')
      dispatch(fetchPurchaseOrders())
      return po
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create purchase order')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const updatePurchaseOrder = createAsyncThunk(
  'acquisitions/updatePurchaseOrder',
  async ({ poId, poData }: { poId: string; poData: any }, { rejectWithValue, dispatch }) => {
    try {
      const po = await acquisitionsService.updatePurchaseOrder(poId, poData)
      toast.success('Purchase order updated successfully')
      dispatch(fetchPurchaseOrders())
      return po
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update purchase order')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const deletePurchaseOrder = createAsyncThunk(
  'acquisitions/deletePurchaseOrder',
  async (poId: string, { rejectWithValue, dispatch }) => {
    try {
      await acquisitionsService.deletePurchaseOrder(poId)
      toast.success('Purchase order deleted successfully')
      dispatch(fetchPurchaseOrders())
      return poId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete purchase order')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

// ============================================================================
// Async Thunks - Invoices
// ============================================================================

export const fetchInvoices = createAsyncThunk(
  'acquisitions/fetchInvoices',
  async (filters: InvoicesFilter = {}, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchInvoices(filters)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch invoices')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const fetchInvoiceById = createAsyncThunk(
  'acquisitions/fetchInvoiceById',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      return await acquisitionsService.fetchInvoiceById(invoiceId)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch invoice')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const createInvoice = createAsyncThunk(
  'acquisitions/createInvoice',
  async (invoiceData: any, { rejectWithValue, dispatch }) => {
    try {
      const invoice = await acquisitionsService.createInvoice(invoiceData)
      toast.success('Invoice created successfully')
      dispatch(fetchInvoices())
      return invoice
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const updateInvoice = createAsyncThunk(
  'acquisitions/updateInvoice',
  async ({ invoiceId, invoiceData }: { invoiceId: string; invoiceData: any }, { rejectWithValue, dispatch }) => {
    try {
      const invoice = await acquisitionsService.updateInvoice(invoiceId, invoiceData)
      toast.success('Invoice updated successfully')
      dispatch(fetchInvoices())
      return invoice
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update invoice')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

export const deleteInvoice = createAsyncThunk(
  'acquisitions/deleteInvoice',
  async (invoiceId: string, { rejectWithValue, dispatch }) => {
    try {
      await acquisitionsService.deleteInvoice(invoiceId)
      toast.success('Invoice deleted successfully')
      dispatch(fetchInvoices())
      return invoiceId
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete invoice')
      return rejectWithValue(error.response?.data?.detail)
    }
  }
)

// ============================================================================
// Slice
// ============================================================================

const acquisitionsSlice = createSlice({
  name: 'acquisitions',
  initialState,
  reducers: {
    setSelectedVendor: (state, action: PayloadAction<Vendor | null>) => {
      state.selectedVendor = action.payload
    },
    setVendorsFilters: (state, action: PayloadAction<VendorsFilter>) => {
      state.vendorsFilters = { ...state.vendorsFilters, ...action.payload }
    },
    setSelectedFund: (state, action: PayloadAction<Fund | null>) => {
      state.selectedFund = action.payload
    },
    setFundsFilters: (state, action: PayloadAction<FundsFilter>) => {
      state.fundsFilters = { ...state.fundsFilters, ...action.payload }
    },
    setSelectedPurchaseOrder: (state, action: PayloadAction<PurchaseOrder | null>) => {
      state.selectedPurchaseOrder = action.payload
    },
    setPurchaseOrdersFilters: (state, action: PayloadAction<PurchaseOrdersFilter>) => {
      state.purchaseOrdersFilters = { ...state.purchaseOrdersFilters, ...action.payload }
    },
    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload
    },
    setInvoicesFilters: (state, action: PayloadAction<InvoicesFilter>) => {
      state.invoicesFilters = { ...state.invoicesFilters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Vendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false
        state.vendors = action.payload.data
        state.vendorsMeta = action.payload.meta
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchVendorById.fulfilled, (state, action) => {
        state.selectedVendor = action.payload
      })

    builder
      .addCase(createVendor.pending, (state) => {
        state.loading = true
      })
      .addCase(createVendor.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(updateVendor.pending, (state) => {
        state.loading = true
      })
      .addCase(updateVendor.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteVendor.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Funds
    builder
      .addCase(fetchFunds.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFunds.fulfilled, (state, action) => {
        state.loading = false
        state.funds = action.payload.data
        state.fundsMeta = action.payload.meta
      })
      .addCase(fetchFunds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(createFund.pending, (state) => {
        state.loading = true
      })
      .addCase(createFund.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createFund.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Purchase Orders
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrders = action.payload.data
        state.purchaseOrdersMeta = action.payload.meta
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.selectedPurchaseOrder = action.payload
      })

    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data
        state.invoicesMeta = action.payload.meta
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.selectedInvoice = action.payload
      })

    builder
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
      })
      .addCase(createInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSelectedVendor,
  setVendorsFilters,
  setSelectedFund,
  setFundsFilters,
  setSelectedPurchaseOrder,
  setPurchaseOrdersFilters,
  setSelectedInvoice,
  setInvoicesFilters,
  clearError
} = acquisitionsSlice.actions

export default acquisitionsSlice.reducer
