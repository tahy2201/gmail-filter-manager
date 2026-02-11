import type { DeleteRule, EmailPreview, FilterEntry, Label } from '@/types'

export const mockFilters: FilterEntry[] = [
  {
    id: '1',
    criteria: {
      from: '{github.com noreply@github.com}',
      subject: '{[GitHub] Pull Request}',
    },
    action: {
      label: 'GitHub',
      labelId: 'label_1',
      shouldArchive: true,
      shouldMarkAsRead: true,
    },
  },
  {
    id: '2',
    criteria: {
      from: 'notifications@slack.com',
    },
    action: {
      label: 'Slack',
      labelId: 'label_2',
      shouldArchive: true,
    },
  },
  {
    id: '3',
    criteria: {
      from: '{no-reply@accounts.google.com support@google.com}',
      hasTheWord: 'セキュリティ アラート',
    },
    action: {
      label: 'Google',
      labelId: 'label_3',
      shouldNeverSpam: true,
    },
  },
  {
    id: '4',
    criteria: {
      from: 'newsletter@example.com',
      subject: 'Weekly Newsletter',
    },
    action: {
      label: 'Newsletter',
      labelId: 'label_4',
      shouldArchive: true,
      shouldMarkAsRead: true,
      shouldNeverMarkAsImportant: true,
    },
  },
  {
    id: '5',
    criteria: {
      from: 'support@example.com',
      to: 'me@example.com',
    },
    action: {
      label: 'Support',
      labelId: 'label_5',
      forwardTo: 'forward@example.com',
    },
  },
  {
    id: '6',
    criteria: {
      subject: '{重要 urgent URGENT}',
      doesNotHaveTheWord: 'spam advertisement',
    },
    action: {
      label: 'Important',
      labelId: 'label_6',
    },
  },
  {
    id: '7',
    criteria: {
      from: 'notifications@twitter.com',
    },
    action: {
      label: 'Social',
      labelId: 'label_7',
      shouldArchive: true,
      shouldMarkAsRead: true,
    },
  },
  {
    id: '8',
    criteria: {
      from: 'no-reply@medium.com',
    },
    action: {
      label: 'Social',
      labelId: 'label_7',
      shouldArchive: true,
    },
  },
  {
    id: '9',
    criteria: {
      from: '{aws@amazon.com no-reply@aws.amazon.com}',
    },
    action: {
      label: 'AWS',
      labelId: 'label_8',
      shouldNeverSpam: true,
    },
  },
]

export const mockLabels: Label[] = [
  { id: 'label_1', name: 'GitHub', type: 'user' },
  { id: 'label_2', name: 'Slack', type: 'user' },
  { id: 'label_3', name: 'Google', type: 'user' },
  { id: 'label_4', name: 'Newsletter', type: 'user' },
  { id: 'label_5', name: 'Support', type: 'user' },
  { id: 'label_6', name: 'Important', type: 'user' },
  { id: 'label_7', name: 'Social', type: 'user' },
  { id: 'label_8', name: 'AWS', type: 'user' },
  { id: 'inbox', name: 'INBOX', type: 'system' },
  { id: 'sent', name: 'SENT', type: 'system' },
]

export const mockDeleteRules: DeleteRule[] = [
  { labelId: 'label_1', labelName: 'GitHub', delayDays: 30, enabled: true },
  { labelId: 'label_4', labelName: 'Newsletter', delayDays: 7, enabled: true },
  { labelId: 'label_7', labelName: 'Social', delayDays: 14, enabled: false },
]

export const mockEmails: EmailPreview[] = [
  {
    id: 'email_1',
    threadId: 'thread_1',
    subject: '[GitHub] Pull Request #123: Feature implementation',
    from: 'notifications@github.com',
    date: '2026-02-07T10:30:00Z',
    snippet: 'A new pull request has been opened...',
  },
  {
    id: 'email_2',
    threadId: 'thread_2',
    subject: 'Slack notification',
    from: 'notifications@slack.com',
    date: '2026-02-07T09:15:00Z',
    snippet: 'You have a new message from...',
  },
  {
    id: 'email_3',
    threadId: 'thread_3',
    subject: 'Weekly Newsletter #42',
    from: 'newsletter@example.com',
    date: '2026-02-06T08:00:00Z',
    snippet: 'Here are this week\'s top stories...',
  },
]
