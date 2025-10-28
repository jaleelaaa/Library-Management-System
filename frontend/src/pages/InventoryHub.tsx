import React, { useState } from 'react';
import Inventory from './Inventory';
import Holdings from './inventory/Holdings';
import Items from './inventory/Items';

type TabType = 'instances' | 'holdings' | 'items';

const InventoryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('instances');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-600 mt-2">Manage your library's catalog, holdings, and items</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('instances')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'instances'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Instances
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'holdings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Holdings
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Items
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'instances' && <Inventory />}
        {activeTab === 'holdings' && <Holdings />}
        {activeTab === 'items' && <Items />}
      </div>
    </div>
  );
};

export default InventoryHub;
