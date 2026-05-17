import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppFAB: React.FC = () => {
  const phoneNumber = '+919698690899';
  const message = encodeURIComponent("Hi Smart Brains Cubicle! I'm interested in your learning materials.");

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center group"
      aria-label="Chat with a Parent Consultant"
    >
      <MessageCircle size={28} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-semibold">
        Chat with a Parent Consultant
      </span>
    </a>
  );
};

export default WhatsAppFAB;
