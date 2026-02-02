import { useState, useCallback, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import { INITIAL_STATE, FLOW_STATES } from '../data/chatFlow';

/**
 * Custom hook for managing chat state and interactions.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [flowState, setFlowState] = useState(INITIAL_STATE);
  const [selections, setSelections] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentOptions, setCurrentOptions] = useState(null);
  const [packages, setPackages] = useState([]);

  const messagesEndRef = useRef(null);
  const initialized = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with greeting
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeChat();
    }
  }, []);

  /**
   * Initialize the chat with a greeting message.
   */
  const initializeChat = async () => {
    setIsLoading(true);
    try {
      const response = await sendChatMessage('', INITIAL_STATE, {});

      addBotMessage(response.message, response.options);
      setFlowState(response.flow_state);
      setCurrentOptions(response.options);

      if (response.packages) {
        setPackages(response.packages);
      }
    } catch (err) {
      setError('Failed to connect to chat service');
      // Add fallback greeting
      addBotMessage(
        "Kia Ora! Welcome to NZ Tours. I'm here to help you discover the magic of Aotearoa New Zealand. How would you like to explore?",
        [
          { label: 'Browse Packages', value: 'browse', next_state: 'destination' },
          { label: 'Plan Custom Trip', value: 'custom', next_state: 'destination' },
          { label: 'Talk to AI Assistant', value: 'ai', next_state: 'ai_chat' },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add a user message to the chat.
   */
  const addUserMessage = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: text,
        timestamp: new Date(),
      },
    ]);
  }, []);

  /**
   * Add a bot message to the chat.
   */
  const addBotMessage = useCallback((text, options = null, pkgs = null) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'bot',
        content: text,
        options,
        packages: pkgs,
        timestamp: new Date(),
      },
    ]);
  }, []);

  /**
   * Send a message (either flow selection or free text).
   */
  const sendMessage = useCallback(async (text, isFlowSelection = false) => {
    if (!text.trim() && !isFlowSelection) return;

    // Add user message to chat
    if (!isFlowSelection) {
      addUserMessage(text);
    }

    setIsLoading(true);
    setError(null);
    setCurrentOptions(null);

    try {
      const messageToSend = isFlowSelection ? `_flow:${text}` : text;
      const response = await sendChatMessage(messageToSend, flowState, selections);

      // Update selections based on flow
      if (isFlowSelection && flowState !== FLOW_STATES.SHOW_PACKAGES) {
        const stateSelectionMap = {
          destination: 'destination',
          trip_type: 'trip_type',
          duration: 'duration',
          budget: 'budget',
          group_size: 'group_size',
        };

        if (stateSelectionMap[flowState]) {
          setSelections((prev) => ({
            ...prev,
            [stateSelectionMap[flowState]]: text,
          }));
        }
      }

      // Handle restart
      if (text === 'restart') {
        setSelections({});
      }

      // Update state
      setFlowState(response.flow_state);
      setCurrentOptions(response.options);

      // Add bot response
      addBotMessage(response.message, response.options, response.packages);

      if (response.packages) {
        setPackages(response.packages);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      addBotMessage("I'm sorry, I'm having trouble connecting. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, [flowState, selections, addUserMessage, addBotMessage]);

  /**
   * Handle flow option selection.
   */
  const selectOption = useCallback((option) => {
    // Show the selected option as user message
    addUserMessage(option.label);

    // Send the selection
    sendMessage(option.value, true);
  }, [addUserMessage, sendMessage]);

  /**
   * Reset the chat to initial state.
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setFlowState(INITIAL_STATE);
    setSelections({});
    setPackages([]);
    setCurrentOptions(null);
    setError(null);
    initialized.current = false;

    // Re-initialize
    setTimeout(() => {
      initialized.current = true;
      initializeChat();
    }, 100);
  }, []);

  return {
    messages,
    flowState,
    selections,
    isLoading,
    error,
    currentOptions,
    packages,
    messagesEndRef,
    sendMessage,
    selectOption,
    resetChat,
  };
}
