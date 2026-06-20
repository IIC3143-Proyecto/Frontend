export type TagCategories = Record<string, string[]>;

export type TagDto = { id: number; title: string; category: string };

export type TagsByCategoryDto = {
  tags: TagCategories;
};

export type UserTagPreferenceDto = {
  userId: string;
  tagId: number;
  tag: { id: number; title: string; category: string };
  score: number;
  updatedAtUtcMinus3: string;
};
