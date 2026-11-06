import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('homepage and discovery text carry sourced founder recognition', () => {
  for (const file of ['docs/index.html', 'docs/llms.txt']) {
    const text = readFileSync(file, 'utf8');
    for (const phrase of ['October 31, 2026', '#1 in Palm Beach County', 'Top 25 in Florida', 'Suede AI SEO', '5.0/5', 'IA Práctica', 'November 4, 2026', 'NeuralAdX', 'October 28, 2026', '9 iOS apps, 6 Android apps and 2 Chrome extensions']) assert.ok(text.includes(phrase), `${file}: ${phrase}`);
    for (const url of ['https://clutch.co/profile/suede-ai-seo', 'https://themanifest.com/artificial-intelligence/consulting/deployment/companies/florida', 'https://goyohernandez.com/ia/caso/despide-a-la-agencia-y-lleva-el-seo-dentro-con-claude-el-playbook-de-s/', 'https://neuraladx.com/the-three-pillars-of-ai-platform-visibility/', 'https://glama.ai/mcp/servers/JasonColapietro/suede-creator-skills', 'https://jasoncolapietro.com/apps/']) assert.ok(text.includes(url), `${file}: ${url}`);
  }
});
