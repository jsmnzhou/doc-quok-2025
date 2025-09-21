// Create a new file: src/data/workReminders.js
export const workReminders = [
  "Time to focus! Your tasks are waiting.",
  "Break time's over! Let's get back to work.",
  "Your code isn't going to write itself! 💻",
  "Remember what you're working on? Time to dive back in!",
  "Productivity mode: activated! 🚀",
  "Your to-do list misses you!",
  "Back to the grind! You've got this!",
  "Focus time! Distractions can wait.",
  "Ready to tackle your next task?",
  "The clock is ticking! Let's make progress.",
  "Deep work time! No distractions allowed.",
  "Your future self will thank you for working now!",
  "Let's crush those goals! Back to work!",
  "Time to channel your inner productivity guru!",
  "Work now, play later! You've got this!",
  "Your projects need your attention!",
  "No more procrastinating! Let's get things done.",
  "The most productive version of you is waiting!",
  "Back to work! Your goals aren't going to achieve themselves.",
  "Focus mode: engaged! Time to work magic! ✨"
];

export const getRandomReminder = () => {
  return workReminders[Math.floor(Math.random() * workReminders.length)];
};