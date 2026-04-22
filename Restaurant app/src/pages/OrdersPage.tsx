// OrdersPage.tsx
import React, { useState } from 'react';
import { useOrder } from '../contexts/OrderContext';
import OrderCard from '../components/Ordercard';
import BottomNav from '../components/BottomNav';
import back from "../assets/back.svg";
import search from "../assets/search.svg";
import microphone from "../assets/microphone.svg";
import Ruppes from '../assets/Ruppes.svg';
import bell1 from '../assets/bell1.svg'

interface OrderPageProps {
  onBack: () => void;
  onConfirmOrder: () => Promise<void>;
  onViewChange: (view: 'menu' | 'orders' | 'track' | 'bill') => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ onBack, onConfirmOrder, onViewChange }) => {
  const { orderItems, updateQuantity, removeItem, getTotalPrice } = useOrder();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter order items based on search query
  const filteredOrderItems = orderItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleIncrement = (id: string | number) => {
    const item = orderItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const handleDecrement = (id: string | number) => {
    const item = orderItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeItem(id);
    }
  };

  const handleRemove = (id: string | number) => {
    removeItem(id);
  };

  const handleConfirmClick = async () => {
    try {
      await onConfirmOrder();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place order right now.';
      window.alert(message);
    }
  };

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white z-10">
          <div className="px-2 pt-9 pb-2 flex justify-between">
            <button onClick={onBack}>
              <img src={back} alt="back" />
            </button>
            <div className="flex gap-3">
              <div className="relative">
                <button className="text-xl">
                  <img src={bell1} alt="bell" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <h1 className="text-[24px] font-bold border-b-4 border-orange-400 pb-1">
              My Order
            </h1>
          </div>

          <div className="px-5 py-3">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <img src={search} alt="search" className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your order"
                className="w-full border-b py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-orange-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <img src={microphone} alt="microphone" className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 flex items-center justify-center pb-20">
          <p className="text-gray-400">Your order is empty</p>
        </div>

        {/* Fixed BottomNav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white z-10">
          <BottomNav activeView="orders" onViewChange={onViewChange} />
        </div>
      </div>
    );
  }

  // Calculate total height of fixed footer sections
  const priceSectionHeight = 280; // Approximate height of price section in pixels
  const bottomNavHeight = 70; // Approximate height of BottomNav

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header Section - Everything above items count */}
      <div className="fixed top-0 left-0 right-0 bg-white z-20">
        <div className="px-2 pt-9 pb-2 flex justify-between">
          <button onClick={onBack}>
            <img src={back} alt="back" />
          </button>
          <div className="flex gap-3">
            <div className="relative">
              <button className="text-xl">
                <img src={bell1} alt="bell" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <h1 className="text-[24px] montserrat font-bold border-b-4 border-orange-400 pb-1">
            My Order
          </h1>
        </div>

        <div className="px-5 py-3">
          <div className="relative w-full bg-white rounded-md border-b-1 border-gray-300">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img src={search} alt="search" className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your order..."
              className="w-full montserrat py-3 pl-10 pr-10 text-sm focus:outline-none placeholder:text-gray-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <img src={microphone} alt="microphone" className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="px-7 pb-6">
          <div className="flex justify-center">
            <span className="montserrat text-md text-black font-semibold">
              {filteredOrderItems.length} {filteredOrderItems.length === 1 ? 'item' : 'items'}
              {searchQuery && ` found for "${searchQuery}"`}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Order Cards Section - with padding for fixed header and footer */}
      <div 
        className="overflow-y-auto px-5"
        style={{
          height: '100vh',
          paddingTop: '240px', // Space for fixed header
          paddingBottom: `${priceSectionHeight + bottomNavHeight}px`, // Space for both footer sections
        }}
      >
        {filteredOrderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-400 text-center">
              No items found matching "{searchQuery}"
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-orange-500 underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredOrderItems.map((item) => (
            <OrderCard
              key={item.id}
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
              variant="default"
              searchQuery={searchQuery}
              showRemoveButton={true}
            />
          ))
        )}
      </div>

      {/* Fixed Footer with GST and Total calculation - Only show if there are items */}
      {filteredOrderItems.length > 0 && (
        <>
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t-1 border-orange-400 rounded-t-[40px] px-10 py-6 z-20 shadow-lg">
            {/* GST Section */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 font-medium text-lg">GST(5) %</span>
              <div className="flex items-center gap-1 text-gray-400">
                <img src={Ruppes} alt="₹" className="w-4 h-4 opacity-40" />
                <span className="text-xl font-medium">
                  {(getTotalPrice() * 0.05).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-black text-xl">Total</span>
              <div className="flex items-center gap-1 text-black">
                <img src={Ruppes} alt="₹" className="w-5 h-5" />
                <span className="text-2xl">
                  {(getTotalPrice() * 1.05).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Confirm Order Button */}
            <button
              onClick={handleConfirmClick}
              className="w-full bg-[linear-gradient(90deg,#BC9F76_0%,#64471E_100%)] text-white py-4 rounded-xl font-semibold text-xl"
            >
              Confirm Order
            </button>
          </div>

          {/* Fixed BottomNav */}
          <div className="fixed bottom-0 left-0 right-0 bg-white z-20 shadow-top">
            <BottomNav activeView="orders" onViewChange={onViewChange} />
          </div>
        </>
      )}
    </div>
  );
};

export default OrderPage;
