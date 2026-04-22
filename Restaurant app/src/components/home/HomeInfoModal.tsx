import React from "react";
import { Clock3, MessageCircle, Phone } from "lucide-react";

interface HomeInfoModalProps {
  onClose: () => void;
}

const HomeInfoModal: React.FC<HomeInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/35" onClick={onClose}>
      <div
        className="ml-4 mt-16 h-[78vh] w-[calc(100vw-2.5rem)] max-w-[335px] overflow-y-auto rounded-xl border border-[#d3d8f2] bg-[#f5f5f5] p-5 text-[#2a2a2a] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-6 text-[#2f2f2f]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              <p className="playfair text-[1.75rem] leading-none">
                Restaurant Timing
              </p>
            </div>
            <div className="mb-3 border-b border-gray-300" />
            <ul className="space-y-3 text-[1.3rem] leading-tight">
              <li>- Opening Time: 7:00 AM</li>
              <li>- Closing Time: 11:30 PM</li>
              <li>- Breakfast: 7:00 AM - 11:00 AM</li>
              <li>- Lunch: 12:00 PM - 4:00 PM</li>
              <li>- Dinner: 7:00 PM - 11:30 PM</li>
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <p className="playfair text-[1.75rem] leading-none">
                Social Media Handles
              </p>
            </div>
            <div className="mb-3 border-b border-gray-300" />
            <ul className="space-y-3 text-[1.3rem] leading-tight">
              <li>
                Instagram: <span className="text-[#5aa3d8]">@zhonixkitchen</span>
              </li>
              <li>
                Facebook:{" "}
                <span className="text-[#5aa3d8]">Zhonix Kitchen Official</span>
              </li>
              <li>
                WhatsApp: <span className="text-[#5aa3d8]">+91 98765 43210</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              <p className="playfair text-[1.75rem] leading-none">
                Contact Info
              </p>
            </div>
            <div className="mb-3 border-b border-gray-300" />
            <ul className="space-y-3 text-[1.3rem] leading-tight">
              <li>- Location: Pune, Maharashtra</li>
              <li>- Phone: +91 98765 43210</li>
              <li>- Email: support@zhonixkitchen.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeInfoModal;
