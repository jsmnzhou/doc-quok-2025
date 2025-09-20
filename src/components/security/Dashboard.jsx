import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ShieldCheck, RefreshCcw, FileSearch2, Bug, AlarmClock } from "lucide-react";

export default function Dashboard({ summary, onRescan }) {
  const s = summary ?? {
    scanned: 42873, durationMs: 37500, lastRun: new Date().toISOString(),
    threats: { critical: 0, high: 1, medium: 4, low: 12, quarantined: 5 },
  };

  const sev = [
    { name: "Low", v: s.threats.low, fill: "hsl(190 90% 50%)" },
    { name: "Med", v: s.threats.medium, fill: "hsl(45 95% 55%)" },
    { name: "High", v: s.threats.high, fill: "hsl(12 95% 55%)" },
    { name: "Quar", v: s.threats.quarantined, fill: "hsl(270 80% 65%)" },
  ];

  const detectionRate = Math.max(5, Math.min(100, Math.round(((s.threats.high + s.threats.medium + s.threats.low) / s.scanned) * 1000)));

  return (
    <div className="dash-shell">
      <div className="dash-header">
        <h1><ShieldCheck size={18}/> Quokka AV — Report</h1>
        <div className="dash-actions">
          <button className="btn ghost" onClick={onRescan}><RefreshCcw size={14}/> Rescan</button>
        </div>
      </div>

      <section className="cards">
        <Card title="Files Scanned" icon={<FileSearch2 size={16}/>}>{s.scanned.toLocaleString()}</Card>
        <Card title="Total Findings" icon={<Bug size={16}/>}>
          {s.threats.low + s.threats.medium + s.threats.high}
        </Card>
        <Card title="Quarantined" icon={<AlarmClock size={16}/>}>{s.threats.quarantined}</Card>
        <Card title="Last Run">{new Date(s.lastRun).toLocaleString()}</Card>
      </section>

      <section className="panels">
        <div className="panel">
          <h3>Severity Mix</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sev}>
              <CartesianGrid vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Detection Rate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart innerRadius="60%" outerRadius="100%" startAngle={90} endAngle={-270}
              data={[{ name: "Rate", value: detectionRate, fill: "hsl(150 90% 45%)" }]}>
              <RadialBar dataKey="value" cornerRadius={20} />
              <Tooltip />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="big">
                {detectionRate}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel wide">
          <h3>Recent Events</h3>
          <div className="events">
            {[
              { t: "Trojan.JS.Misc", sev: "High", path: "C:/Temp/build/cache-01.js", action: "Quarantined" },
              { t: "Adware.Bundle", sev: "Low", path: "C:/Users/Public/tool.exe", action: "Ignored" },
              { t: "Heuristic.Generic", sev: "Medium", path: "C:/ProgramData/x.tmp", action: "Flagged" },
            ].map((e, i) => (
              <div key={i} className={`event s-${e.sev.toLowerCase()}`}>
                <span className="badge">{e.sev}</span>
                <div className="event-main">
                  <div className="event-title">{e.t}</div>
                  <div className="event-sub">{e.path}</div>
                </div>
                <div className="event-action">{e.action}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuokkaCallout />
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="card">
      <div className="card-top">
        <span className="muted">{icon} {title}</span>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function QuokkaCallout() {
  const sprite = new URL("../../sprites/quokka.png", import.meta.url).href;
  return (
    <div className="callout">
      <img src={sprite} alt="Quokka" />
      <div>
        <div className="callout-title">All clear (mostly).</div>
        <div className="callout-sub">1 high-severity item quarantined. Review when ready.</div>
      </div>
    </div>
  );
}