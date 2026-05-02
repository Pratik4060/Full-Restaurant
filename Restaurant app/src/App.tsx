import React, { useEffect, useState } from 'react';
import QRScanner from './pages/QRScanner';
import LoadingAnim from './pages/LoadingAnim';
import DetailsForm from './pages/DetailsForm';
import Home from './pages/HomePage';
import BreakfastDetails from './pages/BreakfastDetails';
import LunchMenuDetails from './pages/LunchMenuDetails';
import BillPage from './pages/BillPage';
import TrackOrderPage from './pages/OrderTrackingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import type { AppStep, UserData, MealCategory, FoodType } from './types';
import { useOrder } from './contexts/OrderContext';
import type { HomeSearchItem } from './components/home/types';
import type { BreakfastTab } from './components/Breakfast/Data';
import type { LunchTab } from './components/Lunch/Data';

const getTableNumberFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const rawTable = params.get('table') ?? '';
  const digits = rawTable.replace(/\D/g, '');
  return digits || '12';
};

const App: React.FC = () => {
  const { clearOrder, resetPlacedOrder, markOrderPaid } = useOrder();
  const params = new URLSearchParams(window.location.search);

  const isPaymentSuccess = params.get('payment') === 'success';
  const paymentOrderNumber = params.get('order') || '1234';
  const paymentView = params.get('view');
  const isQrEntry = params.has('table');

  const tableNumber = getTableNumberFromUrl();
  const [step, setStep] = useState<AppStep>(
    isQrEntry ? 'loading' : 'scanner'
  );

  const [userData, setUserData] = useState<UserData>({
    name: '',
    mobile: '',
    guests: '1',
    table: tableNumber,
  });

  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('Breakfast');
  const [selectedFoodType, setSelectedFoodType] = useState<FoodType>('Veg');
  const [menuEntryPoint, setMenuEntryPoint] = useState<
    | 'default'
    | 'all'
    | 'bestseller'
    | 'quick-bites'
    | 'beverages'
    | BreakfastTab
    | LunchTab
  >('default');

  useEffect(() => {
    if (step === 'loading') {
      const timer = setTimeout(() => setStep('form'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (!isPaymentSuccess) return;
    markOrderPaid(paymentOrderNumber);
  }, [isPaymentSuccess, markOrderPaid, paymentOrderNumber]);

  const handleFormSubmit = async (data: UserData): Promise<void> => {
    window.localStorage.setItem('restaurant-user-data', JSON.stringify(data));
    setUserData(data);
    setStep('home');
  };

  const resolveSearchFocus = (item: HomeSearchItem): typeof menuEntryPoint => {
    if (item.source === 'Breakfast') {
      if (
        item.category === 'Bestseller' ||
        item.category === 'Beverages' ||
        item.category === 'Health' ||
        item.category === 'Quick Bites' ||
        item.category === 'All'
      ) {
        return item.category;
      }
      return 'all';
    }

    if (
      item.category === 'Bestseller' ||
      item.category === 'Beverages' ||
      item.category === 'Dessert' ||
      item.category === 'Main Course' ||
      item.category === 'Appetizer' ||
      item.category === 'Roti' ||
        item.category === 'Rice' ||
        item.category === 'All'
    ) {
      return item.category;
    }

    return 'all';
  };

  const handleSearchSelect = (item: HomeSearchItem) => {
    const category = item.mealType ?? item.source;
    setSelectedCategory(category);
    setSelectedFoodType(item.foodType ?? selectedFoodType);
    setMenuEntryPoint(resolveSearchFocus(item));
    setStep('menu');
  };

  const resolveBreakfastInitialFocus = (
    focus: typeof menuEntryPoint
  ): BreakfastTab | "default" | "quick-bites" | "beverages" | "bestseller" => {
    switch (focus) {
      case "All":
      case "all":
      case "default":
        return "default";
      case "Bestseller":
      case "bestseller":
        return "Bestseller";
      case "Beverages":
      case "beverages":
        return "Beverages";
      case "Health":
        return "Health";
      case "Quick Bites":
      case "quick-bites":
        return "Quick Bites";
      default:
        return "default";
    }
  };

  const resolveLunchInitialFocus = (
    focus: typeof menuEntryPoint
  ): LunchTab | "default" | "beverages" | "bestseller" => {
    switch (focus) {
      case "All":
      case "all":
      case "default":
        return "default";
      case "Bestseller":
      case "bestseller":
        return "Bestseller";
      case "Beverages":
      case "beverages":
        return "Beverages";
      case "Main Course":
      case "Appetizer":
      case "Roti":
      case "Rice":
      case "Dessert":
        return focus;
      default:
        return "default";
    }
  };

  const onScanSuccess = (): void => setStep('loading');

  if (isPaymentSuccess) {
    const handlePaymentSuccessNav = (view: "menu" | "orders" | "track" | "bill") => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set("payment", "success");
      nextParams.set("order", paymentOrderNumber);
      nextParams.set("view", view);
      window.location.search = nextParams.toString();
    };

    if (paymentView === "track") {
      return (
        <TrackOrderPage
          onBack={() => handlePaymentSuccessNav("bill")}
          onViewChange={handlePaymentSuccessNav}
          orderPlaced={true}
          orderNumber={paymentOrderNumber}
          estimatedTime="15-20"
        />
      );
    }

    if (paymentView === "bill") {
      return (
        <BillPage
          onBack={() => {
            const nextParams = new URLSearchParams(window.location.search);
            nextParams.set("payment", "success");
            nextParams.delete("view");
            nextParams.set("order", paymentOrderNumber);
            window.location.search = nextParams.toString();
          }}
          onViewChange={handlePaymentSuccessNav}
          orderPlaced={true}
          tableNumber={userData.table}
          orderNumber={paymentOrderNumber}
        />
      );
    }

    return (
      <PaymentSuccessPage
        orderNumber={paymentOrderNumber}
        tableNumber={userData.table}
        onBack={() => {
          clearOrder();
          resetPlacedOrder();
          window.location.href = `/?table=${encodeURIComponent(tableNumber)}`;
        }}
        onViewChange={handlePaymentSuccessNav}
      />
    );
  }


  return (
    <div className="min-h-screen w-full">
      {step === 'scanner' && <QRScanner onScan={onScanSuccess} />}
      {step === 'loading' && <LoadingAnim />}
      {step === 'form' && (
        <DetailsForm onSubmit={handleFormSubmit} tableNumber={tableNumber} />
      )}

      {step === 'home' && (
        <Home
          foodType={selectedFoodType}
          onFoodTypeChange={setSelectedFoodType}
          onSelect={(cat: MealCategory) => {
            clearOrder();
            resetPlacedOrder();
            setMenuEntryPoint('default');
            setSelectedCategory(cat);
            setStep('menu');
          }}
          onMostPopularSelect={(cat: MealCategory) => {
            clearOrder();
            resetPlacedOrder();
            setMenuEntryPoint('bestseller');
            setSelectedCategory(cat);
            setStep('menu');
          }}
          onOfferSelect={({ category, focus }) => {
            clearOrder();
            resetPlacedOrder();
            setMenuEntryPoint(focus);
            setSelectedCategory(category);
            setStep('menu');
          }}
          onSearchSelect={handleSearchSelect}
        />
      )}

      {step === 'menu' && selectedCategory === 'Breakfast' && (
        <BreakfastDetails
          key={`${selectedCategory}-${selectedFoodType}-${menuEntryPoint}`}
          category={selectedCategory}
          userName={userData.name}
          foodType={selectedFoodType}
          tableNumber={userData.table}
          initialFocus={resolveBreakfastInitialFocus(menuEntryPoint)}
          onBack={() => setStep('home')}
        />
      )}

      {step === 'menu' &&
        (selectedCategory === 'Lunch' || selectedCategory === 'Dinner') && (
        <LunchMenuDetails
          key={`${selectedCategory}-${selectedFoodType}-${menuEntryPoint}`}
          category={selectedCategory}
          userName={userData.name}
          foodType={selectedFoodType}
          tableNumber={userData.table}
          initialFocus={resolveLunchInitialFocus(menuEntryPoint)}
          onBack={() => setStep('home')}
        />
      )}
    </div>
  );
};

export default App;
