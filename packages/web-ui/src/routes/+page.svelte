<script lang="ts">
  import { onMount } from 'svelte';
  import { enhance } from '$app/forms';
  import type { PageData } from './$types.js';
  import Alert from '$lib/components/Alert.svelte';
  import Select from '$lib/components/Select.svelte';
  import Input from '$lib/components/Input.svelte';
  import Label from '$lib/components/Label.svelte';
  import Checkbox from '$lib/components/Checkbox.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { AliasPutBody } from './api/alias/+server.js';
  import { ipFromString, type IpString } from '@neat-dhcpd/common';
  import Textarea from '$lib/components/Textarea.svelte';
  import NetworkDevice from '$lib/components/NetworkDevice.svelte';
  import type { ReservedIpPutBody } from './api/reserved-ip/+server.js';
  import NetworkDeviceInput from '$lib/components/NetworkDeviceInput.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import RefreshCw from 'lucide-svelte/icons/refresh-cw';
  import type { DevicesGetResponse } from './api/devices/+server.js';
  import type { LogsGetResponse } from './api/logs/+server.js';

  export let data: PageData;

  let latestDevices = data.devices;
  let fetchingData = false;
  const refreshData = async () => {
    fetchingData = true;
    try {
      await fetch('/api/devices')
        .then((response) => response.json())
        .then((json: DevicesGetResponse) => {
          latestDevices = json;
        });
    } finally {
      fetchingData = false;
    }
  };

  let latestLogs = data.logs;
  let fetchingLogs = false;
  onMount(() => {
    const interval = setInterval(async () => {
      fetchingLogs = true;
      try {
        await fetch('/api/logs')
          .then((response) => response.json())
          .then((json: LogsGetResponse) => {
            latestLogs = json;
          });
      } finally {
        fetchingLogs = false;
      }
    }, 10_000);
    return () => clearInterval(interval);
  });

  let dnsValidationErrors: string[] = [];
  const validateDns = (text: string) => {
    dnsValidationErrors = [];
    const validatedDnses = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((dnsLine) => [dnsLine, ipFromString(dnsLine.trim())] as const);
    const invalidDnses = validatedDnses
      .filter(([_, ip]) => typeof ip === 'undefined')
      .map(([dns]) => dns);
    const validDnses = validatedDnses
      .filter(([_, ip]) => typeof ip !== 'undefined')
      .map(([dns]) => dns);

    if (invalidDnses.length > 0)
      dnsValidationErrors.push(`Invalid DNS value(s): ${invalidDnses.join(', ')}`);
    if (validDnses.length === 0) dnsValidationErrors.push('At least one valid DNS required');
  };

  let savingAlias = false;
  const saveAlias = (mac: string, alias: string) => {
    savingAlias = true;
    // TODO extract typesafe util fn (I would've expected that this would be provided by sveltekit?!)
    fetch('/api/alias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac, alias } satisfies AliasPutBody),
    }).finally(() => (savingAlias = false));
  };

  const setAlias =
    (mac: string, oldValue: string | undefined | null) => (e: CustomEvent<string>) => {
      const newValue = e.detail.trim();
      if (newValue === (oldValue || '')) return;
      saveAlias(mac, e.detail);
    };

  let savingIp = false;
  const saveReservedIp = (mac: string, reservedIp: IpString | undefined) => {
    savingIp = true;
    // TODO extract typesafe util fn (I would've expected that this would be provided by sveltekit?!)
    fetch('/api/reserved-ip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mac, reservedIp: reservedIp ?? '' } satisfies ReservedIpPutBody),
    }).finally(() => (savingIp = false));
  };

  const setReservedIp =
    (mac: string, oldValue: IpString | undefined | null) =>
    (e: CustomEvent<IpString | undefined>) => {
      const newValue = e.detail;
      if (newValue === oldValue) return;
      saveReservedIp(mac, e.detail);
    };

  const localeCompare = (a: string | undefined | null, b: string | undefined | null): number =>
    a && b ? a.localeCompare(b) : a ? -1 : b ? 1 : 0;

  let addingNewDevice = false;
</script>

<svelte:head>
  <title>NeatDHCPD</title>
</svelte:head>

<h1>NeatDHCPD</h1>

<form
  method="POST"
  action="?/config"
  use:enhance={() =>
    ({ update }) =>
      update({ reset: false })}
