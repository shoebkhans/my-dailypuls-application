export interface Lesson {
  id: string;
  topic: string;
  title: string;
  body: string;
  prompt: string;
}

export const lessons: Lesson[] = [
  {
    id: 'tiny-starts',
    topic: 'FOCUS · 2 MIN READ',
    title: 'Make the first step tiny',
    body: 'When a task feels too big, decide what the first two minutes look like. Starting is often the hardest part, and a small first move lowers the barrier.',
    prompt: 'What is the smallest useful step you can take today?',
  },
  {
    id: 'implementation-intentions',
    topic: 'HABITS · 2 MIN READ',
    title: 'Give a habit a place',
    body: 'Habits are easier to repeat when they have a clear cue. Attach a new action to something that already happens: after breakfast, stretch for one minute.',
    prompt: 'Which existing routine could hold a new habit?',
  },
  {
    id: 'attention',
    topic: 'WELLBEING · 2 MIN READ',
    title: 'Attention needs a little room',
    body: 'Switching between tasks has a cost. Try giving one small block of time to a single thing, then take a short pause before choosing what comes next.',
    prompt: 'What could you give your full attention for ten minutes?',
  },
  {
    id: 'rest',
    topic: 'REST · 2 MIN READ',
    title: 'Rest belongs in the plan',
    body: 'A pause is not a reward you have to earn. Short breaks can help attention recover; stand, look outside, drink some water, or simply do nothing for a moment.',
    prompt: 'What kind of break would feel genuinely restorative?',
  },
  {
    id: 'self-compassion',
    topic: 'REFLECTION · 2 MIN READ',
    title: 'Use a kinder inner voice',
    body: 'Self-compassion means responding to a difficult moment with honesty and care rather than judgment. It leaves room to learn without making one day your whole story.',
    prompt: 'What would you say to a friend in the same situation?',
  },
  {
    id: 'consistency',
    topic: 'HABITS · 2 MIN READ',
    title: 'A return is progress',
    body: 'Consistency does not require a perfect streak. When you miss a day, the next choice is a fresh opportunity to return to what matters to you.',
    prompt: 'What helps you restart after a busy day?',
  },
  {
    id: 'reflection',
    topic: 'MINDFULNESS · 2 MIN READ',
    title: 'Name what is happening',
    body: 'Putting a feeling into a few words can make it easier to notice and understand. You do not have to solve it immediately; noticing is already useful information.',
    prompt: 'What is one word for how this moment feels?',
  },
];

export function lessonForDay(date = new Date()): Lesson {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return lessons[dayOfYear % lessons.length]!;
}
