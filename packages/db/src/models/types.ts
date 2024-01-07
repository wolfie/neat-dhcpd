import type { Generated } from "kysely";

export type LogTable = {
  timestamp: Generated<string>;
  level: string;
  system: string;
  json: string;
};

export type ConfigTable = {
  ip_start: string;
  ip_end: string;
  lease_time_minutes: number;
  gateway_ip: string;
  dns1: string;
  dns2: string | null;
  dns3: string | null;
  dns4: string | null;
  send_replies: number;
  broadcast_cidr: string | null;
};

export type OfferTable = {
  mac: string;
  ip: string;
  expires_at: string;
  offered_at: Generated<string>;
  lease_time_secs: number;
};

export type LeaseTable = {
  mac: string;
  ip: string;
  expires_at: string;
};

export type AliasTable = {
  mac: string;
  alias: string;
  added_at: Generated<string>;
};

export type SeenMacTable = {
  mac: string;
  first_seen: Generated<string>;
  last_seen: Generated<string>;
};

export type Database = {
  log: LogTable;
  config: ConfigTable;
  lease: LeaseTable;
  alias: AliasTable;
  offer: OfferTable;
  seen_mac: SeenMacTable;
};
