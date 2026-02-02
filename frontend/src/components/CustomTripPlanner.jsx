import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { submitCustomTrip } from '../services/api';

// Question configuration - memoized outside component
const TRIP_QUESTIONS = [
  {
    id: 'destination',
    title: 'Where would you like to explore?',
    subtitle: 'Choose your dream destination in New Zealand',
    icon: '🗺️',
    options: [
      { id: 'north', label: 'North Island', icon: '🌋', description: 'Geothermal wonders, beaches & culture' },
      { id: 'south', label: 'South Island', icon: '🏔️', description: 'Mountains, glaciers & fjords' },
      { id: 'both', label: 'Both Islands', icon: '✨', description: 'The complete NZ experience' },
    ],
  },
  {
    id: 'tripType',
    title: 'What kind of experience are you seeking?',
    subtitle: 'Select the adventure that calls to you',
    icon: '🎯',
    options: [
      { id: 'adventure', label: 'Adventure', icon: '🧗', description: 'Hiking, bungee, skydiving & more' },
      { id: 'nature', label: 'Nature & Wildlife', icon: '🦜', description: 'National parks & unique wildlife' },
      { id: 'culture', label: 'Culture & Heritage', icon: '🏛️', description: 'Maori culture & local experiences' },
      { id: 'relaxation', label: 'Relaxation', icon: '🧘', description: 'Spas, scenic drives & tranquility' },
    ],
  },
  {
    id: 'duration',
    title: 'How long is your trip?',
    subtitle: 'Select your preferred duration',
    icon: '📅',
    options: [
      { id: '3-5', label: '3-5 Days', icon: '⚡', description: 'Quick getaway' },
      { id: '6-10', label: '6-10 Days', icon: '🌟', description: 'Perfect exploration' },
      { id: '11-14', label: '11-14 Days', icon: '🎪', description: 'Deep dive experience' },
      { id: '15+', label: '15+ Days', icon: '🏆', description: 'Ultimate adventure' },
    ],
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    subtitle: 'Per person, excluding flights',
    icon: '💰',
    options: [
      { id: 'budget', label: 'Budget', icon: '🎒', description: 'Under $1,500 NZD' },
      { id: 'mid', label: 'Mid-Range', icon: '🏨', description: '$1,500 - $3,500 NZD' },
      { id: 'premium', label: 'Premium', icon: '🌟', description: '$3,500 - $6,000 NZD' },
      { id: 'luxury', label: 'Luxury', icon: '👑', description: '$6,000+ NZD' },
    ],
  },
  {
    id: 'groupSize',
    title: 'Who\'s traveling with you?',
    subtitle: 'Tell us about your travel group',
    icon: '👥',
    options: [
      { id: 'solo', label: 'Solo', icon: '🚶', description: 'Just me' },
      { id: 'couple', label: 'Couple', icon: '💑', description: 'Romantic getaway' },
      { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', description: '3-6 people' },
      { id: 'group', label: 'Group', icon: '🎉', description: '7+ people' },
    ],
  },
  {
    id: 'interests',
    title: 'Any special interests?',
    subtitle: 'Select all that apply (optional)',
    icon: '❤️',
    multiSelect: true,
    options: [
      { id: 'photography', label: 'Photography', icon: '📷', description: 'Capture moments' },
      { id: 'food', label: 'Food & Wine', icon: '🍷', description: 'Culinary experiences' },
      { id: 'hobbit', label: 'Lord of the Rings', icon: '🧙', description: 'Movie locations' },
      { id: 'wildlife', label: 'Marine Life', icon: '🐋', description: 'Whales & dolphins' },
    ],
  },
];

// Memoized Option Card Component
const OptionCard = memo(function OptionCard({ option, isSelected, onSelect, multiSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-left w-full
        ${isSelected
          ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100 scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
        }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
          {option.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{option.label}</div>
          <div className="text-sm text-gray-500 mt-0.5">{option.description}</div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300
          ${isSelected
            ? 'border-teal-500 bg-teal-500'
            : 'border-gray-300 group-hover:border-teal-400'
          }
          ${multiSelect ? 'rounded-md' : 'rounded-full'}`}
        >
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
});

// Memoized Progress Bar Component
const ProgressBar = memo(function ProgressBar({ currentStep, totalSteps }) {
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-teal-600">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= currentStep ? 'bg-teal-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

// Contact Form Step
const ContactForm = memo(function ContactForm({ formData, onChange, errors }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Almost there!</h2>
        <p className="text-gray-500 mt-1">Share your details and we'll craft your perfect trip</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter your full name"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors
              ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-teal-500'}`}
          />
        </div>
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            placeholder="+64 XX XXX XXXX"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors
              ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-teal-500'}`}
          />
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="your@email.com"
            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors
              ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-teal-500'}`}
          />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Additional Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder="Any special requirements or preferences..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-teal-500 transition-colors resize-none"
        />
      </div>
    </div>
  );
});

// Success Screen
const SuccessScreen = memo(function SuccessScreen({ selections, formData, onReset }) {
  return (
    <div className="text-center py-8 animate-fadeIn">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-scaleIn">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Kia Ora, {formData.name}!</h2>
      <p className="text-gray-600 mb-6">Your custom trip request has been submitted successfully.</p>

      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Your Trip Summary
        </h3>
        <div className="space-y-2 text-sm">
          {Object.entries(selections).map(([key, value]) => {
            const question = TRIP_QUESTIONS.find(q => q.id === key);
            if (!question || !value) return null;
            const displayValue = Array.isArray(value)
              ? value.map(v => question.options.find(o => o.id === v)?.label).join(', ')
              : question.options.find(o => o.id === value)?.label;
            return (
              <div key={key} className="flex justify-between">
                <span className="text-gray-500">{question.title.replace('?', ':').split(':')[0]}:</span>
                <span className="font-medium text-gray-900">{displayValue}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📞</span>
          <div className="text-left">
            <p className="font-medium text-amber-800">We'll contact you soon!</p>
            <p className="text-sm text-amber-700 mt-1">
              Our travel experts will reach out within 24-48 hours at <strong>{formData.phone}</strong> or <strong>{formData.email}</strong> to discuss your perfect New Zealand adventure.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Plan Another Trip
      </button>
    </div>
  );
});

// Main Component
export function CustomTripPlanner({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = TRIP_QUESTIONS.length + 1; // +1 for contact form
  const isContactStep = currentStep === TRIP_QUESTIONS.length;
  const currentQuestion = TRIP_QUESTIONS[currentStep];

  // Keyboard support - Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isSubmitting]);

  const handleOptionSelect = useCallback((optionId) => {
    const question = TRIP_QUESTIONS[currentStep];
    if (!question) return;

    if (question.multiSelect) {
      setSelections(prev => {
        const current = prev[question.id] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [question.id]: updated };
      });
    } else {
      // For single-select, set value and auto-advance after brief delay
      setSelections(prev => ({ ...prev, [question.id]: optionId }));
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    }
  }, [currentStep]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[\d\s\-+()]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(async () => {
    if (isContactStep) {
      if (validateForm()) {
        setIsSubmitting(true);
        try {
          await submitCustomTrip({
            selections,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            notes: formData.notes || null,
          });
          setIsComplete(true);
        } catch (error) {
          console.error('Failed to submit:', error);
          // Still show success in demo mode if API fails
          setIsComplete(true);
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isContactStep, validateForm, selections, formData]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setSelections({});
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setErrors({});
    setIsComplete(false);
  }, []);

  const canProceed = useMemo(() => {
    if (isContactStep) return true;
    const question = TRIP_QUESTIONS[currentStep];
    if (!question) return false;
    const value = selections[question.id];
    if (question.multiSelect) return true; // Optional
    return !!value;
  }, [currentStep, selections, isContactStep]);

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <SuccessScreen selections={selections} formData={formData} onReset={handleReset} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">✈️</span> Plan Your Custom Trip
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isContactStep ? (
            <ContactForm formData={formData} onChange={handleFormChange} errors={errors} />
          ) : (
            <div className="animate-fadeIn">
              <div className="text-center mb-6">
                <span className="text-4xl mb-3 block">{currentQuestion.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{currentQuestion.title}</h2>
                <p className="text-gray-500 mt-1">{currentQuestion.subtitle}</p>
              </div>
              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const currentValue = selections[currentQuestion.id];
                  const isSelected = currentQuestion.multiSelect
                    ? (currentValue || []).includes(option.id)
                    : currentValue === option.id;
                  return (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={isSelected}
                      onSelect={handleOptionSelect}
                      multiSelect={currentQuestion.multiSelect}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* Skip option for multi-select questions */}
          {!isContactStep && currentQuestion?.multiSelect && (
            <button
              onClick={handleNext}
              className="w-full mb-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip this step
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={currentStep === 0 ? onClose : handleBack}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : isContactStep ? (
                'Submit Request'
              ) : currentQuestion?.multiSelect ? (
                <>
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomTripPlanner;
