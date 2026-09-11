const lifecycle = ['Discover', 'Build', 'Deploy', 'Operate', 'Improve'];

const pillars = [
  ['01', 'AI Agents', 'Role-based agents designed around real business responsibilities.'],
  ['02', 'Workflows', 'Multi-step, multi-agent execution with human approval when needed.'],
  ['03', 'Knowledge', 'Enterprise RAG, documents, policies and trusted business context.'],
  ['04', 'Integrations', 'CRM, ERP, ITSM, APIs, databases and internal systems.'],
  ['05', 'AI Operations', 'Quality, cost, latency, reliability, governance and continuous improvement.'],
];

const agents = [
  ['AI Instructor', 'Knowledge & Learning', '2,341 interactions', '94% resolution'],
  ['IT Support Agent', 'Employee Operations', '1,280 tickets', '81% autonomous'],
  ['Customer Service Agent', 'Customer Operations', '9,402 conversations', '92% resolution'],
];

export default function Home() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand">new<span>neo</span></div>
        <div className="navlinks">
          <a href="#platform">Platform</a>
          <a href="#operations">Operations</a>
          <a href="#solutions">Solutions</a>
          <select className="lang" defaultValue="en" aria-label="Language">
            <option value="en">EN</option>
            <option value="pt-BR">PT</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
          <a className="cta" href="#contact">Talk to NewNeo</a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">Enterprise AI Operations</div>
          <h1>AI that does the work.<br/><span className="gradient">And keeps getting better.</span></h1>
          <p className="lead">NewNeo designs, deploys and operates enterprise AI agents across your business — from first workflow to production-scale AI workforce.</p>
          <div className="actions">
            <a className="cta" href="#operations">Explore the platform</a>
            <a className="ghost" href="#contact">Start with a workflow</a>
          </div>
        </div>
        <div className="flowcard">
          <div className="flowtitle">From process to production AI</div>
          <div className="flow">
            {lifecycle.map((step, i) => (
              <div className="flowstep" key={step}>
                <b>0{i + 1}</b><strong>{step}</strong><span className="status">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="platform">
        <div className="sectionhead">
          <div><div className="eyebrow">One platform</div><h2>The operating layer for enterprise AI.</h2></div>
          <p>You do not need another agent builder. NewNeo connects intelligence to enterprise knowledge, systems and workflows — then operates the result in production.</p>
        </div>
        <div className="grid5">
          {pillars.map(([num, title, text]) => (
            <article className="card" key={title}>
              <div className="num">{num}</div><h3>{title}</h3><p>{text}</p><div className="bar" />
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="operations">
        <div className="sectionhead">
          <div><div className="eyebrow">NewNeo Console</div><h2>Operate your AI workforce.</h2></div>
          <p>See whether AI is actually working: tasks completed, autonomous resolution, human escalation, cost, quality and health — by agent and by workflow.</p>
        </div>
        <div className="console">
          <div className="consoleTop"><div><strong>AI Workforce Overview</strong><br/><small>Production environment · Last 30 days</small></div><span className="health">● Overall healthy</span></div>
          <div className="metrics">
            <div className="metric"><small>Active agents</small><strong>12</strong></div>
            <div className="metric"><small>Work executed</small><strong>18,420</strong></div>
            <div className="metric"><small>Success rate</small><strong>96.8%</strong></div>
            <div className="metric"><small>Human escalation</small><strong>3.2%</strong></div>
          </div>
          <div className="agents">
            {agents.map(([name, area, volume, outcome]) => (
              <article className="agent" key={name}>
                <div className="agentHead"><strong><span className="dot" />{name}</strong><small>Healthy</small></div>
                <p>{area}</p><div className="kpis"><span><b>{volume}</b></span><span>{outcome}</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="solutions">
        <div className="sectionhead">
          <div><div className="eyebrow">Start focused. Scale everywhere.</div><h2>Four high-value entry points.</h2></div>
          <p>NewNeo begins with a measurable workflow, proves the economics, then expands the same operating model across the enterprise.</p>
        </div>
        <div className="grid5" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          {[
            ['NewNeo Service','Customer service, support, sales and collections.'],
            ['NewNeo Work','Employee agents, internal workflows and business operations.'],
            ['NewNeo Ops','IT, NOC, SOC, troubleshooting and operational response.'],
            ['NewNeo Learn','AI instructors, corporate knowledge, RAG and learning experiences.'],
          ].map(([title,text]) => <article className="card" key={title}><h3 style={{marginTop:12}}>{title}</h3><p>{text}</p><div className="bar" /></article>)}
        </div>
      </section>

      <footer className="footer" id="contact"><strong>newneo.ai</strong><span>Discover → Build → Deploy → Operate → Improve</span></footer>
    </main>
  );
}
