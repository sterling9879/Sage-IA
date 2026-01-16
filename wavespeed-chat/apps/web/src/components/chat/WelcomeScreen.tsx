'use client';

import { Bot, Code, Lightbulb, BookOpen, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

const suggestions = [
  {
    icon: <Code className="h-5 w-5" />,
    title: 'Explique código',
    prompt: 'Explique este código e sugira melhorias:',
  },
  {
    icon: <Lightbulb className="h-5 w-5" />,
    title: 'Gerar ideias',
    prompt: 'Me ajude a ter ideias para um projeto sobre:',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Resumir texto',
    prompt: 'Resuma o seguinte texto de forma clara e concisa:',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Escrever conteúdo',
    prompt: 'Escreva um artigo sobre:',
  },
];

export function WelcomeScreen() {
  const { sendMessage } = useChat();

  const handleSuggestionClick = (prompt: string) => {
    sendMessage({ message: prompt });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25">
        <Bot className="h-10 w-10 text-white" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-dark-900 dark:text-dark-100">
        Como posso ajudar?
      </h1>
      <p className="mb-8 text-center text-dark-600 dark:text-dark-400">
        Escolha uma opção abaixo ou digite sua mensagem
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.title}
            onClick={() => handleSuggestionClick(suggestion.prompt)}
            className="flex items-center gap-3 rounded-xl border border-dark-200 bg-white p-4 text-left transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-dark-700 dark:bg-dark-800 dark:hover:border-primary-600 dark:hover:bg-dark-700"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              {suggestion.icon}
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-dark-100">
                {suggestion.title}
              </span>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                {suggestion.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
