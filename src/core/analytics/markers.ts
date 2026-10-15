// src/core/analytics/markers.ts
//
// Cross-lingual marker dictionary.
// Every Indian child writes differently — code-mixed, transliterated,
// non-standard English. This file captures all reasoning moves across
// the languages Class 5-10 children actually write in.

export type MarkerType =
  | 'causal'
  | 'contrast'
  | 'conditional'
  | 'alternative'
  | 'hedge'
  | 'absolute'
  | 'evidence'
  | 'source'
  | 'question'
  | 'uncertainty'
  | 'metacognition'
  | 'circular';

// Every marker is expressed as a regex pattern.
// We check all of them per answer.
export const MARKERS: Record<MarkerType, RegExp> = {
  // "because", "since", "so", "that's why"
  // Hindi: "kyunki", "isliye", "kyon ki", "ki"
  // Marathi: "karan", "mhanun", "ka"
  // Devanagari: कारण, म्हणून, क्योंकि, इसलिए, तो
  causal: /\b(because|since|so|therefore|that is why|thats why|which means|as a result|hence|thus|hence|for that reason)\b|kyunki|kyonki|isliye|is lie|is vajah se|karan|mhanun|mhanje|कारण|म्हणून|क्योंकि|इसलिए|तो(?=\s)|हेतो|यामुळे|यासाठी/gi,

  // "but", "however", "although", "even though"
  // Hindi: "lekin", "par", "phir bhi"
  // Marathi: "pan", "tari"
  // Devanagari: लेकिन, पर, पण, तरी
  contrast: /\b(but|however|although|though|yet|even though|on the other hand|nevertheless|in contrast)\b|lekin|par\b|phir bhi|magar|pan\b|tari|पण|तरी|लेकिन|परंतु|तथापि|असूनही|फिरभी/gi,

  // "if", "then", "unless", "would"
  // Hindi: "agar", "to", "jab tak"
  // Marathi: "jar", "tar", "toparyant"
  // Devanagari: अगर, तो, जर, तर
  conditional: /\b(if|then|unless|otherwise|would|will|might|suppose|imagine if)\b|agar|agar\b|to\b|jab tak|jar\b|tar\b|अगर|तो|जर|तर|तरच|अन्यथा/gi,

  // "or", "maybe", "another", "also", "either"
  // Hindi: "ya", "shayad", "dusra"
  // Marathi: "kinva", "kadachit", "dusra"
  // Devanagari: या, शायद, किंवा, कदाचित, दुसरा
  alternative: /\b(or|maybe|perhaps|another|also|either|alternatively|as well|other possibility|different reason)\b|ya\b|shayad|kadachit|kinva|dusra|dusri|दुसरा|दुसरी|किंवा|शायद|कदाचित|या\b/gi,

  // "maybe", "I think", "possibly", "could"
  hedge: /\b(maybe|perhaps|probably|possibly|might|could|i think|i guess|i believe|it seems|appears|sort of|kind of|not sure|unsure)\b|shayad|kadachit|ho sakta|lagta hai|शायद|कदाचित|हो सकता|वाटतं|असू शकतं|जाणवतं/gi,

  // "always", "never", "definitely", "obviously"
  // Hindi: "hamesha", "kabhi nahi", "bilkul"
  // Marathi: "nehmi", "kadhich", "nakki"
  absolute: /\b(always|never|definitely|obviously|everyone|certainly|for sure|without a doubt|no one|nobody|all people|every single)\b|hamesha|kabhi nahi|kabhi bhi nahi|bilkul|nekki|nehmi|kadhich|नहमी|कधीच|हमेशा|कभी नहीं|बिलकुल|नक्की|सगळेच/gi,

  // "I saw", "I noticed", "I observed", "the table shows"
  // Hindi: "maine dekha", "dhyan diya"
  // Marathi: "mi pahile", "lakshat ale"
  // Devanagari: मैंने देखा, मी पाहिले, लक्षात आलं
  evidence: /\b(i saw|i noticed|i observed|i felt|i touched|i checked|the table shows|the image shows|the photo shows|the picture shows|i could see|i could tell)\b|maine dekha|maine notice kiya|dhyan diya|mi pahile|mi baghitla|lakshaat aala|lakshaat ale|मैंने देखा|मैंने नोटिस|ध्यान दिया|मी पाहिले|मी पाहिलं|लक्षात आलं|लक्षात आला/gi,

  // "they said", "someone said", "everyone says", "according to"
  // Hindi: "unhone kaha", "sab kehte hain"
  // Marathi: "tyanni mhanale", "sagle mhantat"
  source: /\b(they said|he said|she said|someone said|everyone says|people say|according to|i heard|i read|told me|mentioned that|it is said)\b|unhone kaha|usne kaha|sab kehte|sagle mhantat|tyanni mhanale|aikla|वाचलं|ऐकलं|म्हणाले|सांगितलं|कहा|बोला|सुना/gi,

  // Any question mark or embedded question
  question: /\?|\b(why|how come|what if|what makes|how do we know|what about|but what|who says|is it|can it|could it)\b|kaise|kyun|ka\b|kay|कसा|कसं|का\b|काय|क्यों|कैसे|क्या होगा/gi,

  // "I don't know if...", specific uncertainty
  uncertainty: /\b(don't know|do not know|not sure|i wonder|i'm not certain|unclear|can't tell|hard to say|need to know)\b|pata nahi|mala mahit nahi|mala mahit naahi|samjat nahi|पता नहीं|माहित नाही|समजत नाही|कळत नाही/gi,

  // Metacognitive markers — thinking about thinking
  metacognition: /\b(at first i thought|then i|i changed my mind|before i thought|now i think|i used to think|i was wrong|i realised|i realized|upon thinking|looking back|i wondered|it occurred to me)\b|pehle lagta tha|pehle laga|ab lagta hai|pahile vatle|aata vatata|pahile vataycha|आता वाटतं|पहिले वाटलं|पहले लगा|अब लगता है|मला वाटलं/gi,

  // Circular reasoning markers
  circular: /\b(because it is|because it just is|that's how it is|that's just how|because that's what|it is what it is)\b|aisa hi hai|aise hi hota hai|असंच असतं|असंच होतं|ऐसा ही है|ऐसे ही होता है/gi,
};

// Every language the app supports — for language detection per answer
export const DEVANAGARI = /[\u0900-\u097F]/;
export const LATIN_INDIC = /\b(kya|kyun|kaise|kab|kahan|kaun|hai|hain|nahi|nahin|tha|thi|the|mein|me|ek|do|teen|aur|bahut|accha|sahi|galat|kyunki|isliye|lekin|par|agar|to|ya|shayad|hamesha|kabhi|kadachit|karan|mhanun|pan|tari|jar|tar|kinva|mi|mala|tula|tyala|aamhi|tumhi|te|ti|he|hi|hota|hoti|hote|kartat|karto)\b/gi;

// Normalisation — Indian English quirks
export const NORMALISE: Array<[RegExp, string]> = [
  [/\bcoz\b/gi, 'because'],
  [/\bbcz\b/gi, 'because'],
  [/\bbcos\b/gi, 'because'],
  [/\bcuz\b/gi, 'because'],
  [/\bw\/\b/gi, 'with'],
  [/\bu\b/g, 'you'],
  [/\bur\b/gi, 'your'],
  [/\bplz\b/gi, 'please'],
  [/\bpls\b/gi, 'please'],
  [/\bthx\b/gi, 'thanks'],
  [/\bwht\b/gi, 'what'],
  [/\bnw\b/gi, 'now'],
  [/\bhv\b/gi, 'have'],
  [/\bcz\b/gi, 'because'],
  // Indian English emphasis — remove for scoring, keep readable
  [/\bonly\b(?=\s+(?:then|after|because|so|that|this))\b/gi, ''],
  [/\bitself\b(?=\s+(?:is|was|has|have|had))/gi, ''],
  // Collapse multiple spaces
  [/\s+/g, ' '],
];

export function normalise(text: string): string {
  let out = ' ' + text + ' ';
  for (const [pattern, replacement] of NORMALISE) {
    out = out.replace(pattern, replacement);
  }
  return out.trim();
}

// Helper: count matches of a marker type in a text
export function countMarkers(text: string, type: MarkerType): number {
  const normalised = normalise(text.toLowerCase());
  const pattern = MARKERS[type];
  const matches = normalised.match(pattern);
  return matches ? matches.length : 0;
}

// Helper: is this text primarily English, Devanagari, or mixed?
export function detectLanguage(text: string): 'english' | 'devanagari' | 'mixed' | 'hinglish' {
  const hasDevanagari = DEVANAGARI.test(text);
  const latinMatches = text.match(LATIN_INDIC);
  const latinIndicCount = latinMatches ? latinMatches.length : 0;
  const wordCount = text.trim().split(/\s+/).length;

  if (hasDevanagari && latinIndicCount > 0) return 'mixed';
  if (hasDevanagari) return 'devanagari';
  if (wordCount > 0 && latinIndicCount / wordCount > 0.15) return 'hinglish';
  return 'english';
}
