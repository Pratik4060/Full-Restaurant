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
import HomeInfoModal from '../components/home/HomeInfoModal';
import HomeMealHero from '../components/home/HomeMealHero';
import HomeOfferCarousel from '../components/home/HomeOfferCarousel';
import HomeSearchPanel from '../components/home/HomeSearchPanel';
import type { HomeSearchItem } from '../components/home/types';
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
  onSearchSelect: (item: HomeSearchItem) => void;
  onReadyOrderClick?: () => void;
}

const OFFER_FALLBACK_IMAGES = [sandwhich, combo, bite, freeadd];

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
  onSearchSelect,
  onReadyOrderClick,
}) => {
  const { menuItems, offers } = useRestaurantCatalog();
  const [currentOffer, setCurrentOffer] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentMealIdx, setCurrentMealIdx] = useState(getInitialMealIndex);
  const [isListening, setIsListening] = useState(false);

  const activeMealData = foodType === 'Veg' ? VEG_MEAL_DATA : NON_VEG_MEAL_DATA;
  const currentMeal = activeMealData[currentMealIdx];
  const publicBreakfastItems = useMemo(() => mapPublicBreakfastItems(menuItems), [menuItems]);
  const publicLunchItems = useMemo(() => mapPublicLunchItems(menuItems, "Lunch"), [menuItems]);
  const publicDinnerItems = useMemo(() => mapPublicLunchItems(menuItems, "Dinner"), [menuItems]);
  const mergedOffers = useMemo(() => mapOffersToHomeOffers(offers, OFFER_FALLBACK_IMAGES), [offers]);
  const activeOfferIndex = mergedOffers.length > 0 ? currentOffer % mergedOffers.length : 0;
  const activeOffer = mergedOffers[activeOfferIndex] ?? null;

  const allSearchItems = useMemo<HomeSearchItem[]>(
    () => {
      const seen = new Map<string | number, HomeSearchItem>();

      for (const item of publicBreakfastItems.map((entry) => ({ ...entry, source: 'Breakfast' as const }))) {
        if (!seen.has(item.menuItemId ?? item.id)) {
          seen.set(item.menuItemId ?? item.id, item);
        }
      }

      for (const item of publicLunchItems.map((entry) => ({ ...entry, source: 'Lunch' as const }))) {
        if (!seen.has(item.menuItemId ?? item.id)) {
          seen.set(item.menuItemId ?? item.id, item);
        }
      }

      for (const item of publicDinnerItems.map((entry) => ({ ...entry, source: 'Dinner' as const }))) {
        if (!seen.has(item.menuItemId ?? item.id)) {
          seen.set(item.menuItemId ?? item.id, item);
        }
      }

      return [...seen.values()];
    },
    [publicBreakfastItems, publicLunchItems, publicDinnerItems],
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
    const offerCount = mergedOffers.length;
    if (offerCount === 0) return;

    const timer = setInterval(
      () => setCurrentOffer((prev) => (prev + 1) % offerCount),
      4000,
    );
    return () => clearInterval(timer);
  }, [mergedOffers.length]);

  useEffect(() => {
    if (mergedOffers.length === 0) return;
    setCurrentOffer((prev) => prev % mergedOffers.length);
  }, [mergedOffers.length]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentMealIdx((prev) => (prev + 1) % activeMealData.length), 5000);
    return () => clearInterval(timer);
  }, [activeMealData.length]);

  const handleOfferOrderNow = () => {
    if (!activeOffer) return;

    const selectedOfferTitle = activeOffer.title;
    if (selectedOfferTitle === 'Flat Discount') return onOfferSelect({ category: currentMeal.category, focus: 'all' });
    if (selectedOfferTitle === 'Combo Offer') return onOfferSelect({ category: 'Breakfast', focus: 'all' });
    if (selectedOfferTitle === 'Quick Bite Deal') return onOfferSelect({ category: 'Breakfast', focus: 'quick-bites' });
    onOfferSelect({ category: currentMeal.category, focus: 'beverages' });
  };

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
          onReadyOrderClick={onReadyOrderClick}
        >
          <HomeSearchPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchResults={searchResults}
            onSelectItem={(item) => {
              setSearchQuery("");
              onSearchSelect(item);
            }}
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
