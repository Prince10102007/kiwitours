import { useState } from 'react';

/**
 * Full-screen package detail modal.
 */
export function PackageDetail({ package: pkg, onClose }) {
  const [activeTab, setActiveTab] = useState('itinerary');

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header with Image */}
        <div className="relative h-64 flex-shrink-0">
          <img
            src={pkg.image_url}
            alt={pkg.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Package Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {pkg.type}
              </span>
              <span className="bg-white/90 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
                {pkg.duration} Days
              </span>
              <span className="bg-white/90 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                {pkg.region}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {pkg.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Description and Price */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-gray-600 flex-1">
                {pkg.description}
              </p>
              <div className="flex-shrink-0 text-right">
                <div className="text-3xl font-bold text-teal-600">
                  ${pkg.price.toLocaleString()}
                </div>
                <div className="text-gray-500 text-sm">per person</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-3">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {pkg.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="bg-white text-teal-700 px-3 py-1.5 rounded-full text-sm border border-teal-200"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {['itinerary', 'inclusions', 'exclusions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-b-2 border-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{day}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inclusions' && (
              <ul className="space-y-2">
                {pkg.inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'exclusions' && (
              <ul className="space-y-2">
                {pkg.exclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Group Size and Season */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Group Size</h4>
                <p className="font-semibold text-gray-800">
                  {pkg.group_size_min} - {pkg.group_size_max} travelers
                </p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500 mb-1">Best Season</h4>
                <p className="font-semibold text-gray-800">
                  {pkg.season.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => window.open('mailto:info@nztours.com?subject=Inquiry: ' + pkg.name, '_blank')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:shadow-lg"
          >
            Inquire About This Package
          </button>
        </div>
      </div>
    </div>
  );
}
