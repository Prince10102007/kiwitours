import { PackageCard } from './PackageCard';

/**
 * Individual chat message component.
 */
export function ChatMessage({ message, onExplorePackage }) {
  const isBot = message.type === 'bot';

  return (
    <div className={`flex gap-3 p-4 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isBot ? '' : ''}`}>
        {isBot ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">NZ</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isBot ? '' : 'flex justify-end'}`}>
        <div
          className={`
            max-w-[85%] rounded-2xl px-4 py-3
            ${isBot
              ? 'bg-gray-100 rounded-bl-md text-gray-800'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 rounded-br-md text-white'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* Package Cards */}
        {isBot && message.packages && message.packages.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
            {message.packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onExplore={onExplorePackage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
