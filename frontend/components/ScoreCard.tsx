import type { Scores } from "@/lib/types";

const labels: Array<[keyof Scores, string]> = [
  ["vocabulary", "词汇丰富度"],
  ["grammar", "语法准确性"],
  ["sentence_variety", "句式多样性"],
  ["coherence", "逻辑连贯性"],
  ["task_completion", "任务完成度"],
];

export function ScoreCard({ scores }: { scores: Scores }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">综合评分</p>
          <div className="mt-1 text-5xl font-semibold text-ink">{scores.total}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-slate-500">六级预测</p>
            <p className="text-xl font-semibold text-brand">{scores.cet6_prediction}</p>
          </div>
          <div className="rounded-lg bg-teal-50 px-4 py-3">
            <p className="text-slate-500">四级预测</p>
            <p className="text-xl font-semibold text-mint">{scores.cet4_prediction}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {labels.map(([key, label]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="text-slate-500">{scores[key]}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${scores[key]}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

