<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  // Where each problem is tracked now: problem → link.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const channels = (g: { channels: Record<string, number> }) =>
    Object.entries(g.channels)
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `${c} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
  {#if rows.length !== merged.length}<span class="muted">({rows.length} rows in the export: {rows.length - merged.length} came twice)</span>{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>tracked in</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}{#if g.alsoIn.length}<span class="muted"> · {g.alsoIn.map((a) => `${a.count} also in ${a.problem}`).join(', ')}</span>{/if}</td>
        <td class="muted">{channels(g)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, 'issue #')}</a>{:else}—{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="muted">Counted the desk's way: a report counts under the cause it is filed under, and a one-day move counts there
  too. Each problem is one ticket; the reports column is how many reports that ticket covers.</p>

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
</style>