>
  <section>
    <h2>Config</h2>
    {#if !data.config?.broadcast_cidr}
      <Alert>No boardcast CIDR set!</Alert>
    {:else if data.ifaces.every((iface) => iface.cidr !== data.config?.broadcast_cidr)}
      <Alert>
        {data.config.broadcast_cidr} does not match an existing interface
      </Alert>
    {/if}
    <div class="container">
      <div>
        <Label>
          Broadcast CIDR
          <Select
            name="broadcastCidr"
            value={data.config?.broadcast_cidr}
            options={data.ifaces.map((iface) => ({
              label: `${iface.nic}: ${iface.cidr}`,
              value: iface.cidr ?? 'no-cidr',
            }))}
          />
        </Label>
      </div>
      <div>
        <Label>
          Start <Input name="ipStart" value={data.config?.ip_start} />
        </Label>
        <Label>
          End <Input name="ipEnd" value={data.config?.ip_end} />
        </Label>
      </div>
      <div>
        <Label>
          Leasetime <Input
            name="leaseTimeMinutes"
            type="number"
            value={data.config?.lease_time_minutes}
          />
        </Label>
        <Label>
          Gateway <Input name="gatewayIp" value={data.config?.gateway_ip} />
        </Label>
      </div>
      {#if dnsValidationErrors.length > 0}
        <Alert
          >{#each dnsValidationErrors as error}
            <div>{error}</div>
          {/each}</Alert
        >
      {/if}
      <Label>
        DNS
        <Textarea
          rows={4}
          name="dns"
          on:blur={(e) => validateDns(e.detail)}
          value={data.dnsIps.join('\n')}
        />
      </Label>
    </div>
    <div>
      <Label>
        Send replies <Checkbox name="sendReplies" checked={!!data.config?.send_replies} />
      </Label>
    </div>
    <div>
      <Label>
        Log level <Select
          name="logLevel"
          value={data.config?.log_level ?? 'log'}
          options={[
            { label: 'Error', value: 'error' },
            { label: 'Log', value: 'log' },
            { label: 'Debug', value: 'debug' },
          ]}
        />
      </Label>
    </div>
    <Button disabled={dnsValidationErrors.length > 0}>Sugmit</Button>
  </section>
</form>

<section>
  <div style:display="flex" style:align-items="center" style:gap="5px" style:margin-bottom="1em">
    <h2 style:margin="0">Network devices</h2>
    <Button on:click={refreshData} disabled={fetchingData}><RefreshCw slot="icon" /></Button>
    {#if !addingNewDevice}
      <Button on:click={() => (addingNewDevice = true)}>
        <Plus slot="icon" />Add unseen device
      </Button>
    {/if}
  </div>
  <div class="network-devices">
    {#if addingNewDevice}
      <NetworkDeviceInput
        on:cancel={() => (addingNewDevice = false)}
        on:add={(e) => {
          addingNewDevice = false;
          if (e.detail.name) saveAlias(e.detail.mac, e.detail.name);
          if (e.detail.ip) saveReservedIp(e.detail.mac, e.detail.ip);
        }}
      />
    {/if}
    {#each latestDevices
      .toSorted((a, b) => localeCompare(a.mac.address, b.mac.address))
      .toSorted((a, b) => localeCompare(a.hostname, b.hostname))
      .toSorted((a, b) => localeCompare(a.alias, b.alias))
      .toSorted((a, b) => localeCompare(a.leased_ip, b.leased_ip))
      .toSorted( (a, b) => localeCompare(a.reserved_ip, b.reserved_ip) ) as device (device.mac.address)}
      <NetworkDevice
        {device}
        on:aliasChange={setAlias(device.mac.address, device.alias)}
        on:reservedIpChange={setReservedIp(device.mac.address, device.reserved_ip)}
      />
    {/each}
  </div>
</section>

<section class="logs">
  <h2>Logs</h2>
  <!-- TODO add log level filtering-->
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>System</th>
        <th>JSON</th>
      </tr>
    </thead>
    <tbody>
      {#each latestLogs as log (log.timestamp)}
        <tr
          class:error={log.level === 'error'}
          class:log={log.level === 'log'}
          class:debug={log.level === 'debug'}
        >
          <td class="timestamp"><pre>{log.timestamp}</pre></td>
          <td>{log.system}</td>
          <td><pre>{log.json}</pre></td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style lang="scss">
  .network-devices {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: calc(var(--size-unit) * 2);
  }

  td.timestamp {
    white-space: nowrap;
  }

  .logs {
    max-height: 30em;

    .error {
      background-color: red;
    }

    .debug {
      opacity: 0.5;
    }
  }
</style>
