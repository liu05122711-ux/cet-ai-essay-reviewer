export type User = {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
};

export type Scores = {
  total: number;
  vocabulary: number;
  grammar: number;
  sentence_variety: number;
  coherence: number;
  task_completion: number;
  cet6_prediction: number;
  cet4_prediction: number;
};

export type Issue = {
  text: string;
  explanation: string;
  suggestion?: string | null;
};

export type Highlight = {
  start: number;
  end: number;
  type: "grammar" | "spelling" | "style";
  message: string;
  suggestion?: string | null;
};

export type ReviewResult = {
  scores: Scores;
  current_level: string;
  excellent_gap_analysis: string[];
  improve_to_80: string[];
  improve_to_90: string[];
  highlights: Highlight[];
  grammar_errors: Issue[];
  spelling_errors: Issue[];
  advanced_expressions: string[];
  vocabulary_replacements: Issue[];
  improvement_suggestions: string[];
  polished_version: string;
  high_score_sample: string;
  optimized_translation: string;
  version_80: string;
  version_90: string;
  full_score_sample: string;
};

export type Review = {
  id: number;
  title: string;
  prompt?: string | null;
  original_text: string;
  result: ReviewResult;
  created_at: string;
};

export type HistoryItem = {
  id: number;
  title: string;
  total_score: number;
  cet6_prediction: number;
  cet4_prediction: number;
  created_at: string;
};

export type AdminStats = {
  users_count: number;
  reviews_count: number;
  latest_reviews: Array<{
    id: number;
    title: string;
    user_id: number;
    total_score: number;
    created_at: string;
  }>;
};
