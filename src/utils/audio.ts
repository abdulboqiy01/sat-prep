/**
 * Audio pronunciation utility using HTML5 Web Speech Synthesis API.
 * Provides high-fidelity, native English pronunciation for SAT academic vocabulary.
 */

export function speakWord(word: string, lang = 'en-US'): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.88; // Slightly deliberate pace for clear SAT phonetic articulation
    utterance.pitch = 1.0;

    // Select natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}
