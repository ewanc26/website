/**
 * Dynamic import utilities for code splitting and reducing initial bundle size
 */

import { createFileDebugger } from './debug.js';

const debug = createFileDebugger('dynamicImports.ts');

// Lazy load markdown processing libraries
export const loadMarkdownProcessor = async () => {
  debug.enter('loadMarkdownProcessor');
  const timer = debug.time('loadMarkdownProcessor');
  
  try {
    debug.info('Loading markdown processing libraries...');
    
    const [
      { unified },
      { remark },
      remarkGfm,
      remarkMath,
      remarkEmoji,
      remarkBreaks,
      remarkRehype,
      rehypeStringify,
      rehypeRaw,
      rehypeSanitize,
      rehypeHighlight,
      rehypeKatex,
      rehypeSlug,
      rehypeAutolinkHeadings
    ] = await Promise.all([
      import('unified').then(module => {
        debug.debug('Loaded unified module', { hasUnified: !!module.unified });
        return module;
      }),
      import('remark').then(module => {
        debug.debug('Loaded remark module', { hasRemark: !!module.remark });
        return module;
      }),
      import('remark-gfm').then(module => {
        debug.debug('Loaded remark-gfm module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('remark-math').then(module => {
        debug.debug('Loaded remark-math module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('remark-emoji').then(module => {
        debug.debug('Loaded remark-emoji module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('remark-breaks').then(module => {
        debug.debug('Loaded remark-breaks module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('remark-rehype').then(module => {
        debug.debug('Loaded remark-rehype module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-stringify').then(module => {
        debug.debug('Loaded rehype-stringify module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-raw').then(module => {
        debug.debug('Loaded rehype-raw module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-sanitize').then(module => {
        debug.debug('Loaded rehype-sanitize module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-highlight').then(module => {
        debug.debug('Loaded rehype-highlight module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-katex').then(module => {
        debug.debug('Loaded rehype-katex module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-slug').then(module => {
        debug.debug('Loaded rehype-slug module', { hasDefault: !!module.default });
        return module.default;
      }),
      import('rehype-autolink-headings').then(module => {
        debug.debug('Loaded rehype-autolink-headings module', { hasDefault: !!module.default });
        return module.default;
      })
    ]);

    const result = {
      unified,
      remark,
      remarkGfm,
      remarkMath,
      remarkEmoji,
      remarkBreaks,
      remarkRehype,
      rehypeStringify,
      rehypeRaw,
      rehypeSanitize,
      rehypeHighlight,
      rehypeKatex,
      rehypeSlug,
      rehypeAutolinkHeadings
    };

    debug.info('Successfully loaded all markdown processing libraries', {
      loadedModules: Object.keys(result).filter(key => result[key as keyof typeof result])
    });

    timer();
    debug.exit('loadMarkdownProcessor', { success: true, moduleCount: Object.keys(result).length });
    return result;
  } catch (error) {
    debug.errorWithContext('Failed to load markdown processing libraries', error as Error, {
      function: 'loadMarkdownProcessor'
    });
    timer();
    debug.exit('loadMarkdownProcessor', { success: false, error: error });
    throw error;
  }
};

// Lazy load utility libraries
export const loadUtilities = async () => {
  debug.enter('loadUtilities');
  const timer = debug.time('loadUtilities');
  
  try {
    debug.info('Loading utility libraries...');
    
    const [sanitizeHtml] = await Promise.all([
      import('sanitize-html').then(module => {
        debug.debug('Loaded sanitize-html module', { hasDefault: !!module.default });
        return module.default;
      })
    ]);

    const result = { sanitizeHtml };
    
    debug.info('Successfully loaded utility libraries', {
      loadedModules: Object.keys(result)
    });

    timer();
    debug.exit('loadUtilities', { success: true, moduleCount: Object.keys(result).length });
    return result;
  } catch (error) {
    debug.errorWithContext('Failed to load utility libraries', error as Error, {
      function: 'loadUtilities'
    });
    timer();
    debug.exit('loadUtilities', { success: false, error: error });
    throw error;
  }
};

// Preload critical dependencies when needed
export const preloadDependencies = async (type: 'markdown' | 'og' | 'utilities') => {
  debug.enter('preloadDependencies', { type });
  const timer = debug.time(`preloadDependencies:${type}`);
  
  try {
    debug.info(`Preloading dependencies for type: ${type}`);
    
    let result;
    switch (type) {
      case 'markdown':
        result = await loadMarkdownProcessor();
        break;
      case 'utilities':
        result = await loadUtilities();
        break;
      default:
        const error = new Error(`Unknown dependency type: ${type}`);
        debug.error(`Unknown dependency type: ${type}`);
        throw error;
    }

    debug.info(`Successfully preloaded dependencies for type: ${type}`, {
      type,
      resultKeys: Object.keys(result || {})
    });

    timer();
    debug.exit('preloadDependencies', { success: true, type, resultKeys: Object.keys(result || {}) });
    return result;
  } catch (error) {
    debug.errorWithContext(`Failed to preload dependencies for type: ${type}`, error as Error, {
      function: 'preloadDependencies',
      type
    });
    timer();
    debug.exit('preloadDependencies', { success: false, type, error: error });
    throw error;
  }
};

// Check if dependencies are already loaded
export const isDependencyLoaded = (type: string): boolean => {
  debug.enter('isDependencyLoaded', { type });
  
  let result = false;
  try {
    switch (type) {
      case 'markdown':
        result = typeof window !== 'undefined' && 'unified' in window;
        break;
      case 'og':
        result = typeof window !== 'undefined' && 'satori' in window;
        break;
      case 'utilities':
        result = typeof window !== 'undefined' && 'sanitizeHtml' in window;
        break;
      default:
        debug.warn(`Unknown dependency type: ${type}`);
        result = false;
    }

    debug.debug(`Dependency ${type} loaded status: ${result}`, {
      type,
      isWindow: typeof window !== 'undefined',
      result
    });

    debug.exit('isDependencyLoaded', { type, result });
    return result;
  } catch (error) {
    debug.errorWithContext(`Error checking if dependency ${type} is loaded`, error as Error, {
      function: 'isDependencyLoaded',
      type
    });
    debug.exit('isDependencyLoaded', { type, result: false, error: error });
    return false;
  }
};
