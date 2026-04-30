// MenuCard.tsx
import { useOrder } from '../contexts/OrderContext';
import order from '../assets/order.svg';
import Ruppes from '../assets/Ruppes.svg';

interface MenuCardItem {
  id: string | number;
  menuItemId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  subCategory?: string;
  mealType?: "Breakfast" | "Lunch" | "Dinner";
  foodType?: "Veg" | "Non Veg";
  isBestseller?: boolean;
}

interface Props<T extends MenuCardItem> {
  item: T;
  onItemClick?: (item: T) => void;
}

const MenuCard = <T extends MenuCardItem,>({ item, onItemClick }: Props<T>) => {
  const { addToOrder, updateQuantity, getItemQuantity } = useOrder();
  
  const quantity = getItemQuantity(item.id);
  const isAdded = quantity > 0;

  const handleAddToOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToOrder({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      description: item.description,
      category: item.category,
      subCategory: item.subCategory ?? undefined,
      mealType: item.mealType,
      foodType: item.foodType,
      isBestseller: item.isBestseller,
    });
  };

  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, quantity - 1);
  };

  return (
    <div 
      className="montserrat flex gap-3 rounded-xl bg-[#F7F7F7] border border-[#C9C9C9] overflow-hidden min-h-[130px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onItemClick && onItemClick(item)}
    >
      {/* Image section */}
      <div className="flex-shrink-0 p-3">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
          <img 
            src={item.image} 
            className="w-full h-full object-cover" 
            alt={item.name} 
          />
        </div>
      </div>
      
      {/* Content section */}
      <div className="flex flex-col justify-center flex-1 py-3 pr-3 min-w-0">
        <div>
          <h4 className="font-bold text-[16px] leading-tight truncate">
            {item.name}
          </h4>
          
          <p className="text-[11px] mt-1 text-gray-500 line-clamp-2 break-words">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-[15px] flex items-center gap-1 font-semibold">
            <img src={Ruppes} alt="₹" className="w-3.5 h-3.5" /> 
            {item.price}
          </span>
          
          {!isAdded ? (
            <button 
              onClick={handleAddToOrder}
              className="bg-black text-white px-3 py-1.5 rounded-md text-[10px] flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
            >
              Add To Order
              <img src={order} alt='order' className='h-3 w-3' />
            </button>
          ) : (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="  flex items-center gap-2 bg-[#F7F7F7] rounded-sm px-1 py-1 border border-gray-300 w-30  justify-between"
            >
              <button 
                onClick={decrement}
                className="text-black  w-6 h-6 flex items-center justify-center bg-white rounded "
              >
                −
              </button>

              <span className="  text-black text-sm font-semibold min-w-[20px] ">
                {quantity.toString().padStart(2, '0')}
              </span>
              <button 
                onClick={increment}
                className="text-black  w-6 h-6 flex items-center justify-center bg-orange-300 rounded"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
