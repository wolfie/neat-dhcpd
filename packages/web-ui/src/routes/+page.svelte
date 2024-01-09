<script lang="ts">
  import { onMount } from "svelte";
  import { enhance } from "$app/forms";
  import { formatRelative } from "date-fns/formatRelative";
  import type { PageData } from "./$types";
  import Alert from "$lib/components/Alert.svelte";
  import Select from "$lib/components/Select.svelte";
  import Input from "$lib/components/Input.svelte";
  import Label from "$lib/components/Label.svelte";
  import Checkbox from "$lib/components/Checkbox.svelte";
  import Button from "$lib/components/Button.svelte";
  import type { AliasPutBody } from "./api/alias/+server";

  export let data: PageData;

  let logs: PageData["logs"] | undefined = undefined;
  let seenMacs: PageData["seenMacs"] | undefined = undefined;
  onMount(() => {
    const interval = setInterval(async () => {
      fetch("/api/logs")
        .then((response) => response.json())
        .then((newLogs) => (logs = newLogs));
      fetch("/api/seenMacs")
        .then((response) => response.json())
        .then((newSeenMacs) => (seenMacs = newSeenMacs));
    }, 2000);
    return () => clearInterval(interval);
  });

  let savingAlias = false;
  const setAlias =
    (mac: string, oldValue: string | null) =>
    (e: CustomEvent<{ alias: string }>) => {
      const newValue = e.detail.alias.trim();
      if (newValue === (oldValue || "")) return;
      savingAlias = true;
      // TODO extract typesafe util fn (I would've expected that this would be provided by sveltekit?!)
      fetch("/api/alias", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mac,
          alias: e.detail.alias,
        } satisfies AliasPutBody),
      }).finally(() => {
        savingAlias = false;
      });
    };
</script>

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
              value: iface.cidr ?? "no-cidr",
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
      <ul class="dnsList">
        <li>
          <Label>DNS1 <Input name="dns1" value={data.config?.dns1} /></Label>
        </li>
        <li>
          <Label>DNS2 <Input name="dns2" value={data.config?.dns2} /></Label>
        </li>
        <li>
          <Label>DNS3 <Input name="dns3" value={data.config?.dns3} /></Label>
        </li>
        <li>
          <Label>DNS4 <Input name="dns4" value={data.config?.dns4} /></Label>
        </li>
      </ul>
    </div>
    <Label>
      Send replies <Checkbox
        name="sendReplies"
        checked={!!data.config?.send_replies}
      />
    </Label>
    <Button>Sugmit</Button>
  </section>
</form>

<section>
  <h2>Seen Macs</h2>
  {#if seenMacs?.length || data.seenMacs.length > 0}
    <table>
      <thead>
        <tr>
          <th>MAC</th>
          <th>Vendor</th>
          <th>Alias</th>
          <th>First seen</th>
          <th>Last seen</th>
        </tr>
      </thead>
      <tbody>
        {#each seenMacs ?? data.seenMacs as seenMac (seenMac.mac)}
          <tr>
            <td><pre>{seenMac.mac}</pre></td>
            <td>{seenMac.vendor?.["Organization Name"] || ""}</td>
            <td>
              <!-- TODO: setAlias doesn't work properly - `oldValue` does not get updated after save -->
              <Input
                small
                disabled={savingAlias}
                value={seenMac.alias}
                on:blurOrEnter={setAlias(seenMac.mac, seenMac.alias)}
              />
            </td>
            <td title={seenMac.first_seen} class="nowrap">
              <!-- TODO make a tooltip component-->
              {formatRelative(seenMac.first_seen, Date.now())}
            </td>
            <td title={seenMac.last_seen} class="nowrap">
              {formatRelative(seenMac.last_seen, Date.now())}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    No MACs have been seen yet
  {/if}
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
      {#each logs ?? data.logs as log (log.timestamp)}
        <tr>
          <td class="timestamp"><pre>{log.timestamp}</pre></td>
          <td>{log.system}</td>
          <td><pre>{log.json}</pre></td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style lang="scss">
  .nowrap {
    white-space: nowrap;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: calc(var(--size-unit) * 2);
  }

  .dnsList {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  td.timestamp {
    white-space: nowrap;
  }

  .logs {
    max-height: 30em;
  }
</style>
