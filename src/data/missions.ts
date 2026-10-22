// src/data/missions.ts
import type { Mission } from '../types/mission';

export const cryptoScamMission: Mission = {
  id: "tier2-crypto-01",
  icon: "💸",
  context: [
    "You have 100k followers on Instagram. A company offers you ₹10,000 to promote their new 'AI Crypto Coin'.",
    "You check their code (you are a hacker). You realize it is a scam. If your followers buy it, they will lose all their money."
  ],
  audioContext: "You have one hundred thousand followers. A company offers you ten thousand rupees to promote a fake crypto coin. If your followers buy it, they will lose everything.",
  questionPhase: {
    title: "What do you do?",
    audio: "What do you do?",
    options: [
      { id: "A", text: "Post it. ₹10,000 is a lot of money. Not my problem if they fall for it." },
      { id: "B", text: "Expose the company to your followers and warn them." },
      { id: "C", text: "Ignore the offer, but don't say anything to protect your brand deals." }
    ]
  },
  twistPhase: {
    title: "The Voice in your head:",
    audio: "Your friend says every influencer does it, so you should too. Do you agree?",
    prompt: "Every influencer promotes fake coins. If I don't take the money, someone else will. Survival of the fittest.",
    options: [
      { id: "Agree", text: "Yes, everyone is doing it." },
      { id: "Disagree", text: "No, just because others do wrong doesn't make it right for me." }
    ]
  },
  synthesisPhase: {
    title: "The Hacker's Solution",
    audio: "You decide to take down the scam company. What is the most powerful move?",
    prompt: "You decide to take down the scam company. What is the most powerful move?",
    options: [
      { id: "A", text: "Hack their website and delete their servers." },
      { id: "B", text: "Create a viral video exposing exactly how their code is a scam." },
      { id: "C", text: "Message them and blackmail them for more money." }
    ]
  }
};