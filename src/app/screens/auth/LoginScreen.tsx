import { useState } from "react";
import { BarChart2, Brain, GraduationCap, Shield, Sparkles, Trophy } from "lucide-react";
import { P } from "../../constants/theme.constants";
import type { Role } from "../../models/app.model";

// ─── 1. LOGIN ─────────────────────────────────────────────────

export function LoginScreen({ onLogin }: { onLogin: (r: Role) => void }) {
  const [email, setEmail] = useState("alex.mercer@adiu.com");
  const [pw, setPw] = useState("••••••••••");
  const [selRole, setSelRole] = useState<Role>("learner");

  return (
    <div className="min-h-screen flex" style={{ background: P.bg }}>
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12"
        style={{ background: P.deepOlive }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: P.olive }}
          >
            <GraduationCap size={18} className="text-white" />
          </div>
          <p
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            LearnOS
          </p>
        </div>
        <div className="space-y-8">
          <div>
            <h1
              className="text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              Your enterprise
              <br />
              learning platform,
              <br />
              <span style={{ color: P.gold }}>supercharged by AI</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: P.sage }}>
              Upskill your workforce at scale with intelligent, personalized, and measurable
              learning experiences.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Brain,
                label: "AI-Powered Learning",
                desc: "Personalized paths that adapt to your role",
              },
              {
                icon: Trophy,
                label: "Gamified Progress",
                desc: "XP, badges, and leaderboards to stay motivated",
              },
              {
                icon: BarChart2,
                label: "Deep Analytics",
                desc: "Real-time insights for HR, managers, and learners",
              },
              {
                icon: Shield,
                label: "Enterprise Security",
                desc: "SSO, compliance-ready, SOC 2 certified",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(107,122,58,0.25)" }}
                >
                  <Icon size={15} style={{ color: P.sage }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs" style={{ color: P.sage }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[P.olive, P.gold, P.sage, P.darkOlive].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: c, borderColor: P.deepOlive }}
              >
                {["AM", "SK", "JO", "PR"][i]}
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: P.sage }}>
            <span className="text-white font-semibold">12,400+</span> learners at ADIU Communication
            Service PLC
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: P.olive }}
            >
              <GraduationCap size={15} className="text-white" />
            </div>
            <p className="text-base font-bold" style={{ color: P.text }}>
              LearnOS
            </p>
          </div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: P.textMuted }}>
            Sign in to your ADIU Communication Service PLC learning portal
          </p>

          <div className="space-y-2.5 mb-6">
            {[
              ["M", "#2563EB", "Continue with Microsoft SSO"],
              ["G", P.darkOlive, "Continue with Okta SSO"],
            ].map(([letter, color, label]) => (
              <button
                key={label}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
                data-prototype-action="true"
              >
                <div
                  className="w-4 h-4 rounded-sm flex items-center justify-center"
                  style={{ background: color }}
                >
                  <span className="text-white text-[8px] font-bold">{letter}</span>
                </div>
                {label}
              </button>
            ))}
          </div>

          <div className="relative flex items-center mb-6">
            <div className="flex-1" style={{ borderTop: `1px solid ${P.border}` }} />
            <span className="mx-3 text-xs" style={{ color: P.textMuted }}>
              or sign in with email
            </span>
            <div className="flex-1" style={{ borderTop: `1px solid ${P.border}` }} />
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.text }}>
                Work email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-xs font-semibold" style={{ color: P.text }}>
                  Password
                </label>
                <button
                  className="text-xs font-medium"
                  style={{ color: P.olive }}
                  data-prototype-action="true"
                >
                  Forgot?
                </button>
              </div>
              <input
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg focus:outline-none bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>

          <div
            className="mb-5 p-3 rounded-lg"
            style={{ background: P.lightSage, border: `1px solid ${P.sage}50` }}
          >
            <p
              className="text-[11px] font-semibold mb-2 flex items-center gap-1.5"
              style={{ color: P.darkOlive }}
            >
              <Sparkles size={11} style={{ color: P.gold }} /> Demo: Choose your role
            </p>
            <div className="grid grid-cols-5 gap-1">
              {(
                [
                  ["learner", "Learner"],
                  ["hr", "HR"],
                  ["manager", "Mgr"],
                  ["creator", "Creator"],
                  ["admin", "Admin"],
                ] as [Role, string][]
              ).map(([r, l]) => (
                <button
                  key={r}
                  onClick={() => setSelRole(r)}
                  className="text-[10px] py-1 rounded font-medium transition-colors"
                  style={
                    selRole === r ? { background: P.olive, color: "white" } : { color: P.darkOlive }
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onLogin(selRole)}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
            style={{ background: P.olive }}
          >
            Sign in to LearnOS
          </button>
          <p className="text-[11px] text-center mt-5" style={{ color: P.textMuted }}>
            Protected by enterprise SSO & MFA ·{" "}
            <span className="cursor-pointer hover:underline" style={{ color: P.olive }}>
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
