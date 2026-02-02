import { useState, useRef, lazy, Suspense } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { FlowOptions } from './FlowOptions';
import { TypingIndicator } from './TypingIndicator';
import { PackageDetail } from './PackageDetail';

// Lazy load CustomTripPlanner for better performance
const CustomTripPlanner = lazy(() => import('./CustomTripPlanner'));

/**
 * Main chat widget container component.
 */
export function ChatWidget() {
  const {
    messages,
    isLoading,
    error,
    currentOptions,
    messagesEndRef,
    sendMessage,
    selectOption,
    resetChat,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleExplorePackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleOptionSelect = (option) => {
    // Intercept "Plan Custom Trip" option to open the planner modal
    if (option.value === 'custom') {
      setShowTripPlanner(true);
      return;
    }
    selectOption(option);
  };

  return (
    <>
      <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-xl">🥝</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">NZ Tours</h1>
              <p className="text-teal-100 text-sm">Your New Zealand Adventure Awaits</p>
            </div>
          </div>
          <button
            onClick={resetChat}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Start New Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* Welcome Banner */}
          {messages.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">🏔️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Kia Ora! Welcome to NZ Tours
              </h2>
              <p className="text-gray-600">
                Discover the magic of Aotearoa New Zealand
              </p>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onExplorePackage={handleExplorePackage}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2">
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            </div>
          )}

          {/* Flow Options */}
          {!isLoading && currentOptions && (
            <FlowOptions
              options={currentOptions}
              onSelect={handleOptionSelect}
              disabled={isLoading}
            />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or ask anything..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-full font-medium text-sm hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <PackageDetail
          package={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}

      {/* Custom Trip Planner Modal */}
      {showTripPlanner && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 animate-spin text-teal-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-600">Loading planner...</span>
              </div>
            </div>
          </div>
        }>
          <CustomTripPlanner onClose={() => setShowTripPlanner(false)} />
        </Suspense>
      )}
    </>
  );
}
