// ShareMapPanel.js
import React, { useRef, useState } from 'react';
import { FaTimes, FaShareAlt, FaFacebook, FaWhatsapp, FaLink, FaCode, FaEnvelope } from 'react-icons/fa';

const ShareMapPanel = ({ sharePanelOpen, toggleSharePanel }) => {
  const shareLinkRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState('');

  const handleCopyLink = () => {
    if (shareLinkRef.current) {
      shareLinkRef.current.select();
      document.execCommand('copy');
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
    }
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(shareLinkRef.current?.value || 'https://app.govmap.go.il/7Gq9');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(shareLinkRef.current?.value || 'https://app.govmap.go.il/7Gq9');
    const text = encodeURIComponent('Check out this map on Govmap: ');
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
  };

  if (!sharePanelOpen) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 h-full w-[320px] bg-white shadow-lg z-50 flex flex-col border-r border-gray-200 animate-slideInLeft">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-800">Share Map</h2>
        <button
          onClick={toggleSharePanel}
          className="text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Close share panel"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col space-y-4">
        {/* Share Link */}
        <div>
          <label htmlFor="share-link" className="sr-only">Shareable Link</label>
          <div className="relative flex items-center bg-gray-50 rounded-md border border-gray-200 pr-2">
            <FaLink className="absolute left-3 text-gray-400 text-xs" />
            <input
              id="share-link"
              type="text"
              readOnly
              ref={shareLinkRef}
              value="https://app.govmap.go.il/7Gq9" // Replace with dynamic link if available
              className="flex-1 pl-9 pr-2 py-2 text-xs text-gray-700 bg-transparent outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              {copySuccess || 'Copy'}
            </button>
          </div>
          {copySuccess && <p className="text-green-600 text-xs mt-1 animate-fadeIn">{copySuccess}</p>}
        </div>

        {/* Embed Map */}
        <button className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <FaCode className="text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Embed map in website</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

        {/* Send via Email */}
        <button className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <FaEnvelope className="text-gray-500 mr-3" />
            <span className="text-sm text-gray-700">Send link via Email</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

        <div></div> {/* Spacer */}

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleShareFacebook}
            className="w-full py-3 px-4 bg-[#1877F2] text-white rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#166FE5] transition-colors shadow"
          >
            <FaFacebook className="mr-2 text-lg" />
            Share on Facebook
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 bg-[#25D366] text-white rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#1DA851] transition-colors shadow"
          >
            <FaWhatsapp className="mr-2 text-lg" />
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMapPanel;