"use client";

import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

type Props = {
  mode: "login" | "register";
  error: string;
  loading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthCard({ mode, error, loading, onSubmit }: Props) {
  const isLogin = mode === "login";
  return (
    <main className="min-h-screen bg-paper px-5 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-white">
            <BookOpenCheck size={26} />
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-normal text-ink md:text-5xl">四六级AI作文批改系统</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              面向大学英语四级、六级写作训练，自动评分、定位错误、生成润色版本和高分范文。
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-3 gap-3 text-sm">
            {["多维评分", "错误高亮", "历史追踪"].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-ink">{isLogin ? "登录账号" : "创建账号"}</h2>
          <p className="mt-2 text-sm text-slate-500">{isLogin ? "继续查看你的作文批改记录。" : "注册后即可保存每次批改结果。"}</p>
          <div className="mt-6 space-y-4">
            {!isLogin && (
              <label className="block text-sm font-medium text-slate-700">
                昵称
                <input name="name" className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" placeholder="例如：Li Hua" required />
              </label>
            )}
            <label className="block text-sm font-medium text-slate-700">
              邮箱
              <input name="email" type="email" className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" placeholder="you@example.com" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              密码
              <input name="password" type="password" minLength={8} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3" placeholder="至少 8 位" required />
            </label>
          </div>
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button disabled={loading} className="mt-6 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "处理中..." : isLogin ? "登录" : "注册"}
          </button>
          <p className="mt-5 text-center text-sm text-slate-500">
            {isLogin ? "还没有账号？" : "已经有账号？"}
            <Link className="ml-1 font-semibold text-brand" href={isLogin ? "/register" : "/login"}>
              {isLogin ? "立即注册" : "去登录"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

