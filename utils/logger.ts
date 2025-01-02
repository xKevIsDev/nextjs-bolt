export type DebugLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

type LoggerFunction = (...messages: any[]) => void;

interface Logger {
  trace: LoggerFunction;
  debug: LoggerFunction;
  info: LoggerFunction;
  warn: LoggerFunction;
  error: LoggerFunction;
}

// Use process.env instead of import.meta.env
let currentLevel: DebugLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as DebugLevel

const isWorker = typeof window !== 'undefined' && 'HTMLRewriter' in window;
const supportsColor = !isWorker;

export const logger: Logger = {
  trace: (...messages: any[]) => log('trace', undefined, messages),
  debug: (...messages: any[]) => log('debug', undefined, messages),
  info: (...messages: any[]) => log('info', undefined, messages),
  warn: (...messages: any[]) => log('warn', undefined, messages),
  error: (...messages: any[]) => log('error', undefined, messages),
};

export function createScopedLogger(scope: string): Logger {
  return {
    trace: (...messages: any[]) => log('trace', scope, messages),
    debug: (...messages: any[]) => log('debug', scope, messages),
    info: (...messages: any[]) => log('info', scope, messages),
    warn: (...messages: any[]) => log('warn', scope, messages),
    error: (...messages: any[]) => log('error', scope, messages),
  };
}

function log(level: DebugLevel, scope: string | undefined, messages: any[]) {
  const levelOrder: DebugLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];

  if (levelOrder.indexOf(level) < levelOrder.indexOf(currentLevel)) {
    return;
  }

  const allMessages = messages.reduce((acc, current) => {
    if (acc.endsWith('\n')) {
      return acc + current;
    }

    if (!acc) {
      return current;
    }

    return `${acc} ${current}`;
  }, '');

  if (!supportsColor) {
    console.log(`[${level.toUpperCase()}]`, allMessages);
    return;
  }

  const labelBackgroundColor = getColorForLevel(level);
  const labelTextColor = level === 'warn' ? 'black' : 'white';

  const labelStyles = getLabelStyles(labelBackgroundColor, labelTextColor);
  const scopeStyles = getLabelStyles('#77828D', 'white');

  const styles = [labelStyles];

  if (typeof scope === 'string') {
    styles.push('', scopeStyles);
  }

  console.log(`%c${level.toUpperCase()}${scope ? `%c %c${scope}` : ''}`, ...styles, allMessages);
}

function getLabelStyles(color: string, textColor: string) {
  return `background-color: ${color}; color: white; border: 4px solid ${color}; color: ${textColor};`;
}

function getColorForLevel(level: DebugLevel): string {
  switch (level) {
    case 'trace':
    case 'debug': {
      return '#77828D';
    }
    case 'info': {
      return '#1389FD';
    }
    case 'warn': {
      return '#FFDB6C';
    }
    case 'error': {
      return '#EE4744';
    }
    default: {
      return 'black';
    }
  }
}

export const renderLogger = createScopedLogger('Render');