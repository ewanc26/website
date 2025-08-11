# Debugging Utility System

This directory contains a comprehensive debugging utility system that provides structured logging, performance monitoring, and debugging capabilities across your application.

## Features

- **Multi-level logging**: error, warn, info, debug, trace
- **Performance timing**: Built-in timing for functions and operations
- **Context tracking**: File, function, and component-specific debugging
- **Environment awareness**: Automatic detection of development/production modes
- **Memory monitoring**: Track memory usage when available
- **Structured output**: Consistent formatting with emojis and timestamps
- **Error context**: Rich error logging with stack traces
- **Circular reference handling**: Safe object serialization

## Quick Start

### Basic Usage

```typescript
import { debug, quickDebug } from '$lib/utils/debug.js';

// Simple logging
debug.info('Application started');
debug.warn('Deprecated feature used');
debug.error('Something went wrong');

// Quick debugging
quickDebug.log('Quick message');
quickDebug.error('Quick error');
```

### File-Specific Debugging

```typescript
import { createFileDebugger } from '$lib/utils/debug.js';

const debug = createFileDebugger('myFile.ts');

debug.enter('myFunction', { param1: 'value' });
debug.debug('Processing data...');
debug.exit('myFunction', { result: 'success' });
```

### Component Debugging

```typescript
import { createComponentDebugger } from '$lib/utils/debug.js';

const debug = createComponentDebugger('MyComponent');

debug.lifecycle('MyComponent', 'mounted', { props: componentProps });
debug.state('MyComponent', 'userData', { oldValue, newValue });
debug.interaction('click', 'submitButton', { formData });
```

### Performance Timing

```typescript
const timer = debug.time('expensiveOperation');
// ... do work ...
timer(); // Logs the duration
```

### Error Handling

```typescript
try {
  // ... risky operation ...
} catch (error) {
  debug.errorWithContext('Operation failed', error, {
    function: 'myFunction',
    additionalContext: 'extra info'
  });
}
```

## Configuration

The debugger automatically configures itself based on environment variables:

- `NODE_ENV=development` - Enables debugging
- `DEBUG=true` - Forces debugging on in production
- `DEBUG_LEVEL` - Set minimum log level (error, warn, info, debug, trace)

### Custom Configuration

```typescript
import { Debugger } from '$lib/utils/debug.js';

const customDebug = new Debugger({
  enabled: true,
  level: 'debug',
  prefix: '[CUSTOM]',
  includeTimestamp: true,
  includeStack: true,
  maxDepth: 5
});
```

## Log Levels

1. **error** ❌ - Critical errors that need immediate attention
2. **warn** ⚠️ - Warnings about potential issues
3. **info** ℹ️ - General information about application state
4. **debug** 🐛 - Detailed debugging information
5. **trace** 🔍 - Most verbose logging for deep debugging

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Good
debug.error('Database connection failed', error);
debug.warn('API rate limit approaching');
debug.info('User logged in successfully');
debug.debug('Processing request data');
debug.trace('Entering inner loop iteration');

// Avoid
debug.debug('CRITICAL ERROR: System down'); // Should be error
debug.info('Debug: variable value is 42'); // Should be debug
```

### 2. Provide Context

```typescript
// Good
debug.error('Failed to save user', error, {
  userId: user.id,
  operation: 'save',
  timestamp: new Date().toISOString()
});

// Avoid
debug.error('Failed to save user'); // No context
```

### 3. Use Function Entry/Exit

```typescript
async function processUser(userId: string) {
  debug.enter('processUser', { userId });
  
  try {
    const result = await doWork(userId);
    debug.exit('processUser', { success: true, result });
    return result;
  } catch (error) {
    debug.exit('processUser', { success: false, error });
    throw error;
  }
}
```

### 4. Performance Monitoring

```typescript
async function fetchData() {
  const timer = debug.time('fetchData');
  const memory = debug.memory('before fetch');
  
  try {
    const data = await api.get('/data');
    memory('after fetch');
    timer();
    return data;
  } catch (error) {
    timer();
    throw error;
  }
}
```

## Examples

### API Route Debugging

```typescript
// src/routes/api/users/+server.ts
import { createFileDebugger } from '$lib/utils/debug.js';

const debug = createFileDebugger('api/users/+server.ts');

export const GET = async ({ url }) => {
  debug.enter('GET', { url: url.toString() });
  
  try {
    const users = await getUsers();
    debug.info('Users retrieved successfully', { count: users.length });
    
    debug.exit('GET', { success: true, userCount: users.length });
    return json(users);
  } catch (error) {
    debug.errorWithContext('Failed to get users', error, { function: 'GET' });
    debug.exit('GET', { success: false, error });
    throw error;
  }
};
```

### Component Debugging

```typescript
// MyComponent.svelte
<script>
  import { createComponentDebugger } from '$lib/utils/debug.js';
  import { onMount } from 'svelte';
  
  const debug = createComponentDebugger('MyComponent');
  
  export let data;
  
  onMount(() => {
    debug.lifecycle('MyComponent', 'mounted', { hasData: !!data });
  });
  
  $effect(() => {
    debug.state('MyComponent', 'data', { data });
  });
</script>
```

### Service Layer Debugging

```typescript
// userService.ts
import { createFileDebugger } from '$lib/utils/debug.js';

const debug = createFileDebugger('userService.ts');

export class UserService {
  async createUser(userData: UserData) {
    debug.enter('createUser', { email: userData.email });
    const timer = debug.time('createUser');
    
    try {
      const user = await this.db.users.create(userData);
      debug.info('User created successfully', { userId: user.id });
      
      timer();
      debug.exit('createUser', { success: true, userId: user.id });
      return user;
    } catch (error) {
      debug.errorWithContext('Failed to create user', error, {
        function: 'createUser',
        userData: { email: userData.email }
      });
      
      timer();
      debug.exit('createUser', { success: false, error });
      throw error;
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | - | Set to 'development' to enable debugging |
| `DEBUG` | false | Force enable debugging |
| `DEBUG_LEVEL` | 'info' | Minimum log level |
| `DEBUG_PREFIX` | '[DEBUG]' | Custom log prefix |
| `DEBUG_TIMESTAMP` | true | Include timestamps |
| `DEBUG_STACK` | false | Include stack traces |

## Production Considerations

- Debugging is automatically disabled in production unless `DEBUG=true`
- Performance impact is minimal when disabled
- Sensitive data should never be logged
- Consider log aggregation services for production debugging

## Troubleshooting

### Debugging Not Working

1. Check `NODE_ENV` is set to 'development'
2. Verify `DEBUG=true` if in production
3. Ensure debug utility is imported correctly
4. Check browser console for any errors

### Too Much Logging

1. Increase log level: `DEBUG_LEVEL=warn`
2. Use more specific debuggers for targeted logging
3. Disable specific debuggers in production

### Performance Issues

1. Use `debug.time()` to identify slow operations
2. Monitor memory usage with `debug.memory()`
3. Consider reducing log level in performance-critical sections
