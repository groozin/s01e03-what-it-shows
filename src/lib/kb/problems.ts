// What #4471 holds, counted the desk's way: each report under the cause it is filed under (causes.ts),
// and the reports the desk read as a one-day move (desk-notes.json) as a problem of their own. A month-first
// parser swaps day and month; it never moves a date by one day. Like CauseTable, a one-day move still
// counts where it is filed, so it is footnoted there too.
import { groupByCause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // How many of these reports are also counted under another problem.
  alsoIn: { problem: Problem; count: number }[];
};

function group(problem: Problem, rs: Report[]): Omit<ProblemGroup, 'alsoIn'> {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  const causes = groupByCause(reports, tenantOf).map((g) => ({
    ...group(g.cause, g.reports),
    alsoIn: [{ problem: 'one-day' as Problem, count: g.reports.filter((r) => oneDayMove.includes(r.id)).length }],
  }));
  const oneDay = moved.length
    ? [{ ...group('one-day', moved), alsoIn: causes.map((g) => ({ problem: g.problem, count: g.alsoIn[0].count })) }]
    : [];
  return [...causes, ...oneDay].map((g) => ({ ...g, alsoIn: g.alsoIn.filter((a) => a.count > 0) }));
}
