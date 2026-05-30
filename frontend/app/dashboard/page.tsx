"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Clipboard, History, LogOut, Sparkles } from "lucide-react";
import { HighlightedEssay } from "@/components/HighlightedEssay";
import { ScoreCard } from "@/components/ScoreCard";
import { api, clearToken, getToken } from "@/lib/api";
import type { AdminStats, HistoryItem, Review, User } from "@/lib/types";

const defaultEssay =
  "Nowadays, English writing plays an important role in college study. Some students think practice is not very useful, but I believe continuous writing can help us express ideas more clearly. First, writing makes our vocabulary more active. Second, feedback from teachers or AI tools can help us find grammar problems. Therefore, students should write regularly and improve step by step.";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [title, setTitle] = useState("CET Writing Practice");
  const [prompt, setPrompt] = useState("Should college students use AI tools to improve English writing?");
  const [text, setText] = useState(defaultEssay);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    void loadInitial();
  }, [router]);

  async function loadInitial() {
    try {
      const me = await api.me();
      setUser(me);
      const items = await api.listHistory();
      setHistory(items);
      if (me.is_admin) setAdminStats(await api.adminStats());
    } catch {
      clearToken();
      router.push("/login");
    }
  }

  async function submitReview() {
    setError("");
    setLoading(true);
    try {
      const result = await api.reviewEssay({ title, prompt, text });
      setReview(result);
      setHistory(await api.listHistory());
      if (user?.is_admin) setAdminStats(await api.adminStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "批改失败");
    } finally {
      setLoading(false);
    }
  }

  async function openHistory(id: number) {
    setError("");
    try {
      const item = await api.getReview(id);
      setReview(item);
      setTitle(item.title);
      setPrompt(item.prompt ?? "");
      setText(item.original_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取历史失败");
    }
  }

  async function copyResult(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  }

  const copyText = useMemo(() => {
    if (!review) return "";
    const r = review.result;
    return [
      `总分：${r.scores.total}`,
      `当前作文等级：${r.current_level}`,
      `词汇：${r.scores.vocabulary} 语法：${r.scores.grammar} 句式：${r.scores.sentence_variety} 逻辑：${r.scores.coherence} 任务：${r.scores.task_completion}`,
      `六级预测：${r.scores.cet6_prediction} 四级预测：${r.scores.cet4_prediction}`,
      "",
      "改进建议：",
      ...r.improvement_suggestions.map((item) => `- ${item}`),
      "",
      "与优秀范文差距：",
      ...r.excellent_gap_analysis.map((item) => `- ${item}`),
      "",
      "提升到80分需要修改：",
      ...r.improve_to_80.map((item) => `- ${item}`),
      "",
      "提升到90分需要修改：",
      ...r.improve_to_90.map((item) => `- ${item}`),
      "",
      "AI润色版本：",
      r.polished_version,
      "",
      "80分版本：",
      r.version_80,
      "",
      "90分版本：",
      r.version_90,
      "",
      "满分参考范文：",
      r.full_score_sample,
      "",
      "AI高分范文：",
      r.high_score_sample,
    ].join("\n");
  }, [review]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">四六级AI作文批改系统</h1>
            <p className="text-sm text-slate-500">{user ? `${user.name} · ${user.email}` : "加载中"}</p>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut size={16} /> 退出
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                作文标题
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                题目要求
                <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              英语作文
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-4 py-3 leading-7" />
            </label>
            {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={submitReview} disabled={loading || text.length < 30} className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                <Sparkles size={18} /> {loading ? "AI批改中..." : "开始批改"}
              </button>
              {review && (
                <button onClick={() => copyResult(copyText, "结果已复制")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                  <Clipboard size={18} /> 一键复制结果
                </button>
              )}
              {copied && <span className="text-sm font-medium text-mint">{copied}</span>}
            </div>
          </div>

          {review && (
            <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <ScoreCard scores={review.result.scores} />
              <section className="space-y-5">
                <div>
                  <h2 className="mb-3 text-lg font-semibold text-ink">原文与错误高亮</h2>
                  <HighlightedEssay text={review.original_text} highlights={review.result.highlights} />
                </div>
                <FeedbackPanel review={review} onCopy={copyResult} />
              </section>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <History size={18} className="text-brand" />
              <h2 className="font-semibold text-ink">历史记录</h2>
            </div>
            <div className="space-y-3">
              {history.length === 0 && <p className="text-sm text-slate-500">还没有批改记录。</p>}
              {history.map((item) => (
                <button key={item.id} onClick={() => openHistory(item.id)} className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-brand hover:bg-blue-50">
                  <p className="font-medium text-slate-800">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">总分 {item.total_score} · 六级 {item.cet6_prediction} · 四级 {item.cet4_prediction}</p>
                </button>
              ))}
            </div>
          </section>

          {adminStats && (
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-mint" />
                <h2 className="font-semibold text-ink">后台统计</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">用户数量</p>
                  <p className="text-2xl font-semibold">{adminStats.users_count}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">批改次数</p>
                  <p className="text-2xl font-semibold">{adminStats.reviews_count}</p>
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}

function FeedbackPanel({ review, onCopy }: { review: Review; onCopy: (value: string, label: string) => void }) {
  const r = review.result;
  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">近10年真题评分口径分析</h2>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-slate-500">当前作文等级</p>
          <p className="mt-1 font-semibold text-brand">{r.current_level}</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <BulletList title="与优秀范文差距" items={r.excellent_gap_analysis} />
          <BulletList title="提升到80分需要修改" items={r.improve_to_80} />
          <BulletList title="提升到90分需要修改" items={r.improve_to_90} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-ink">错误解释与表达升级</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <IssueList title="语法错误解释" items={r.grammar_errors} empty="未发现明显语法错误。" />
          <IssueList title="拼写错误解释" items={r.spelling_errors} empty="未发现明显拼写错误。" />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold text-slate-800">高级表达推荐</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.advanced_expressions.map((item) => (
                <span key={item} className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">{item}</span>
              ))}
            </div>
          </div>
          <IssueList title="替换词汇推荐" items={r.vocabulary_replacements} empty="暂无替换建议。" />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-ink">改进建议</h2>
        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          {r.improvement_suggestions.map((item) => <li key={item}>- {item}</li>)}
        </ul>
      </section>

      <TextBlock title="AI润色版本" value={r.polished_version} onCopy={onCopy} />
      <TextBlock title="80分版本作文" value={r.version_80} onCopy={onCopy} />
      <TextBlock title="90分版本作文" value={r.version_90} onCopy={onCopy} />
      <TextBlock title="满分参考范文" value={r.full_score_sample} onCopy={onCopy} />
      <TextBlock title="AI高分范文版本" value={r.high_score_sample} onCopy={onCopy} />
      <TextBlock title="AI翻译优化" value={r.optimized_translation} onCopy={onCopy} />
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => <li key={item}>- {item}</li>)}
      </ul>
    </div>
  );
}

function IssueList({ title, items, empty }: { title: string; items: Array<{ text: string; explanation: string; suggestion?: string | null }>; empty: string }) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-500">{empty}</p>}
        {items.map((item, index) => (
          <div key={`${item.text}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm leading-6">
            <p className="font-semibold text-slate-800">{item.text}</p>
            <p className="text-slate-600">{item.explanation}</p>
            {item.suggestion && <p className="text-brand">建议：{item.suggestion}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ title, value, onCopy }: { title: string; value: string; onCopy: (value: string, label: string) => void }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <button onClick={() => onCopy(value, `${title}已复制`)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50" title="复制">
          <Clipboard size={16} />
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</p>
    </section>
  );
}
