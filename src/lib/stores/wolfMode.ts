import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Refined English onomatopoeic wolf/canine sounds
const wolfSounds = [
	'awoo',
	'awooo',
	'howl',
	'ahroo',
	'owww',
	'yip',
	'yap',
	'arf',
	'ruff',
	'woof',
	'grr',
	'grrr',
	'growl',
	'snarl',
	'whine',
	'whimper',
	'bark',
	'yowl',
	'yelp',
	'huff'
];

// Store original text content
let originalTexts = new Map<Node, string>();
let wordCounter = 0;
let wordToSoundMap = new Map<string, string>();

function createWolfModeStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		toggle: () => {
			update((value) => {
				const newValue = !value;
				if (browser) {
					if (newValue) {
						enableWolfMode();
					} else {
						disableWolfMode();
					}
				}
				return newValue;
			});
		},
		enable: () => {
			set(true);
			if (browser) enableWolfMode();
		},
		disable: () => {
			set(false);
			if (browser) disableWolfMode();
		}
	};
}

function getWolfSoundByPosition(position: number): string {
	// Use modulo to cycle through wolf sounds based on word position
	return wolfSounds[position % wolfSounds.length];
}

function getWolfSoundForWord(word: string, position: number): string {
	// Normalize the word to lowercase for consistent mapping
	const normalizedWord = word.toLowerCase();

	// If we've seen this word before, return the same sound
	if (wordToSoundMap.has(normalizedWord)) {
		return wordToSoundMap.get(normalizedWord)!;
	}

	// Otherwise, assign a new sound based on position and store it
	const wolfSound = getWolfSoundByPosition(position);
	wordToSoundMap.set(normalizedWord, wolfSound);
	return wolfSound;
}

function isNumberAbbreviation(text: string): boolean {
	// Check for number abbreviations like 1K, 2M, 3B, 1d, 30s, 2h, etc.
	// Pattern: starts with digits, optionally has decimals, ends with letter abbreviation
	return /^\d+\.?\d*[a-zA-Z]+$/.test(text);
}

function hasAlphabeticalCharacters(text: string): boolean {
	return /[a-zA-Z]/.test(text);
}

function shouldTransform(word: string): boolean {
	// Don't transform if it's purely non-alphabetical
	if (!hasAlphabeticalCharacters(word)) {
		return false;
	}

	// Don't transform if it's a number abbreviation
	if (isNumberAbbreviation(word)) {
		return false;
	}

	return true;
}

function splitWordAndPunctuation(token: string): { prefix: string; word: string; suffix: string } {
	// Match leading punctuation, word, and trailing punctuation
	const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);

	if (match) {
		return {
			prefix: match[1],
			word: match[2],
			suffix: match[3]
		};
	}

	// If no match, treat entire token as word
	return {
		prefix: '',
		word: token,
		suffix: ''
	};
}

function convertToWolfSpeak(text: string, startPosition: number): string {
	// Split by words and replace each with a wolf sound
	const words = text.split(/(\s+)/); // Keep whitespace
	let currentPosition = startPosition;

	return words
		.map((token) => {
			if (token.trim().length === 0) {
				return token; // Preserve whitespace
			}

			// Split word from surrounding punctuation
			const { prefix, word, suffix } = splitWordAndPunctuation(token);

			// Only transform words that should be transformed
			if (!shouldTransform(word)) {
				return token; // Keep numbers, abbreviations, punctuation, etc. as-is
			}

			const wolfSound = getWolfSoundForWord(word, currentPosition);
			currentPosition++;

			// Apply capitalization pattern to the wolf sound
			let transformedWord = wolfSound;
			if (word === word.toUpperCase() && word.length > 1) {
				transformedWord = wolfSound.toUpperCase();
			} else if (word[0] === word[0].toUpperCase()) {
				transformedWord = wolfSound.charAt(0).toUpperCase() + wolfSound.slice(1);
			}

			// Reconstruct with original punctuation
			return prefix + transformedWord + suffix;
		})
		.join('');
}

function shouldSkipElement(element: Element): boolean {
	// Skip navigation buttons, specifically the wolf and theme toggles
	if (element.hasAttribute('aria-label')) {
		const label = element.getAttribute('aria-label') || '';
		if (label.includes('wolf mode') || label.includes('theme') || label.includes('mode')) {
			return true;
		}
	}

	// Skip buttons in the header navigation
	if (element.closest('header button')) {
		return true;
	}

	// Skip nav elements
	if (element.tagName === 'NAV' || element.closest('nav')) {
		return true;
	}

	return false;
}

function walkTextNodes(node: Node, callback: (textNode: Text) => void) {
	if (node.nodeType === Node.TEXT_NODE) {
		callback(node as Text);
	} else if (node.nodeType === Node.ELEMENT_NODE) {
		const element = node as Element;

		// Skip script, style tags, and navigation elements
		if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || shouldSkipElement(element)) {
			return;
		}

		for (const child of Array.from(node.childNodes)) {
			walkTextNodes(child, callback);
		}
	}
}

function enableWolfMode() {
	originalTexts.clear();
	wordToSoundMap.clear();
	wordCounter = 0;

	walkTextNodes(document.body, (textNode) => {
		const originalText = textNode.textContent || '';
		if (originalText.trim().length > 0) {
			originalTexts.set(textNode, originalText);
			const transformedText = convertToWolfSpeak(originalText, wordCounter);
			textNode.textContent = transformedText;
			// Update counter based on number of transformable words processed
			wordCounter += originalText.split(/\s+/).filter((w) => {
				const { word } = splitWordAndPunctuation(w);
				return shouldTransform(word);
			}).length;
		}
	});
}

function disableWolfMode() {
	originalTexts.forEach((originalText, textNode) => {
		if (textNode.parentNode) {
			textNode.textContent = originalText;
		}
	});
	originalTexts.clear();
	wordToSoundMap.clear();
	wordCounter = 0;
}

export const wolfMode = createWolfModeStore();
