import type {MetadataRoute} from 'next';
export const dynamic = 'force-static';
const paths=['','ai-infrastructure','ai-compute','agent-factory','agentops','finops','rag','mcp','ai-security','private-hybrid-ai','solutions/customer-service','solutions/finance','solutions/it-operations','solutions/hr','solutions/procurement','industries/financial-services','industries/manufacturing','industries/healthcare','industries/public-sector','industries/retail','company','how-we-work','contact','start-assessment','presentations','presentations/newneo','presentations/engagement'];
export default function sitemap():MetadataRoute.Sitemap{return paths.map(path=>({url:`https://www.newneo.ai/${path ? `${path}/` : ''}`,changeFrequency:path?'monthly':'weekly',priority:path?0.8:1}))}
