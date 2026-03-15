export interface Logger {
  info(msg: string, data?: Record<string, any>): void;
  warn(msg: string, data?: Record<string, any>): void;
  error(msg: string, data?: Record<string, any>): void;
  debug(msg: string, data?: Record<string, any>): void;
}

export function createLogger(namespace: string): Logger {
  const fmt = (level: string, msg: string, data?: Record<string, any>) => {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level}] [${namespace}] ${msg}`;
    return data ? `${base} ${JSON.stringify(data)}` : base;
  };

  return {
    info: (msg, data) => console.log(fmt('INFO', msg, data)),
    warn: (msg, data) => console.warn(fmt('WARN', msg, data)),
    error: (msg, data) => console.error(fmt('ERROR', msg, data)),
    debug: (msg, data) => console.debug(fmt('DEBUG', msg, data)),
  };
}
