// Re-export from shared package
export {
  PROVIDERS,
  MODELS,
  PLAN_LIMITS,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
  MAX_HISTORY_TOKENS,
} from 'shared';

export {
  getModelById,
  getModelsByProvider,
  getFreeModels,
  getProviderById,
} from 'shared';

// Additional constants for web app
export const THEME_OPTIONS = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
] as const;

export const MESSAGE_MAX_LENGTH = 10000;
export const TITLE_MAX_LENGTH = 100;
export const MESSAGES_PER_PAGE = 50;
export const CONVERSATIONS_PER_PAGE = 20;

export const KEYBOARD_SHORTCUTS = {
  newChat: 'ctrl+shift+n',
  send: 'enter',
  sendNewLine: 'shift+enter',
  toggleSidebar: 'ctrl+b',
  search: 'ctrl+k',
} as const;
