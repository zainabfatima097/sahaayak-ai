import React from 'react';
import { Phone, MapPin, FileText, ExternalLink, CheckCircle } from 'lucide-react';

const ActionableCard = ({ title, description, actionable, onAction }) => {
  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
    onAction?.('call', phoneNumber);
  };

  const handleDirection = () => {
    // In production, this would open Google Maps
    alert('Location guidance will be available soon');
  };

  const handleApply = () => {
    alert('Application process: Visit your nearest Common Service Centre (CSC) with required documents');
  };

  return (
    <div className="card mb-4 animate-slide-up">
      {title && (
        <h3 className="text-xl font-bold text-green-800 mb-3">{title}</h3>
      )}
      
      <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>
      
      {actionable && (
        <div className="space-y-3 mt-4">
          {/* Phone Numbers */}
          {actionable.phoneNumbers && actionable.phoneNumbers.length > 0 && (
            <div className="border-t pt-3">
              <p className="font-semibold mb-2 text-green-700">📞 Helpline Numbers:</p>
              {actionable.phoneNumbers.map((phone, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCall(phone)}
                  className="flex items-center gap-2 text-blue-600 mb-2 hover:text-blue-800 w-full p-2 bg-blue-50 rounded-lg"
                >
                  <Phone size={18} />
                  <span>{phone}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Scheme Eligibility */}
          {actionable.eligibility && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle size={18} />
                <span className="font-semibold">Eligibility Check</span>
              </div>
              <p className="text-sm">{actionable.eligibility}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {actionable.schemeName && (
              <button
                onClick={handleApply}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <FileText size={16} />
                Apply Now
              </button>
            )}
            
            <button
              onClick={handleDirection}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <MapPin size={16} />
              Find Nearest Center
            </button>
          </div>
          
          {/* Next Steps */}
          {actionable.nextSteps && actionable.nextSteps.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg mt-3">
              <p className="font-semibold mb-2">📋 Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {actionable.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionableCard;