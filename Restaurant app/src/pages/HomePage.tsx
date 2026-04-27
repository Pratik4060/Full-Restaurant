import React, { useEffect, useMemo, useState, useCallback } from 'react';
import lunch from '../assets/lunch.svg';
import Breakfast from '../assets/Breakfast.svg';
import Dinner1 from '../assets/Dinner1.svg';
import sandwhich from '../assets/sandwhich.svg';
import bite from '../assets/bite.svg';
import combo from '../assets/combo.svg';
import freeadd from '../assets/freeadd.svg';
import nonevegBreakfast from '../assets/Breakfast/Non-veg/Breakfast.svg';
import Lunch from '../assets/Breakfast/Non-veg/Lunch.svg';
import Dinner from '../assets/Breakfast/Non-veg/Dinner.svg';
import type { FoodType, MealCategory } from '../types';
import { BreakfastItems } from '../components/Breakfast/Data';
import { LunchItems } from '../components/Lunch/Data';
import ItemDetailPage from '../components/ItemDetailsPage';
import HomeInfoModal from '../components/home/HomeInfoModal';
import HomeMealHero from '../components/home/HomeMealHero';
import HomeOfferCarousel from '../components/home/HomeOfferCarousel';
import HomeSearchPanel from '../components/home/HomeSearchPanel';
import type { HomeOffer, HomeSearchItem } from '../components/home/types';
import { useRestaurantCatalog } from '../hooks/useRestaurantCatalog';
import { mapOffersToHomeOffers, mapPublicBreakfastItems, mapPublicLunchItems } from '../lib/catalog';

interface HomePageProps {
  foodType: FoodType;
  onFoodTypeChange: (type: FoodType) => void;
  onSelect: (cat: MealCategory) => void;
  onMostPopularSelect: (cat: MealCategory) => void;
  onOfferSelect: (target: {
    category: MealCategory;
    focus: 'all' | 'quick-bites' | 'beverages';
  }) => void;
}

const OFFERS: HomeOffer[] = [
  {
    title: 'Flat Discount',
    desc: 'Get 20% OFF on your total bill. Valid on orders above Rs. 299',
    img: sandwhich,
    gradient: 'linear-gradient(117.14deg, #785641 5.65%, #5F0404 96.69%)',
  },
  {
    title: 'Combo Offer',
    desc: 'Buy 1 Get 1 Free on Breakfast items. Limited time only.',
    img: combo,
    gradient: 'linear-gradient(114.35deg, #2A460D 0.77%, #666666 97.98%)',
  },
  {
    title: 'Quick Bite Deal',
    desc: 'Flat Rs. 50 OFF on Quick Bites. On orders above Rs. 199',
    img: bite,
    gradient: 'linear-gradient(115.74deg, #970808 4.97%, #053F62 100%)',
  },
  {
    title: 'Free Add-on',
    desc: 'Free Fresh Juice on orders above Rs. 399. Auto applied at checkout',
    img: freeadd,
    gradient: 'linear-gradient(115.68deg, #446B83 1.81%, #116848 100%)',
  },
];

const VEG_MEAL_DATA: { category: MealCategory; img: string; background: string }[] = [
  { category: 'Breakfast', img: Breakfast, background: 'linear-gradient(160.72deg, rgba(184, 194, 177, 0.2) 31.81%, rgba(59, 105, 6, 0.2) 62.84%, rgba(181, 113, 22, 0.2) 95.75%)' },
  { category: 'Lunch', img: lunch, background: 'linear-gradient(147.71deg, #FCD9AB 37.7%, #D7F8CF 96.96%)' },
  { category: 'Dinner', img: Dinner1, background: 'linear-gradient(160.23deg, #FFFFFF 31.02%, #FFB69D 97.96%)' },
];

const NON_VEG_MEAL_DATA: { category: MealCategory; img: string; background: string }[] = [
  { category: 'Breakfast', img: nonevegBreakfast, background: 'linear-gradient(160.72deg, rgba(184, 194, 177, 0.2), rgba(255, 255, 255, 1))' },
  { category: 'Lunch', img: Lunch, background: 'linear-gradient(147.71deg, #FCD9AB 37.7%, #D7F8CF 96.96%)' },
  { category: 'Dinner', img: Dinner, background: 'linear-gradient(160.23deg, #FFFFFF 31.02%, #FFB69D 97.96%)' },
];

const getInitialMealIndex = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 0;
  if (hour >= 12 && hour < 17) return 1;
  return 2;
};

const HomePage: React.FC<HomePageProps> = ({
  foodType,
  onFoodTypeChange,
  onSelect,
  onMostPopularSelect,
  onOfferSelect,
}) => {
  const { menuItems, offers } = useRestaurantCatalog();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchItem, setSelectedSearchItem] = useState<HomeSearchItem | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentMealIdx, setCurrentMealIdx] = useState(getInitialMealIndex);
  const [isListening, setIsListening] = useState(false);

  const activeMealData = foodType === 'Veg' ? VEG_MEAL_DATA : NON_VEG_MEAL_DATA;
  const currentMeal = activeMealData[currentMealIdx];
  const publicBreakfastItems = useMemo(() => mapPublicBreakfastItems(menuItems), [menuItems]);
  const publicLunchItems = useMemo(() => mapPublicLunchItems(menuItems, "Lunch"), [menuItems]);
  const mergedOffers = useMemo(() => mapOffersToHomeOffers(offers, OFFERS), [offers]);

  const allSearchItems = useMemo<HomeSearchItem[]>(
    () => [
      ...BreakfastItems.map((item) => ({ ...item, source: 'Breakfast' as const })),
      ...LunchItems.map((item) => ({ ...item, source: 'Lunch' as const })),
      ...publicBreakfastItems.map((item) => ({ ...item, source: 'Breakfast' as const })),
      ...publicLunchItems.map((item) => ({ ...item, source: 'Lunch' as const })),
    ],
    [publicBreakfastItems, publicLunchItems],
  );

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return allSearchItems.filter((item) => {
      const text = `${item.name} ${item.description}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [allSearchItems, searchQuery]);

  // VOICE SEARCH LOGIC
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentOffer((prev) => (prev + 1) % OFFERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentMealIdx((prev) => (prev + 1) % activeMealData.length), 5000);
    return () => clearInterval(timer);
  }, [activeMealData.length]);

  const handleOfferOrderNow = () => {
    const offerTitle = OFFERS[currentOffer].title;
    const selectedOfferTitle = mergedOffers[currentOffer]?.title ?? offerTitle;
    if (selectedOfferTitle === 'Flat Discount') return onOfferSelect({ category: currentMeal.category, focus: 'all' });
    if (selectedOfferTitle === 'Combo Offer') return onOfferSelect({ category: 'Breakfast', focus: 'all' });
    if (selectedOfferTitle === 'Quick Bite Deal') return onOfferSelect({ category: 'Breakfast', focus: 'quick-bites' });
    onOfferSelect({ category: currentMeal.category, focus: 'beverages' });
  };

  if (selectedSearchItem) {
    return (
      <ItemDetailPage
        item={{
          id: selectedSearchItem.id,
          menuItemId: selectedSearchItem.menuItemId,
          name: selectedSearchItem.name,
          price: selectedSearchItem.price,
          description: selectedSearchItem.description,
          image: selectedSearchItem.image,
          rating: 4.5,
          time: '15-20 Min',
          isVeg: selectedSearchItem.foodType !== 'Non Veg',
          category: selectedSearchItem.source,
          mealType: selectedSearchItem.mealType ?? selectedSearchItem.source,
          subCategory: selectedSearchItem.subCategory,
          foodType: selectedSearchItem.foodType,
          isBestseller: selectedSearchItem.isBestseller,
        }}
        onBack={() => setSelectedSearchItem(null)}
        onNavigateToMenu={() => setSelectedSearchItem(null)}
        onNavigateToOrders={() => setSelectedSearchItem(null)}
      />
    );
  }

  return (
  <div className="w-full min-h-screen bg-[#F8F8F8]">
      {showInfoModal && <HomeInfoModal onClose={() => setShowInfoModal(false)} />}

      <div className="mx-auto max-w-[1100px] overflow-hidden">
        <HomeOfferCarousel
          offers={mergedOffers}
          currentOffer={currentOffer}
          onOfferChange={setCurrentOffer}
          onInfoOpen={() => setShowInfoModal(true)}
          onOrderNow={handleOfferOrderNow}
        >
          <HomeSearchPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchResults={searchResults}
            onSelectItem={setSelectedSearchItem}
            isListening={isListening}
            onVoiceClick={startVoiceSearch}
          />
        </HomeOfferCarousel>

        <HomeMealHero
          foodType={foodType}
          currentMeal={currentMeal}
          onFoodTypeChange={(type) => { setCurrentMealIdx(0); onFoodTypeChange(type); }}
          onMostPopularSelect={onMostPopularSelect}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
};

export default HomePage;