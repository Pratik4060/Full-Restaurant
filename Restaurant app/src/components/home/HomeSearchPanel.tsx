import React from "react";
import { Search } from "lucide-react";
import type { HomeSearchItem } from "./types";
import voice from '../../assets/Voice.svg';

interface HomeSearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: HomeSearchItem[];
  onSelectItem: (item: HomeSearchItem) => void;
  isListening: boolean; // New prop
  onVoiceClick: () => void; // New prop
}

const getItemFoodType = (item: HomeSearchItem) =>
  item.foodType ?? (item.category === "Health" ? item.subCategory : "Veg");

const renderSearchResult = (
  item: HomeSearchItem,
  onSelectItem: (item: HomeSearchItem) => void,
) => (
  <button
    key={`${item.source}-${item.id}`}
    type="button"
    onClick={() => onSelectItem(item)}
    className="w-full rounded-xl bg-white px-3 py-2 text-left shadow-sm hover:bg-orange-50 transition-colors"
  >
    <div className="flex items-center gap-3">
      <img
        src={item.image}
        alt={item.name}
        className="h-14 w-14 rounded-xl bg-gray-100 object-cover"
      />
      <div className="flex flex-1 items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
          <p className="line-clamp-2 text-xs text-gray-500">{item.description}</p>
          <p className="mt-1 text-sm font-semibold text-orange-500">Rs. {item.price}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
            getItemFoodType(item) === "Veg"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.source}
        </span>
      </div>
    </div>
  </button>
);

const HomeSearchPanel: React.FC<HomeSearchPanelProps> = ({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectItem,
  isListening,
  onVoiceClick,
}) => {
  const vegResults = searchResults.filter((item) => getItemFoodType(item) === "Veg");
  const nonVegResults = searchResults.filter((item) => getItemFoodType(item) === "Non Veg");

  return (
<div className="mb-6 md:mb-8 w-full max-w-full md:max-w-2xl mx-auto rounded-xl bg-white px-4 py-3 shadow-md border">      <div className="flex items-center">
        <Search className="mr-2 h-7 w-7 text-gray-400" />
        <input
          className="w-full bg-transparent text-sm text-[#2a211b] outline-none"
          placeholder={isListening ? "Listening..." : "Search veg and non-veg dishes"}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
        
        {/* Voice Button */}
        <button 
          type="button"
          onClick={onVoiceClick}
          className={`relative ml-2 p-2 rounded-full transition-all ${isListening ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
          title="Voice Search"
          aria-label="Voice search"
        >
          <img 
            src={voice} 
            alt="voice" 
            className={`h-5 w-5 ${isListening ? 'animate-bounce' : 'opacity-60'}`} 
          />
          {isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping" />
          )}
        </button>
      </div>

      {searchQuery.trim() && (
        <div className="mt-4 max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-[#fffaf3] p-3">
          {searchResults.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No items found</p>
          ) : (
            <div className="space-y-4">
              {vegResults.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-green-600">Veg</p>
                  <div className="space-y-2">
                    {vegResults.map((item) => renderSearchResult(item, onSelectItem))}
                  </div>
                </div>
              )}
              {nonVegResults.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">Non Veg</p>
                  <div className="space-y-2">
                    {nonVegResults.map((item) => renderSearchResult(item, onSelectItem))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearchPanel;
