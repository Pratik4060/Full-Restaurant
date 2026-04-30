import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import pizza from '../assets/pizza.svg';
import food from '../assets/food.svg';
import fish from '../assets/fish.svg';
import chicken from '../assets/chicken.svg';
import dinner from '../assets/dinner.svg';
import tea from '../assets/tea.svg';
import type { UserData } from '../types';
import milk from "../assets/milk.svg"
import drink from "../assets/drink.svg"
import smiley from "../assets/smiley.svg"

interface Props {
  onSubmit: (data: UserData) => void | Promise<void>;
  tableNumber: string;
}

const DetailsForm: React.FC<Props> = ({ onSubmit, tableNumber }) => {
  const guestOptions = useMemo(() => ['1', '2', '3', '4', '5', '6', '7'], []);
  const [formData, setFormData] = useState<UserData>({
    name: '',
    mobile: '',
    guests: '1',
    table: `${tableNumber}`,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [guestFocused, setGuestFocused] = useState(false);

  // Function to validate and clean name input (only letters and spaces)
  const validateAndCleanName = (value: string): string => {
    // Allow only letters (A-Z, a-z) and spaces
    let cleaned = value.replace(/[^A-Za-z\s]/g, '');
    
    
    // Trim leading/trailing spaces
    
    return cleaned;
  };

  const handleChange = (field: keyof UserData, value: string): void => {
    if (field === 'name') {
      // Clean the name input as user types
      const cleanedName = validateAndCleanName(value);
      setFormData((prev) => ({ ...prev, [field]: cleanedName }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof UserData, string>> = {};
    const trimmedName = formData.name.trim();
    const normalizedMobile = formData.mobile.replace(/\D/g, '');
    const guestsCount = Number(formData.guests);

    // Name validation - only letters and spaces
    if (trimmedName.length < 2) {
      nextErrors.name = 'Please enter at least 2 letters.';
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      nextErrors.name = 'Name can only contain letters and spaces.';
    }

    if (normalizedMobile.length < 10 || normalizedMobile.length > 10) {
      nextErrors.mobile = 'Please enter a valid mobile number.';
    } else if (/^(\d)\1{9}$/.test(normalizedMobile)) {
      nextErrors.mobile = 'Mobile number cannot have all digits the same.';
    }

    if (!formData.guests.trim()) {
      nextErrors.guests = 'Please enter the number of guests.';
    } else if (!Number.isInteger(guestsCount) || guestsCount < 1) {
      nextErrors.guests = 'Guests must be 1 or more.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    await onSubmit({
      ...formData,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      guests: formData.guests.trim(),
    });
  };

  const guestDisplayValue = guestFocused
    ? formData.guests
    : formData.guests
      ? `${formData.guests} Guests`
      : '';

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Icons - Sizes scaled up for Tablet */}
      <div className="absolute inset-0 opacity-[1.5] text-[#8f8b84] pointer-events-none">
        <img src={pizza} alt="pizza" className="absolute top-[%] h-38 w-38 object-contain" />
        <img src={food} alt="food" className="absolute right-[3%] top-[1%] h-28 w-28 md:h-40 md:w-40 object-contain" />
        <img src={fish} alt="fish" className="absolute right-[2%] bottom-[8%] h-26 w-26 object-contain" />
        <img src={tea} alt="tea" className="absolute bottom-[3%] h-28 w-28 left-[42%]" />
        <img src={dinner} alt="dinner" className="absolute left-[2%] bottom-[1%] h-28 w-28 md:h-40 md:w-40 object-contain" />
        <img src={chicken} alt="chicken" className="absolute left-[2%] bottom-[9%] h-35 w-35 object-contain" />
        <img src={drink} alt='drink' className="absolute right-[6%] top-[17%] h-35 w-35 object-contain"/>
        <img src={smiley} alt='smiley' className="absolute left-[3%] top-[20%] h-35 w-35 object-contain"/>
        <img src={milk} alt='milk' className="absolute right-[0%] top-[39%] h-35 w-35 object-contain"/>
      </div>

      <div className="relative flex flex-col min-h-screen px-4 pt-6 pb-10 md:justify-center md:items-center">
        
        {/* Logo - Stays in corner on tablet */}

        <div className="flex flex-col items-center w-full">
          
          {/* Welcome Text - Larger on Tablet */}
          <div className="mb-6 mt-25 text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#23160f]">
              Welcome
            </h1>
            <p className="mt-1 md:mt-3 text-sm md:text-lg text-[#5f4d3d]">
              Let&apos;s get your details to start ordering
            </p>
          </div>

          {/* Form Card Section - INCREASED max-width and padding for Tablet */}
          <div className="montserrat w-full max-w-[460px] md:max-w-[650px] rounded-[32px] md:rounded-[45px] border border-[#dfc6ae]/50 bg-[linear-gradient(156.24deg,rgba(254,222,222,0.28)_2.37%,rgba(221,131,11,0.28)_97.63%)] p-6 md:p-12 shadow-2xl backdrop-blur-sm">            
            <div className="space-y-4 md:space-y-8">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 md:mb-3 block text-md md:text-sm text-black ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter Your Name (Letters only)"
                  className={`w-full rounded-xl md:rounded-2xl border bg-[#fdfdfd] px-4 py-3.5 md:py-5 text-[15px] md:text-xl text-[#2f261d] outline-none transition focus:border-[#ffa321] ${errors.name ? 'border-red-400' : 'border-[#e7dfd7]'}`}
                />
                {errors.name && <p className="mt-2 text-xs font-medium text-red-500 md:text-sm">{errors.name}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="mb-1.5 md:mb-3 block text-md text-black ml-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="+91 xxxxxxxxxx"
                  className={`w-full rounded-xl md:rounded-2xl border bg-[#fdfdfd] px-4 py-3.5 md:py-5 text-[15px] md:text-xl text-[#2f261d] outline-none transition focus:border-[#ffa321] ${errors.mobile ? 'border-red-400' : 'border-[#e7dfd7]'}`}
                />
                {errors.mobile && <p className="mt-2 text-xs font-medium text-red-500 md:text-sm">{errors.mobile}</p>}
              </div>

              {/* Number of Guests */}
              <div>
                <label className="mb-1.5 md:mb-3 block text-md text-black ml-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestDisplayValue}
                    onFocus={() => {
                      setGuestFocused(true);
                      setGuestDropdownOpen(true);
                    }}
                    onBlur={() => {
                      setGuestFocused(false);
                      setTimeout(() => setGuestDropdownOpen(false), 120);
                    }}
                    onChange={(e) => {
                      handleChange('guests', e.target.value.replace(/\D/g, ''));
                      setGuestDropdownOpen(true);
                    }}
                    placeholder="Choose or enter guests"
                    className={`w-full rounded-xl md:rounded-2xl border bg-white px-4 py-3.5 pr-12 md:py-5 text-[15px] md:text-xl text-[#2f261d] outline-none transition focus:border-[#ffa321] ${errors.guests ? 'border-red-400' : 'border-[#e7dfd7]'}`}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setGuestFocused(true);
                      setGuestDropdownOpen((prev) => !prev);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c3a2a]"
                  >
                    <ChevronDown className={`h-5 w-5 md:h-7 md:w-7 transition-transform ${guestDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {guestDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-md border border-[#eadfd3] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                      {guestOptions.map((count) => (
                        <button
                          key={count}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleChange('guests', count);
                            setGuestFocused(false);
                            setGuestDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-[15px] text-[#3d3127] transition hover:bg-[#faf3eb]"
                        >
                          <span>{count} Guests</span>
                          {formData.guests === count && <span className="text-xs text-[#a06a34]">Selected</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.guests && <p className="mt-2 text-xs font-medium text-red-500 md:text-sm">{errors.guests}</p>}
              </div>

              {/* Table Number */}
              <div>
                <label className="mb-1.5 md:mb-3 block text-md ml-1">
                  Table Number
                </label>
                <input
                  readOnly
                  value={formData.table}
                  className="w-full rounded-xl md:rounded-2xl border border-[#e7dfd7] bg-[#f5f0eb] px-4 py-3.5 md:py-5 text-[15px] md:text-xl font-semibold text-[#4d443b] outline-none"
                />
              </div>
            </div>

            {/* Submit Button - Larger for Tablet */}
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-10 md:mt-14 w-full rounded-xl md:rounded-2xl bg-[linear-gradient(90deg,#BC9F76_0%,#64471E_100%)] py-4 md:py-6 text-base md:text-2xl text-white shadow-lg shadow-orange-200 transition active:scale-[0.98]"
            >
              Start Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsForm;
