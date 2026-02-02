/**
 * Tour package card component.
 */
export function PackageCard({ package: pkg, onExplore }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {/* Package Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={pkg.image_url}
          alt={pkg.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-semibold px-2 py-1 rounded-full">
            {pkg.duration} Days
          </span>
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {pkg.type}
          </span>
        </div>
      </div>

      {/* Package Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">
          {pkg.name}
        </h3>

        <p className="text-gray-500 text-sm mb-2">
          {pkg.region}
        </p>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
          {pkg.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pkg.highlights.slice(0, 2).map((highlight, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
            >
              {highlight}
            </span>
          ))}
          {pkg.highlights.length > 2 && (
            <span className="text-gray-400 text-xs px-2 py-1">
              +{pkg.highlights.length - 2} more
            </span>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-teal-600">
              ${pkg.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm"> /person</span>
          </div>

          <button
            onClick={() => onExplore(pkg)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:shadow-md"
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  );
}
