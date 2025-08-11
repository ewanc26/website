/**
 * Comprehensive debugging utility for development and production
 */

export interface DebugOptions {
  enabled?: boolean;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  prefix?: string;
  includeTimestamp?: boolean;
  includeStack?: boolean;
  maxDepth?: number;
}

export interface DebugContext {
  file: string;
  function: string;
  line?: number;
  component?: string;
  userAgent?: string;
  timestamp: string;
}

class Debugger {
  private options: DebugOptions;
  private context: Partial<DebugContext> = {};

  constructor(options: DebugOptions = {}) {
    this.options = {
      enabled: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
      level: 'info',
      prefix: '[DEBUG]',
      includeTimestamp: true,
      includeStack: false,
      maxDepth: 3,
      ...options
    };
  }

  /**
   * Set context for all subsequent debug calls
   */
  setContext(context: Partial<DebugContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Create a new debugger instance with specific context
   */
  withContext(context: Partial<DebugContext>): Debugger {
    const newDebugger = new Debugger(this.options);
    newDebugger.setContext({ ...this.context, ...context });
    return newDebugger;
  }

  /**
   * Log error messages
   */
  error(message: string, data?: any, error?: Error): void {
    if (!this.shouldLog('error')) return;
    this.log('error', message, data, error);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    this.log('warn', message, data);
  }

  /**
   * Log info messages
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    this.log('info', message, data);
  }

  /**
   * Log debug messages
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    this.log('debug', message, data);
  }

  /**
   * Log trace messages (most verbose)
   */
  trace(message: string, data?: any): void {
    if (!this.shouldLog('trace')) return;
    this.log('trace', message, data);
  }

  /**
   * Log function entry
   */
  enter(functionName: string, params?: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`→ Entering ${functionName}`, params);
  }

  /**
   * Log function exit
   */
  exit(functionName: string, result?: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`← Exiting ${functionName}`, result);
  }

  /**
   * Log performance timing
   */
  time(label: string): () => void {
    if (!this.shouldLog('debug')) return () => {};
    
    const start = performance.now();
    this.debug(`⏱️ Starting timer: ${label}`);
    
    return () => {
      const duration = performance.now() - start;
      this.debug(`⏱️ Timer ${label}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * Log memory usage (if available)
   */
  memory(label?: string): void {
    if (!this.shouldLog('debug')) return;
    
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const mem = (performance as any).memory;
      this.debug(`💾 Memory ${label || 'usage'}:`, {
        used: `${(mem.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(mem.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      });
    }
  }

  /**
   * Log API calls
   */
  api(method: string, url: string, data?: any, response?: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`🌐 API ${method} ${url}`, { request: data, response });
  }

  /**
   * Log component lifecycle events
   */
  lifecycle(component: string, event: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`🔄 ${component} ${event}`, data);
  }

  /**
   * Log state changes
   */
  state(component: string, oldState: any, newState: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`📊 ${component} state change`, { from: oldState, to: newState });
  }

  /**
   * Log user interactions
   */
  interaction(action: string, target: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    this.debug(`👆 User interaction: ${action} on ${target}`, data);
  }

  /**
   * Log errors with full context
   */
  errorWithContext(message: string, error: Error, context?: any): void {
    if (!this.shouldLog('error')) return;
    
    this.error(message, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.options.includeStack ? error.stack : undefined
      }
    });
  }

  /**
   * Check if logging should occur for given level
   */
  private shouldLog(level: string): boolean {
    if (!this.options.enabled) return false;
    
    const levels = ['error', 'warn', 'info', 'debug', 'trace'];
    const currentLevelIndex = levels.indexOf(this.options.level || 'info');
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  /**
   * Format and output log message
   */
  private log(level: string, message: string, data?: any, error?: Error): void {
    const timestamp = this.options.includeTimestamp ? new Date().toISOString() : '';
    const prefix = this.options.prefix || '[DEBUG]';
    const levelEmoji = this.getLevelEmoji(level);
    
    let output = `${prefix} ${levelEmoji} ${level.toUpperCase()}`;
    
    if (timestamp) {
      output += ` [${timestamp}]`;
    }
    
    if (this.context.file) {
      output += ` [${this.context.file}`;
      if (this.context.function) output += `:${this.context.function}`;
      if (this.context.line) output += `:${this.context.line}`;
      output += ']';
    }
    
    output += ` ${message}`;
    
    // Console output based on level
    switch (level) {
      case 'error':
        console.error(output, data || '');
        if (error) console.error(error);
        break;
      case 'warn':
        console.warn(output, data || '');
        break;
      case 'info':
        console.info(output, data || '');
        break;
      case 'debug':
      case 'trace':
        console.log(output, data || '');
        break;
    }
  }

  /**
   * Get emoji for log level
   */
  private getLevelEmoji(level: string): string {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🐛';
      case 'trace': return '🔍';
      default: return '📝';
    }
  }

  /**
   * Safely stringify objects with circular reference handling
   */
  private safeStringify(obj: any, depth: number = 0): string {
    if (depth > (this.options.maxDepth || 3)) return '[Max Depth Reached]';
    if (obj === null) return 'null';
    if (typeof obj === 'undefined') return 'undefined';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    try {
      if (obj instanceof Error) {
        return `Error: ${obj.message}`;
      }
      
      if (Array.isArray(obj)) {
        return `[${obj.map(item => this.safeStringify(item, depth + 1)).join(', ')}]`;
      }
      
      if (typeof obj === 'object') {
        const entries = Object.entries(obj).map(([key, value]) => 
          `${key}: ${this.safeStringify(value, depth + 1)}`
        );
        return `{${entries.join(', ')}}`;
      }
      
      return String(obj);
    } catch (error) {
      return '[Circular Reference or Unstringifiable]';
    }
  }
}

// Create default debugger instance
export const debug = new Debugger();

// Create specialized debuggers for common use cases
export const createFileDebugger = (file: string) => debug.withContext({ file });
export const createComponentDebugger = (component: string) => debug.withContext({ component });
export const createFunctionDebugger = (file: string, functionName: string) => 
  debug.withContext({ file, function: functionName });

// Export the Debugger class for custom instances
export { Debugger };

// Utility functions for quick debugging
export const quickDebug = {
  log: (message: string, data?: any) => debug.debug(message, data),
  error: (message: string, error?: Error) => debug.error(message, undefined, error),
  warn: (message: string, data?: any) => debug.warn(message, data),
  info: (message: string, data?: any) => debug.info(message, data),
  trace: (message: string, data?: any) => debug.trace(message, data)
};

// Environment detection helpers
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isTest = () => process.env.NODE_ENV === 'test';
export const isDebugEnabled = () => process.env.DEBUG === 'true';
