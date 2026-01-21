/**
 * NOVA Service
 * 
 * Core AI tutoring logic for the NOVA assistant
 * Integrates with Google Gemini for intelligent responses
 * Implements step-aware context building and fallback mechanisms
 * 
 * Phase 10 Implementation - NOVA AI End-to-End Integration
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiMessagesRepository = require('../repositories/aiMessagesRepository');
const commandRepository = require('../repositories/commandRepository');
const scenarioSessionRepository = require('../repositories/scenarioSessionRepository');
const scenarioStepRepository = require('../repositories/scenarioStepRepository');
const scenarioRepository = require('../repositories/scenarioRepository');
const logger = require('../utils/logger');

// Gemini configuration
const GEMINI_MODEL = 'gemini-1.5-flash';
const GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 1000,
  topP: 0.95,
  topK: 40,
};

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000;

// Context limits
const MAX_HISTORY_MESSAGES = 10;
const MAX_RECENT_COMMANDS = 5;

/**
 * Initialize Gemini AI client
 * @returns {object|null} Gemini model instance or null if not configured
 */
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn('GEMINI_API_KEY not configured - NOVA will use fallback responses');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: GEMINI_MODEL });
  } catch (error) {
    logger.error('Failed to initialize Gemini AI', { error: error.message });
    return null;
  }
}

/**
 * Sleep utility for retry delays with jitter
 * @param {number} ms - Base delay in milliseconds
 * @returns {Promise}
 */
function sleep(ms) {
  // Add jitter: random value between 0.5x and 1.5x the base delay
  const jitter = ms * (0.5 + Math.random());
  return new Promise(resolve => setTimeout(resolve, jitter));
}

/**
 * Build step-aware prompt for NOVA
 * Follows Gemini best practices for structured prompts
 * 
 * @param {object} context - Context object with scenario, step, commands, history
 * @param {string} userMessage - User's message/question
 * @returns {string} Formatted prompt
 */
function buildStepAwarePrompt(context, userMessage) {
  const { scenario, currentStep, recentCommands, sessionHistory, sessionState } = context;

  // Build context sections
  let contextSection = '<context>\n';
  
  // Scenario context
  if (scenario) {
    contextSection += `<scenario>
Title: ${scenario.title || 'Unknown Scenario'}
Description: ${scenario.description || 'No description'}
Difficulty: ${scenario.difficulty || 'Unknown'}
Type: ${scenario.type || 'GUIDED'}
</scenario>\n`;
  }

  // Current step context
  if (currentStep) {
    contextSection += `<current_step>
Title: ${currentStep.title || 'Unknown Step'}
Instruction: ${currentStep.instruction || 'No instruction'}
Objective: ${currentStep.objective || 'No objective'}
Hint Suggestion: ${currentStep.hint_suggestion || 'No hint available'}
</current_step>\n`;
  }

  // Session state
  if (sessionState) {
    contextSection += `<session_state>
Status: ${sessionState.status || 'Unknown'}
Score: ${sessionState.score || 0}
Hints Used: ${sessionState.total_hints_used || 0}
Errors: ${sessionState.total_errors || 0}
</session_state>\n`;
  }

  // Recent commands
  if (recentCommands && recentCommands.length > 0) {
    contextSection += '<recent_commands>\n';
    recentCommands.forEach((cmd, i) => {
      contextSection += `${i + 1}. ${cmd.commandName}: ${cmd.resultStatus} - ${cmd.resultMessage || 'No message'}\n`;
    });
    contextSection += '</recent_commands>\n';
  }

  // Conversation history
  if (sessionHistory && sessionHistory.length > 0) {
    contextSection += '<conversation_history>\n';
    sessionHistory.forEach(msg => {
      contextSection += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
    });
    contextSection += '</conversation_history>\n';
  }

  contextSection += '</context>\n';

  // User query section
  const querySection = `<user_query>${userMessage}</user_query>\n`;

  // Instructions section
  const instructionsSection = `<instructions>
You are NOVA, an AI tutor for satellite ground control training. Your role is to help operators learn satellite operations through guided scenarios.

Guidelines:
1. Be concise and helpful - operators are learning in real-time
2. Use aerospace terminology appropriately but explain complex concepts
3. Reference the current step's objective and instruction when relevant
4. If the operator seems stuck, provide progressive hints (conceptual first, then procedural)
5. Acknowledge command results and explain what happened
6. Encourage good practices and celebrate progress
7. If you need to provide a hint, categorize it as CONCEPTUAL, PROCEDURAL, TROUBLESHOOTING, or CONTEXTUAL
8. Keep responses under 200 words unless explaining a complex concept
9. Use Mission Control communication style (clear, professional, supportive)

If the operator explicitly asks for a hint or seems very stuck:
- Provide the step's hint_suggestion if available
- Mark your response as a hint so it can be tracked

Remember: You're training future satellite operators. Safety and precision matter.
</instructions>`;

  return contextSection + querySection + instructionsSection;
}

