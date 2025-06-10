#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Safe fetch function for error handling
 */
async function safeFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Network error fetching ${url}:`, error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch ${url}: ${error.message}`);
    } else {
      throw new Error(`Failed to fetch ${url}: An unknown error occurred`);
    }
  }
}

/**
 * Resolves a handle or DID to a DID
 */
async function resolveToDID(user) {
  // If it's already a DID, return it
  if (user.startsWith('did:')) {
    return user;
  }

  // Otherwise, treat it as a handle and resolve it
  try {
    console.log(`Resolving handle ${user} to DID...`);
    const profile = await safeFetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${user}`
    );

    if (!profile.did) {
      throw new Error(`No DID found for handle ${user}`);
    }

    console.log(`Resolved ${user} to DID: ${profile.did}`);
    return profile.did;
  } catch (error) {
    throw new Error(`Failed to resolve handle ${user} to DID: ${error.message}`);
  }
}

/**
 * Generates the .well-known/atproto-did file
 */
async function generateAtProtoDID() {
  try {
    // Load environment variables from .env file if it exists
    let envVars = {};
    try {
      const envContent = readFileSync('.env', 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    } catch {
      console.log('No .env file found, checking environment variables...');
    }

    // Get the user from environment variables (check both .env and process.env)
    const user = envVars.PUBLIC_ATPROTOCOL_USER || process.env.PUBLIC_ATPROTOCOL_USER;

    if (!user) {
      throw new Error('PUBLIC_ATPROTOCOL_USER environment variable is not set');
    }

    console.log(`Generating .well-known/atproto-did for user: ${user}`);

    // Resolve to DID if necessary
    const did = await resolveToDID(user);

    // Ensure the .well-known directory exists
    const wellKnownDir = join(__dirname, '..', 'static', '.well-known');
    mkdirSync(wellKnownDir, { recursive: true });

    // Write the DID to the file
    const didFilePath = join(wellKnownDir, 'atproto-did');
    writeFileSync(didFilePath, did, 'utf8');

    console.log(`✅ Successfully generated ${didFilePath} with DID: ${did}`);
  } catch (error) {
    console.error('❌ Error generating .well-known/atproto-did:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAtProtoDID();
}

export { generateAtProtoDID };