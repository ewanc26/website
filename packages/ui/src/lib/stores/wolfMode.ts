import { writable } from 'svelte/store';

const browser = typeof window !== 'undefined';

const wolfSounds = [
	'awoo', 'awooo', 'howl', 'ahroo', 'owww', 'yip', 'yap', 'arf', 'ruff', 'woof',
	'grr', 'grrr', 'growl', 'snarl', 'whine', 'whimper', 'bark', 'yowl', 'yelp', 'huff'
];

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
					if (newValue) enableWolfMode();
					else disableWolfMode();
				}
				return newValue;
			});
		},
		enable: () => { set(true); if (browser) enableWolfMode(); },
		disable: () => { set(false); if (browser) disableWolfMode(); }
	};
}

function getWolfSoundByPosition(position: number): string {
	return wolfSounds[position % wolfSounds.length];
}

function getWolfSoundForWord(word: string, position: number): string {
	const normalizedWord = word.toLowerCase();
	if (wordToSoundMap.has(normalizedWord)) return wordToSoundMap.get(normalizedWord)!;
	const wolfSound = getWolfSoundByPosition(position);
	wordToSoundMap.set(normalizedWord, wolfSound);
	return wolfSound;
}

function isNumberAbbreviation(text: string): boolean {
	return /^\d+\.?\d*[a-zA-Z]+$/.test(text);
}

function hasAlphabeticalCharacters(text: string): boolean {
	return /[a-zA-Z]/.test(text);
}

function shouldTransform(word: string): boolean {
	if (!hasAlphabeticalCharacters(word)) return false;
	if (isNumberAbbreviation(word)) return false;
	return true;
}

function splitWordAndPunctuation(token: string): { prefix: string; word: string; suffix: string } {
	const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
	if (match) return { prefix: match[1], word: match[2], suffix: match[3] };
	return { prefix: '', word: token, suffix: '' };
}

function convertToWolfSpeak(text: string, startPosition: number): string {
	const words = text.split(/(\s+)/);
	let currentPosition = startPosition;
	return words.map((token) => {
		if (token.trim().length === 0) return token;
		const { prefix, word, suffix } = splitWordAndPunctuation(token);
		if (!shouldTransform(word)) return token;
		const wolfSound = getWolfSoundForWord(word, currentPosition);
		currentPosition++;
		let transformedWord = wolfSound;
		if (word === word.toUpperCase() && word.length > 1) transformedWord = wolfSound.toUpperCase();
		else if (word[0] === word[0].toUpperCase()) transformedWord = wolfSound.charAt(0).toUpperCase() + wolfSound.slice(1);
		return prefix + transformedWord + suffix;
	}).join('');
}

function shouldSkipElement(element: Element): boolean {
	if (element.hasAttribute('aria-label')) {
		const label = element.getAttribute('aria-label') || '';
		if (label.includes('wolf mode') || label.includes('theme') || label.includes('mode')) return true;
	}
	if (element.closest('header button')) return true;
	if (element.tagName === 'NAV' || element.closest('nav')) return true;
	return false;
}

function walkTextNodes(node: Node, callback: (textNode: Text) => void) {
	if (node.nodeType === Node.TEXT_NODE) {
		callback(node as Text);
	} else if (node.nodeType === Node.ELEMENT_NODE) {
		const element = node as Element;
		if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || shouldSkipElement(element)) return;
		for (const child of Array.from(node.childNodes)) walkTextNodes(child, callback);
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
			textNode.textContent = convertToWolfSpeak(originalText, wordCounter);
			wordCounter += originalText.split(/\s+/).filter((w) => {
				const { word } = splitWordAndPunctuation(w);
				return shouldTransform(word);
			}).length;
		}
	});
}

function disableWolfMode() {
	originalTexts.forEach((originalText, textNode) => {
		if (textNode.parentNode) textNode.textContent = originalText;
	});
	originalTexts.clear();
	wordToSoundMap.clear();
	wordCounter = 0;
}

export const wolfMode = createWolfModeStore();