/**
 * Detect if NOVA response contains a hint
 * @param {string} response - NOVA's response text
 * @param {boolean} requestedHint - Whether user explicitly requested a hint
 * @returns {string|null} Hint type or null
 */
function detectHintType(response, requestedHint) {
  const lowerResponse = response.toLowerCase();
  
  if (requestedHint) {
    return 'CONTEXTUAL';
  }
  
  // Check for hint indicators in response
  if (lowerResponse.includes('hint:') || lowerResponse.includes('tip:') || lowerResponse.includes('suggestion:')) {
    if (lowerResponse.includes('concept') || lowerResponse.includes('understand') || lowerResponse.includes('theory')) {
      return 'CONCEPTUAL';
    }
    if (lowerResponse.includes('step') || lowerResponse.includes('first') || lowerResponse.includes('then') || lowerResponse.includes('next')) {
      return 'PROCEDURAL';
    }
    if (lowerResponse.includes('error') || lowerResponse.includes('issue') || lowerResponse.includes('problem') || lowerResponse.includes('fix')) {
      return 'TROUBLESHOOTING';
    }
    return 'CONTEXTUAL';
  }
  
  return null;
}

/**
 * Fetch context for NOVA response generation
 * 
 * @param {string} sessionId - Session ID
 * @param {string} stepId - Optional current step ID
 * @returns {Promise<object>} Context object
 */
async function fetchContext(sessionId, stepId = null) {
  const context = {
    scenario: null,
    currentStep: null,
    recentCommands: [],
    sessionHistory: [],
    sessionState: null,
  };

  try {
    // Get session data
    const session = await scenarioSessionRepository.getById(sessionId);
    if (session) {
      context.sessionState = {
        status: session.status,
        score: session.score,
        total_hints_used: session.total_hints_used,
        total_errors: session.total_errors,
      };

      // Get scenario
      if (session.scenario_id) {
        const scenario = await scenarioRepository.getById(session.scenario_id);
        if (scenario) {
          context.scenario = scenario;
        }
      }

      // Get current step
      const currentStepId = stepId || session.current_step_id;
      if (currentStepId) {
        const step = await scenarioStepRepository.getById(currentStepId);
        if (step) {
          context.currentStep = step;
        }
      }
    }

    // Get recent commands
    const commands = await commandRepository.getBySessionId(sessionId, { limit: MAX_RECENT_COMMANDS });
    context.recentCommands = commands;

    // Get conversation history
    const history = await aiMessagesRepository.getRecentMessages(sessionId, MAX_HISTORY_MESSAGES);
    context.sessionHistory = history;

  } catch (error) {
    logger.error('Failed to fetch NOVA context', { error: error.message, sessionId });
    // Continue with partial context
  }

  return context;
}

/**
 * Get fallback response when Gemini is unavailable
 * Uses step hint_suggestion or generic fallback
 * 
 * @param {object} context - Context object
 * @param {string} userMessage - User's message
 * @returns {object} Fallback response object
 */
function getFallbackResponse(context, userMessage) {
  let response;
  let hintType = 'FALLBACK';

  // Try to use step hint_suggestion
  if (context.currentStep?.hint_suggestion) {
    response = `NOVA here. I'm experiencing some communication delays, but I can offer you a hint for this step:\n\n${context.currentStep.hint_suggestion}\n\nLet me know if you need more specific guidance once my connection stabilizes.`;
  } else if (context.scenario) {
    response = `NOVA here. I'm experiencing some communication delays. You're currently working on "${context.scenario.title}". Try reviewing your recent command results and the step objectives. I'll be back with full assistance shortly.`;
  } else {
    response = 'NOVA here. I\'m experiencing some communication delays. Please continue with your current task, and I\'ll be back with full assistance shortly. Review your command console for immediate feedback.';
  }

  return { response, hintType, isFallback: true };
}

