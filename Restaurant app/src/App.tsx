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
    'default' | 'bestseller' | 'all' | 'quick-bites' | 'beverages'
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
        />
      )}

      {step === 'menu' && selectedCategory === 'Breakfast' && (
        <BreakfastDetails
          key={`${selectedCategory}-${selectedFoodType}-${menuEntryPoint}`}
          category={selectedCategory}
          userName={userData.name}
          foodType={selectedFoodType}
          tableNumber={userData.table}
          initialFocus={menuEntryPoint}
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
          initialFocus={menuEntryPoint}
          onBack={() => setStep('home')}
        />
      )}
    </div>
  );
};

export default App;
