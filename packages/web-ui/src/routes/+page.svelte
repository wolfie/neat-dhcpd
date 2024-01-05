<script lang="ts">
  import { enhance } from "$app/forms";
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import Alert from "$lib/components/Alert.svelte";
  import Select from "$lib/components/Select.svelte";
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
</script>

<h1>NeatDHCP</h1>

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
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>
      Broadcast CIDR
      <Select
        name="broadcastCidr"
        options={data.ifaces.map((iface) => ({
          label: `${iface.nic}: ${iface.cidr}`,
          value: iface.cidr ?? "no-cidr",
        }))}
      />
    </label>
    <label>Start <input name="ipStart" value={data.config?.ip_start} /></label>
    <label>End <input name="ipEnd" value={data.config?.ip_end} /></label>
    <label>
      Leasetime <input
        name="leaseTimeMinutes"
        type="number"
        value={data.config?.lease_time_minutes}
      />
    </label>
    <label>
      Gateway <input name="gatewayIp" value={data.config?.gateway_ip} />
    </label>
    <label>DNS1 <input name="dns1" value={data.config?.dns1} /></label>
    <label>DNS2 <input name="dns2" value={data.config?.dns2} /></label>
    <label>DNS3 <input name="dns3" value={data.config?.dns3} /></label>
    <label>DNS4 <input name="dns4" value={data.config?.dns4} /></label>
    <label>
      Send replies <input
        name="sendReplies"
        type="checkbox"
        checked={!!data.config?.send_replies}
      />
    </label>
    <button>Sugmit</button>
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
          <th>First seen</th>
          <th>Last seen</th>
        </tr>
      </thead>
      <tbody>
        {#each seenMacs ?? data.seenMacs as seenMac (seenMac.mac)}
          <tr>
            <td><pre>{seenMac.mac}</pre></td>
            <td>{seenMac.vendor?.["Organization Name"] || ""}</td>
            <td><pre>{seenMac.first_seen}</pre></td>
            <td><pre>{seenMac.last_seen}</pre></td>
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
  td.timestamp {
    white-space: nowrap;
  }

  .logs {
    max-height: 20em;
  }
</style>
