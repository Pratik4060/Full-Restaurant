import React, { useState ,useCallback} from "react";
import { useOrder } from "../contexts/OrderContext";
import type { MealCategory } from "../types";
import BottomNav from "../components/BottomNav";
import type { LunchItem, LunchTab } from "../components/Lunch/Data";
import type { BeverageTab } from "../components/Breakfast/Data";
import type { BreakfastItem } from "../components/Breakfast/Data";
import bell from "../assets/bell.svg";
import back from "../assets/back.svg";
import search from "../assets/search.svg";
import microphone from "../assets/microphone.svg";
import LunchList from "../components/Lunch/LunchList";
import OrderPage from "./OrdersPage";
import ItemDetailPage from "../components/ItemDetailsPage";
import TrackOrderPage from "./OrderTrackingPage";
import BillPage from "./BillPage";
import type { FoodType } from "../types";
import { useRestaurantCatalog } from '../hooks/useRestaurantCatalog';
import { mapPublicLunchItems } from '../lib/catalog';
interface Props {
  category: MealCategory;
  userName: string;
  foodType: FoodType;
  tableNumber: string;
  initialFocus?: "default" | "bestseller" | "all" | "quick-bites" | "beverages";
  onBack: () => void;
}

const LunchMenuDetails: React.FC<Props> = ({
  category,
  userName,
  onBack,
  foodType,
  tableNumber,
  initialFocus = "default",
}) => {
  const { orderPlaced, orderNumber, placeOrder } = useOrder();
  const { menuItems } = useRestaurantCatalog();
  const publicItems = mapPublicLunchItems(menuItems, category);

  const displayName = userName.trim() || "Rohit";
  const [activeTab, setActiveTab] = useState<LunchTab>(() => {
    if (initialFocus === "bestseller") return "Bestseller";
    if (initialFocus === "beverages") return "Beverages";
    return "All";
  });
  const [activeBeverageTab, setActiveBeverageTab] =
    useState<BeverageTab>("All");
  const [currentView, setCurrentView] = useState<
    "menu" | "orders" | "track" | "bill"
  >("menu");
  const [trackResetSignal, setTrackResetSignal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<
    LunchItem | BreakfastItem | null
  >(null);
  const [isListening, setIsListening] = useState(false);

  const beverageTabs: BeverageTab[] = [
    "All",
    "Mocktails",
    "Cocktails",
    "Spirits",
    "Beer",
    "Wine",
    "Hot Beverages",
    "Fresh Juice",
  ];

const vegTabs: LunchTab[] = [
  "All",
  "Main Course",
  "Starters",
  "Rice",
  "Bestseller",
  "Beverages",
  "Dessert",
];

const nonVegTabs: LunchTab[] = [
  "All",
  "Main Course",
  "Appetizer",
  "Rice",
  "Bestseller",
  "Beverages",
  "Dessert",
];

const tabs = foodType === "Non Veg" ? nonVegTabs : vegTabs;
const resolvedActiveTab =
  foodType === "Veg" && activeTab === "Appetizer" ? "All" : activeTab;

  const handleNavChange = (view: "menu" | "orders" | "track" | "bill") => {
    if (view === "track" && !orderPlaced) {
      setCurrentView("track");
      return;
    }

    if (view === "bill" && !orderPlaced) {
      setCurrentView("bill");
      return;
    }

    if (view === "track") {
      setTrackResetSignal((prev) => prev + 1);
    }

    setCurrentView(view);
    setSelectedItem(null);
  };

  const handleItemClick = (item: LunchItem | BreakfastItem) => {
    setSelectedItem(item);
  };

  const handleConfirmOrder = async () => {
    await placeOrder({ tableNumber });
    setTrackResetSignal((prev) => prev + 1);
    setCurrentView("track");
  };

  const handleTrackingFromDetail = async () => {
    await placeOrder({ tableNumber });
    setSelectedItem(null);
    setTrackResetSignal((prev) => prev + 1);
    setCurrentView("track");
  };
    const startVoiceSearch = useCallback(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Your browser does not support voice search. Please use Google Chrome.");
        return;
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
  
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
  
      recognition.start();
    }, []);

  if (selectedItem) {
    return (
      <ItemDetailPage
        item={{
          id: selectedItem.id,
          menuItemId: selectedItem.menuItemId,
          name: selectedItem.name,
          price: selectedItem.price,
          rating: 4.5,
          description:
            selectedItem.description ||
            "Delicious item prepared with fresh ingredients.",
          time: "15-20 Min",
          image: selectedItem.image,
          mealType: selectedItem.mealType ?? category,
          category: selectedItem.category,
          subCategory: selectedItem.subCategory,
          foodType: selectedItem.foodType,
          isBestseller: selectedItem.isBestseller,
        }}
        onBack={() => setSelectedItem(null)}
        onNavigateToMenu={() => {
          setSelectedItem(null);
          setCurrentView("menu");
        }}
        onNavigateToOrders={() => {
          setSelectedItem(null);
          setCurrentView("orders");
        }}
        onNavigateToTracking={handleTrackingFromDetail}
      />
    );
  }

  if (currentView === "orders") {
    return (
      <OrderPage
        onBack={() => setCurrentView("menu")}
        onConfirmOrder={handleConfirmOrder}
        onViewChange={handleNavChange}
      />
    );
  }

  if (currentView === "track") {
    return (
    <TrackOrderPage
      key={trackResetSignal}
      onBack={() => setCurrentView("menu")}
      onViewChange={handleNavChange}
      orderPlaced={orderPlaced}
      orderNumber={orderNumber}
      estimatedTime="15-20"
      onReadyComplete={() => setCurrentView("bill")}
    />
  );
  }

  if (currentView === "bill") {
    return (
      <BillPage
        onBack={() => setCurrentView("menu")}
        onViewChange={handleNavChange}
        orderPlaced={orderPlaced}
        tableNumber={tableNumber}
        orderNumber={orderNumber || "1234"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-2 pt-9 pb-2 flex justify-between">
        <button onClick={onBack} className="text-2xl font-medium">
          <img src={back} alt="back" />
        </button>
        <button>
          <img src={bell} className="invert h-8" alt="notifications" />
        </button>
      </div>

      <div className="flex justify-center">
        <h1 className="text-[24px] font-bold border-b-4 border-orange-400 pb-1">
          {category}
        </h1>
      </div>

      <div className="px-5 pt-4">
        <h3>
          <span className="font-semibold">Hi {displayName},</span>{" "}
          {category === "Dinner"
            ? "Time for a delicious dinner"
            : "Time for a delicious lunch"}
        </h3>
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
           placeholder={isListening ? "Listening..." : "Search dishes"}
            className="w-full border-b py-2 pl-10 pr-10 text-sm outline-none"
          />

          <button 
            onClick={startVoiceSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full overflow-hidden"
          >
            <img 
              src={microphone} 
              alt="microphone" 
              className={`w-4 h-4 transition-transform ${isListening ? 'scale-125 animate-bounce' : ''}`} 
            />
            {isListening && (
              <div className="absolute inset-0 bg-orange-200 animate-ping opacity-30 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      <div className="px-5">
        <div className="montserrat bg-[#FFF3D8] px-4 py-2 flex gap-10 overflow-x-auto scrollbar-hide rounded-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[14px] whitespace-nowrap transition-all pb-1 ${
                resolvedActiveTab === tab
                  ? "font-semibold border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Beverages" && (
        <div className="montserrat px-7 mt-3 flex gap-10 overflow-x-auto scrollbar-hide">
          {beverageTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveBeverageTab(tab as BeverageTab)}
              className={`pb-1 whitespace-nowrap ${
                activeBeverageTab === tab
                  ? "font-semibold border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 px-5 py-4 pb-28 overflow-y-auto">
        <LunchList
          items={publicItems}
          activeTab={resolvedActiveTab}
          activeBeverageTab={activeBeverageTab}
          foodType={foodType}
          searchQuery={searchQuery}
          onItemClick={handleItemClick}
        />
      </div>

      <BottomNav activeView={currentView} onViewChange={handleNavChange} />
    </div>
  );
};

export default LunchMenuDetails;