/**
 * Generate NOVA response using Gemini with retry logic
 * 
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID (uid)
 * @param {string} userMessage - User's message
 * @param {object} options - Additional options
 * @param {string} options.step_id - Current step ID
 * @param {string} options.command_id - Related command ID
 * @param {boolean} options.request_hint - Whether user explicitly requested a hint
 * @returns {Promise<object>} Response object with content and metadata
 */
async function generateNovaResponse(sessionId, userId, userMessage, options = {}) {
  const { step_id, command_id, request_hint } = options;

  // Store user message first
  await aiMessagesRepository.addMessage(sessionId, userId, 'user', userMessage, {
    step_id,
    command_id,
  });

  // Fetch context
  const context = await fetchContext(sessionId, step_id);

  // Get Gemini model
  const model = getGeminiModel();
  
  if (!model) {
    // No API key configured - use fallback
    const fallback = getFallbackResponse(context, userMessage);
    await storeResponse(sessionId, userId, fallback.response, {
      step_id,
      command_id,
      hint_type: fallback.hintType,
      is_fallback: true,
    });
    
    // Increment hints_used if this was a hint
    if (request_hint) {
      await incrementSessionHints(sessionId);
    }
    
    return {
      content: fallback.response,
      hint_type: fallback.hintType,
      is_fallback: true,
    };
  }

  // Build prompt
  const fullPrompt = buildStepAwarePrompt(context, userMessage);

  // Try to get response with retries
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT_MS);
      });

      // Generate content with timeout
      const generatePromise = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: GENERATION_CONFIG,
      });

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = result.response.text();

      // Detect if this is a hint
      const hintType = detectHintType(responseText, request_hint);

      // Store assistant response
      await storeResponse(sessionId, userId, responseText, {
        step_id,
        command_id,
        hint_type: hintType,
        is_fallback: false,
        extra: {
          model: GEMINI_MODEL,
          attempt,
        },
      });

      // Increment hints_used if this was a hint
      if (hintType || request_hint) {
        await incrementSessionHints(sessionId);
      }

      return {
        content: responseText,
        hint_type: hintType,
        is_fallback: false,
      };

    } catch (error) {
      lastError = error;
      logger.warn(`NOVA generation attempt ${attempt} failed`, {
        error: error.message,
        sessionId,
        attempt,
      });

      if (attempt < MAX_RETRIES) {
        // Exponential backoff with jitter
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }

  // All retries failed - use fallback
  logger.error('NOVA generation failed after all retries', {
    error: lastError?.message,
    sessionId,
  });

  const fallback = getFallbackResponse(context, userMessage);
  await storeResponse(sessionId, userId, fallback.response, {
    step_id,
    command_id,
    hint_type: fallback.hintType,
    is_fallback: true,
  });

  if (request_hint) {
    await incrementSessionHints(sessionId);
  }

  return {
    content: fallback.response,
    hint_type: fallback.hintType,
    is_fallback: true,
    error: lastError?.message,
  };
}

/**
 * Store assistant response in repository
 * 
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID
 * @param {string} content - Response content
 * @param {object} metadata - Response metadata
 */
async function storeResponse(sessionId, userId, content, metadata = {}) {
  return aiMessagesRepository.addMessage(sessionId, userId, 'assistant', content, metadata);
}

/**
 * Increment total_hints_used in session
 * 
 * @param {string} sessionId - Session ID
 */
async function incrementSessionHints(sessionId) {
  try {
    const session = await scenarioSessionRepository.getById(sessionId);
    if (session) {
      const currentHints = session.total_hints_used || 0;
      await scenarioSessionRepository.patch(sessionId, {
        total_hints_used: currentHints + 1,
      });
    }
  } catch (error) {
    logger.error('Failed to increment session hints', { error: error.message, sessionId });
    // Non-critical - don't throw
  }
}

/**
 * Get session conversation history
 * 
 * @param {string} sessionId - Session ID
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated messages
 */
async function getSessionHistory(sessionId, options = {}) {
  return aiMessagesRepository.getMessagesBySession(sessionId, options);
}

module.exports = {
  generateNovaResponse,
  storeResponse,
  getSessionHistory,
  fetchContext,
  buildStepAwarePrompt,
  incrementSessionHints,
};
