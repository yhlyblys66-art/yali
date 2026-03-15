#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('molt')
  .description('MoltStream CLI — agent-native streaming infrastructure')
  .version('0.4.0');

program
  .command('init <name>')
  .description('Initialize a new MoltStream agent project')
  .option('-t, --template <template>', 'Project template', 'basic')
  .option('--platform <platform>', 'Target platform', 'mock')
  .action(async (name: string, opts: any) => {
    console.log(`\n  ⚡ Creating MoltStream agent: ${name}\n`);
    console.log(`  Template: ${opts.template}`);
    console.log(`  Platform: ${opts.platform}`);
    console.log(`\n  → Run 'cd ${name} && molt dev' to start\n`);
  });

program
  .command('dev')
  .description('Start local development server with mock platform')
  .option('-p, --port <port>', 'Dev server port', '4040')
  .action(async (opts: any) => {
    console.log(`\n  ⚡ MoltStream dev server starting on port ${opts.port}...`);
    console.log(`  Platform: mock (simulated audience)`);
    console.log(`  Traces: http://localhost:${opts.port}/traces\n`);
  });

program
  .command('stream')
  .description('Connect to a streaming platform and go live')
  .requiredOption('--platform <platform>', 'Target platform (twitch, youtube, kick)')
  .requiredOption('--key <key>', 'Stream key')
  .option('--policy <preset>', 'Policy preset', 'safe-mode')
  .action(async (opts: any) => {
    console.log(`\n  🔴 LIVE on ${opts.platform}`);
    console.log(`  Policy: ${opts.policy}`);
    console.log(`  Traces: streaming to stdout\n`);
  });

program
  .command('traces')
  .description('View reasoning traces from the last session')
  .option('-n, --limit <n>', 'Number of traces', '20')
  .option('--json', 'Output as JSON')
  .action(async (opts: any) => {
    console.log(`\n  📋 Last ${opts.limit} reasoning traces:\n`);
    console.log(`  (no session data found — run 'molt dev' first)\n`);
  });

program.parse();
