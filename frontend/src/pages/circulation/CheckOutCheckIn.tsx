import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { checkOutItem, checkInItem, renewLoan, fetchLoans } from '../../store/slices/circulationSlice'
import { useLanguage } from '../../contexts/LanguageContext'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, X, Info, Clock, User, Package, Calendar, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Default service point ID (should be configurable)
const DEFAULT_SERVICE_POINT = '00000000-0000-0000-0000-000000000000'

const CheckOutCheckIn = () => {
  const dispatch = useAppDispatch()
  const { loading } = useAppSelector(state => state.circulation)
  const { t } = useLanguage()

  const [operation, setOperation] = useState<'checkout' | 'checkin' | 'renew'>('checkout')

  // Check-out form
  const [checkoutForm, setCheckoutForm] = useState({
    item_barcode: '',
    user_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  // Check-in form
  const [checkinForm, setCheckinForm] = useState({
    item_barcode: '',
    service_point_id: DEFAULT_SERVICE_POINT
  })

  // Renew form
  const [renewForm, setRenewForm] = useState({
    item_barcode: ''
  })

  // Recent transactions
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(checkOutItem(checkoutForm))

    if (checkOutItem.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkout', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setCheckoutForm({
        ...checkoutForm,
        item_barcode: '',
        user_barcode: ''
      })

      // Refresh loans list
      dispatch(fetchLoans({}))
    }
  }

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(checkInItem(checkinForm))

    if (checkInItem.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'checkin', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setCheckinForm({
        ...checkinForm,
        item_barcode: ''
      })

      // Refresh loans list
      dispatch(fetchLoans({}))
    }
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(renewLoan(renewForm))

    if (renewLoan.fulfilled.match(result)) {
      // Add to recent transactions
      setRecentTransactions(prev => [
        { ...result.payload, type: 'renew', timestamp: new Date().toISOString() },
        ...prev.slice(0, 9)
      ])

      // Clear form
      setRenewForm({ item_barcode: '' })

      // Refresh loans list
      dispatch(fetchLoans({}))
    }
  }

  const clearRecentTransactions = () => {
    setRecentTransactions([])
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            {t('circulation.title')}
          </h1>
          <p className="text-gray-600 mt-2">Process check-outs, check-ins, and renewals</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Operations */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-md border-0">
              <CardContent className="pt-6">
                <Tabs value={operation} onValueChange={(value) => setOperation(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="checkout" className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4" />
                      {t('circulation.checkout.title')}
                    </TabsTrigger>
                    <TabsTrigger value="checkin" className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4" />
                      {t('circulation.checkin.title')}
                    </TabsTrigger>
                    <TabsTrigger value="renew" className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      {t('circulation.renew.title')}
                    </TabsTrigger>
                  </TabsList>

                  {/* Check Out Form */}
                  <TabsContent value="checkout">
                    <form onSubmit={handleCheckOut} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_barcode" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-500" />
                          {t('circulation.checkout.userBarcode')} *
                        </Label>
                        <Input
                          id="user_barcode"
                          type="text"
                          required
                          value={checkoutForm.user_barcode}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, user_barcode: e.target.value })}
                          placeholder={t('circulation.checkout.userPlaceholder')}
                          className="h-11"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item_barcode_checkout" className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-green-500" />
                          {t('circulation.checkout.itemBarcode')} *
                        </Label>
                        <Input
                          id="item_barcode_checkout"
                          type="text"
                          required
                          value={checkoutForm.item_barcode}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, item_barcode: e.target.value })}
                          placeholder={t('circulation.checkout.itemPlaceholder')}
                          className="h-11"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base"
                      >
                        {loading ? t('circulation.checkout.processing') : t('circulation.checkout.button')}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Check In Form */}
                  <TabsContent value="checkin">
                    <form onSubmit={handleCheckIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item_barcode_checkin" className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          {t('circulation.checkin.itemBarcode')} *
                        </Label>
                        <Input
                          id="item_barcode_checkin"
                          type="text"
                          required
                          value={checkinForm.item_barcode}
                          onChange={(e) => setCheckinForm({ ...checkinForm, item_barcode: e.target.value })}
                          placeholder={t('circulation.checkin.itemPlaceholder')}
                          className="h-11"
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-base"
                      >
                        {loading ? t('circulation.checkin.processing') : t('circulation.checkin.button')}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Renew Form */}
                  <TabsContent value="renew">
                    <form onSubmit={handleRenew} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="item_barcode_renew" className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-500" />
                          {t('circulation.renew.itemBarcode')} *
                        </Label>
                        <Input
                          id="item_barcode_renew"
                          type="text"
                          required
                          value={renewForm.item_barcode}
                          onChange={(e) => setRenewForm({ item_barcode: e.target.value })}
                          placeholder={t('circulation.renew.itemPlaceholder')}
                          className="h-11"
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-base"
                      >
                        {loading ? t('circulation.renew.processing') : t('circulation.renew.button')}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{t('circulation.instructions.title')}</h3>
                </div>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{t('circulation.instructions.scanner')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{t('circulation.instructions.checkout')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{t('circulation.instructions.checkin')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{t('circulation.instructions.renew')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{t('circulation.instructions.recent')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-md border-0 sticky top-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">{t('circulation.recentTransactions')}</h3>
                  </div>
                  {recentTransactions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentTransactions}
                      className="h-8"
                    >
                      <X className="w-4 h-4 me-1" />
                      {t('circulation.clear')}
                    </Button>
                  )}
                </div>

                <Separator className="mb-4" />

                {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
                        <Clock className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-500">{t('circulation.noTransactions')}</p>
                  </div>
                ) : (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3 max-h-[600px] overflow-y-auto"
                  >
                    <AnimatePresence>
                      {recentTransactions.map((transaction, index) => (
                        <motion.div
                          key={index}
                          variants={item}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border-s-4 ${
                            transaction.type === 'checkout'
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                              : transaction.type === 'checkin'
                              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500'
                              : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-500'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge
                              className={`${
                                transaction.type === 'checkout'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : transaction.type === 'checkin'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {transaction.type === 'checkout'
                                ? t('circulation.checkedOut')
                                : transaction.type === 'checkin'
                                ? t('circulation.checkedIn')
                                : t('circulation.renewed')}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="text-sm space-y-1.5">
                            <div className="font-semibold text-gray-900">
                              {transaction.item_title || t('circulation.unknownItem')}
                            </div>
                            <div className="text-gray-600 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" />
                              {t('circulation.item')}: {transaction.item_barcode}
                            </div>
                            {transaction.user_barcode && (
                              <div className="text-gray-600 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                {t('circulation.user')}: {transaction.user_name || transaction.user_barcode}
                              </div>
                            )}
                            {transaction.due_date && (
                              <div className="text-gray-600 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {t('circulation.due')}: {new Date(transaction.due_date).toLocaleDateString()}
                              </div>
                            )}
                            {transaction.was_overdue && (
                              <div className="text-red-600 font-medium flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {t('circulation.overdueFine')}: ${transaction.fine_amount?.toFixed(2) || '0.00'}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CheckOutCheckIn
