import type { Generated } from 'kysely';
import type { ZIpString } from '../lib/zIpString.js';

export type LogTable = {
  timestamp: Generated<string>;
  level: string;
  system: string;
  json: string;
};

export type ConfigTable = {
  ip_start: ZIpString;
  ip_end: ZIpString;
  lease_time_minutes: number;
  gateway_ip: ZIpString;
  send_replies: number;
  broadcast_cidr: string | null;
  log_level: string;
};

export type OfferTable = {
  mac: string;
  ip: ZIpString;
  expires_at: string;
  offered_at: Generated<string>;
  lease_time_secs: number;
};

export type LeaseTable = {
  mac: string;
  ip: ZIpString;
  leased_at: Generated<string>;
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

export type MetaTable = {
  last_startup: string;
};

export type SeenHostnameTable = {
  mac: string;
  hostname: string;
  last_updated: Generated<string>;
};

export type ReservedIpTable = {
  mac: string;
  ip: ZIpString;
  last_updated: Generated<string>;
};

export type DhcpOptionTable = {
  option: number;
  value_json: string;
};

export type Database = {
  log: LogTable;
  config: ConfigTable;
  lease: LeaseTable;
  alias: AliasTable;
  offer: OfferTable;
  seen_mac: SeenMacTable;
  meta: MetaTable;
  seen_hostname: SeenHostnameTable;
  reserved_ip: ReservedIpTable;
  dhcp_option: DhcpOptionTable;
};
