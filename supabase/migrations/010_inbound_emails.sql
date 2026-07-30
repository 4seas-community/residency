create table inbound_emails (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete set null,
  email_log_id uuid references email_log(id) on delete set null,
  message_id text not null unique,
  in_reply_to text,
  references_header text,
  from_address text not null,
  from_name text,
  subject text not null default '',
  body_text text not null default '',
  received_at timestamptz not null,
  mailbox_uid bigint,
  mailbox_uidvalidity text,
  matched_by text check (matched_by in ('message_id', 'sender', 'unmatched')),
  created_at timestamptz not null default now()
);

create index inbound_emails_application_idx on inbound_emails (application_id, received_at desc);
create index inbound_emails_unmatched_idx on inbound_emails (received_at desc) where application_id is null;

alter table inbound_emails enable row level security;
