import React, { useState } from 'react';
// Added Heart to the imports from lucide-react
import { Star, Minus, Plus, Heart } from 'lucide-react'; 
import { useOrder } from '../contexts/OrderContext';
import BottomNav from './BottomNav';
import Ruppes from '../assets/Ruppes.svg';
import back from '../assets/back.svg';
import alarm from '../assets/alarm-clock 1.svg';
import bell1 from '../assets/bell1.svg';
import blackorder from '../assets/BlackOrder.svg';
import { restaurantApi } from '../services/restaurantApi';
// import heart from '../assets/heart.svg'; // We can comment this out and use the Lucide icon for better control

interface ItemDetailPageProps {
  item: {
    id: string | number;
    menuItemId?: string;
    name: string;
    price: number;
    rating?: number;
    description?: string;
    time?: string;
    image?: string;
    category?: string;
    isVeg?: boolean;
    isSpicy?: boolean;
    calories?: string;
    mealType?: "Breakfast" | "Lunch" | "Dinner";
    subCategory?: string;
    foodType?: "Veg" | "Non Veg";
    isBestseller?: boolean;
  };
  onBack: () => void;
  onNavigateToMenu?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToTracking?: () => Promise<void>;
}

const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  onBack,
  onNavigateToMenu,
  onNavigateToOrders,
  onNavigateToTracking,
}) => {
  const { addToOrder, updateQuantity, getItemQuantity } = useOrder();
  const [draftQuantity, setDraftQuantity] = useState(1);
  
  // 1. Added state for the Like button
  const [isLiked, setIsLiked] = useState(false);

  const currentQuantity = getItemQuantity(item.id);
  const quantity = currentQuantity > 0 ? currentQuantity : draftQuantity;

  const handleNavChange = async (view: 'menu' | 'orders' | 'track' | 'bill') => {
    if (view === 'menu') {
      if (onNavigateToMenu) {
        onNavigateToMenu();
      } else {
        onBack();
      }
    } else if (view === 'orders') {
      onNavigateToOrders?.();
    } else if (view === 'track') {
      try {
        await onNavigateToTracking?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to place order right now.';
        window.alert(message);
      }
    }
  };

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment') {
      const newQuantity = quantity + 1;
      if (currentQuantity > 0) {
        updateQuantity(item.id, newQuantity);
      } else {
        setDraftQuantity(newQuantity);
      }
      return;
    }

    if (quantity > 1) {
      const newQuantity = quantity - 1;
      if (currentQuantity > 0) {
        updateQuantity(item.id, newQuantity);
      } else {
        setDraftQuantity(newQuantity);
      }
      return;
    }

    if (currentQuantity > 0) {
      updateQuantity(item.id, 0);
    }
  };

  const handleAddToOrder = () => {
    if (currentQuantity > 0) {
      updateQuantity(item.id, quantity);
    } else {
      addToOrder({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        image: item.image || '',
        menuItemId: item.menuItemId,
        description: item.description,
        category: item.category,
        subCategory: item.subCategory,
        mealType: item.mealType,
        foodType: item.foodType,
        isBestseller: item.isBestseller,
      });
    }

    onNavigateToOrders?.();
  };

  const isAdded = currentQuantity > 0;

  return (
    <div className="montserrat min-h-screen bg-white flex flex-col">
      <div className="px-2 pt-9 pb-2 flex justify-between">
        <button onClick={onBack} className="text-2xl font-medium">
          <img src={back} alt="back" />
        </button>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <div className="flex gap-4 items-center">
              
              {/* 2. Updated Heart Button Logic */}
              <button 
                type="button" 
                onClick={async () => {
                  setIsLiked((prev) => !prev);
                  try {
                    await restaurantApi.likeMenuItem({
                      menuItemId: item.menuItemId,
                      name: item.name,
                      description: item.description || "Restaurant menu item",
                      imageUrl: item.image,
                      price: item.price,
                      type:
                        item.mealType === "Breakfast"
                          ? "BREAKFAST"
                          : item.mealType === "Dinner"
                            ? "DINNER"
                            : "LUNCH",
                      category: item.category || "All",
                      subCategory: item.subCategory,
                      diet:
                        item.foodType === "Non Veg"
                          ? "NON_VEG"
                          : item.category === "Beverages"
                            ? "BEVERAGE"
                            : "VEG",
                      isBestseller: item.isBestseller,
                    });
                  } catch {
                    // Keep the like interaction responsive even if the network fails.
                  }
                }}
                className="transition-transform active:scale-125 duration-200"
              >
                <Heart 
                  size={24} 
                  className={`transition-colors duration-300 ${
                    isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                  }`} 
                />
              </button>

              <button type="button">
                <img src={bell1} alt="notifications" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <h1 className="text-[24px] font-bold border-b-4 border-orange-400 pb-1">
          {item.name}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 mt-4 mb-4 flex justify-center">
          <div className="w-80 h-80 rounded-xl overflow-hidden bg-gray-100">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <span className="text-lg font-semibold text-orange-700">No image</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center border border-yellow-500 w-45 gap-2 px-4 py-2 rounded-[14px] font-semibold">
            <span>Price:</span>
            <img src={Ruppes} alt="Rs." className="w-4 h-4" />
            <span className="text-xl">{item.price}</span>
          </div>
        </div>

        <div className="flex justify-end">
          {item.rating && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg mr-4">
              <Star className="text-yellow-400" fill="#facc15" />
              <span className="text-[18px] font-medium">{item.rating}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          {item.description && (
            <div className="px-5 mb-4">
              <p className="text-gray-600 leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex mt-15 justify-between items-center px-5 mb-6">
          {item.time && (
            <div className="flex items-center gap-2 text-black">
              <img src={alarm} alt="alarm" />
              <span className="text-md font-semibold">Time: {item.time}</span>
            </div>
          )}

          <div
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-2 bg-white rounded-sm px-3 border border-gray-200 w-40 h-10 justify-between"
          >
            <button
              type="button"
              onClick={() => handleQuantityChange('decrement')}
              className="text-black w-6 h-6 flex items-center justify-center bg-white rounded"
              disabled={quantity <= 0}
            >
              <Minus />
            </button>

            <span className="text-black text-sm font-semibold min-w-[20px]">
              {quantity.toString().padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={() => handleQuantityChange('increment')}
              className="text-black w-6 h-6 flex items-center justify-center bg-orange-300 rounded"
            >
              <Plus />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-gray-200 px-5 py-3 shadow-lg">
        <button
          type="button"
          onClick={handleAddToOrder}
          className="w-full bg-[linear-gradient(119.95deg,#BEA178_9.89%,#56390F_97.57%)] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <span>{isAdded ? 'Add to Order' : 'Add to Order'}</span>
          <img
            src={blackorder}
            alt="order"
            className="w-5 h-5 brightness-0 invert"
          />
        </button>
      </div>

      <BottomNav activeView="menu" onViewChange={handleNavChange} />
    </div>
  );
};

export default ItemDetailPage;
