import React, { useState } from 'react';
import Inventory from './Inventory';
import Holdings from './inventory/Holdings';
import Items from './inventory/Items';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Package, Database, Box, Layers } from 'lucide-react';

type TabType = 'instances' | 'holdings' | 'items';

const InventoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('instances');
  const { t } = useLanguage();

  const tabs = [
    {
      value: 'instances',
      label: t('inventory.tabs.instances'),
      icon: Database,
      description: t('inventory.tabs.instances.desc') || 'Bibliographic records and catalog entries'
    },
    {
      value: 'holdings',
      label: t('inventory.tabs.holdings'),
      icon: Package,
      description: t('inventory.tabs.holdings.desc') || 'Location and availability information'
    },
    {
      value: 'items',
      label: t('inventory.tabs.items'),
      icon: Box,
      description: t('inventory.tabs.items.desc') || 'Physical item records and circulation status'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <Layers className="w-8 h-8 text-white" />
            </div>
            {t('inventory.hub.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('inventory.hub.subtitle') || 'Manage instances, holdings, and item records'}</p>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          className="w-full"
        >
          {/* Enhanced Tabs List with Icons */}
          <TabsList className="grid w-full grid-cols-3 gap-4 bg-transparent h-auto p-0 mb-6">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 border-2 ${
                        isActive
                          ? 'border-green-500 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-start">
                            <h3
                              className={`font-semibold ${
                                isActive ? 'text-green-700' : 'text-gray-700'
                              }`}
                            >
                              {tab.label}
                            </h3>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-start ps-12">
                          {tab.description}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content with Animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="instances" className="mt-0">
                <Inventory />
              </TabsContent>

              <TabsContent value="holdings" className="mt-0">
                <Holdings />
              </TabsContent>

              <TabsContent value="items" className="mt-0">
                <Items />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default InventoryHub;
