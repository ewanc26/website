export function updateCopyrightYear(): void {
  if (typeof document === 'undefined') return;
  
  const currentYear: number = new Date().getFullYear();
  const copyrightElement: HTMLElement | null = document.getElementById("copyright-year");

  if (copyrightElement) {
    copyrightElement.textContent = currentYear.toString();
    console.debug(`Copyright year updated to ${currentYear}`);
  } else {
    console.warn("Copyright year element not found.");
  }
}