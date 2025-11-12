export interface JobConfig {
  name: string;
  schedule: string;
  urlPath: string;
  enabled?: boolean;
}

export const JOB_CONFIGS: JobConfig[] = [
  {
    name: 'Daily Balance Report',
    schedule: '0 0 * * *', // Diario a medianoche
    urlPath: '/api/v1/metrics/execute-daily-balance-report',
    enabled: true,
  },
  {
    name: 'Document Processor',
    schedule: '*/5 * * * *', // Cada 5 minutos
    urlPath: '/api/v1/document/execute-document-processor',
    enabled: true,
  },
  {
    name: 'Deposits Validator',
    schedule: '* * * * *', // Cada minuto
    urlPath: '/api/v1/deposits/execute-deposits-validator',
    enabled: true,
  },
  {
    name: 'Withdrawals Validator',
    schedule: '*/5 * * * *', // Cada 5 minutos
    urlPath: '/api/v1/withdrawals/execute-withdraws-validator',
    enabled: true,
  },
  {
    name: 'Animalitos Results Generator',
    schedule: '*/15 * * * *', // Cada 15 minutos
    urlPath: '/api/v1/animalitos/execute-animalitos-results-generator',
    enabled: true,
  },
  {
    name: 'Domino Review Transactions',
    schedule: '*/15 * * * *', // Cada 15 minutos
    urlPath: '/api/v1/domino/execute-review-transactions',
    enabled: true,
  },
  {
    name: 'Domino Create Daily Tournament',
    schedule: '*/30 * * * *', // Cada 30 minutos
    urlPath: '/api/v1/domino/execute-create-daily-tournament',
    enabled: true,
  },
  {
    name: 'Domino Clean Lobbies',
    schedule: '*/5 * * * *', // Cada 5 minutos
    urlPath: '/api/v1/domino/execute-clean-lobbies',
    enabled: true,
  },
  {
    name: 'Domino Clean Ingame AFK',
    schedule: '*/15 * * * *', // Cada 15 minutos
    urlPath: '/api/v1/domino/execute-clean-ingame-afk',
    enabled: true,
  },
  {
    name: 'Referred Tasks Checker',
    schedule: '5,20,35,50 * * * *', // Minutos 5, 20, 35, 50
    urlPath: '/api/v1/referrals/execute-referred-tasks-checker',
    enabled: true,
  },
  {
    name: 'Referral Payments Reviewer',
    schedule: '10,40 * * * *', // Minutos 10 y 40
    urlPath: '/api/v1/referrals/execute-referral-payments-reviewer',
    enabled: true,
  },
  {
    name: 'Referring Tasks Checker',
    schedule: '0,15,30,45 * * * *', // Cada 15 minutos en punto
    urlPath: '/api/v1/referrals/execute-referring-tasks-checker',
    enabled: true,
  },
  {
    name: 'RB Laws',
    schedule: '0 */4 * * *', // Cada 4 horas
    urlPath: '/api/v1/wallet-movements/execute-rb-laws',
    enabled: true,
  },
  {
    name: 'Casino Ranking Review Tournaments',
    schedule: '*/10 * * * *', // Cada 10 minutos
    urlPath: '/api/v1/casino-ranking/execute-review-tournaments',
    enabled: true,
  },
  {
    name: 'Casino Ranking Update Tournament Status',
    schedule: '*/5 * * * *', // Cada 5 minutos
    urlPath: '/api/v1/casino-ranking/execute-update-tournament-status',
    enabled: true,
  },
];
