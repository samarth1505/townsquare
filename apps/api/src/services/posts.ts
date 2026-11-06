const AUTHORS = ["Asha", "Ravi", "Meera", "Kabir", "Isha", "Dev"];
const TOPICS = [
  "React",
  "TypeScript",
  "Flutter",
  "Node",
  "CSS",
  "Testing",
  "Performance",
  "Accessibility",
];

export const POSTS = Array.from({ length: 60 }, (_, i) => ({
  id: `p${i + 1}`,
  title: `${TOPICS[i % TOPICS.length]} tip #${i + 1}`,
  author: AUTHORS[i % AUTHORS.length] ?? "Anon",
  excerpt: `A short note about ${TOPICS[i % TOPICS.length]} from the community, number ${i + 1}.`,
  likes: ((i * 7) % 50) + 3,
  createdAt: new Date(Date.UTC(2026, 9, 1) + i * 5 * 3600_000).toISOString(),
}));

export type Post = (typeof POSTS)[number];

// The full text for a detail page (generated, since this is a demo).
export function bodyFor(post: Post): string[] {
  return [
    post.excerpt,
    `${post.author} shares this tip because small habits add up: read the code you did not write, measure before you optimise, and explain your reasoning out loud.`,
    "Try it in your own project this week, then tell the community what changed.",
  ];
}

export const imageUrlFor = (origin: string, post: Post) => `${origin}/images/${post.id}.svg`;
