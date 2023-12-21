<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<h1>Logs</h1>

<table>
  <thead>
    <tr>
      <th>Timestamp</th>
      <th>System</th>
      <th>JSON</th>
    </tr>
  </thead>
  <tbody>
  {#each data.logs as log}
    <tr>
      <td class="timestamp">{log.timestamp}</td>
      <td>{log.system}</td>
      <td>{log.json}</td>
    </tr>
  {/each}
</tbody>
</table>

<style lang="scss">
  td.timestamp {
    white-space: nowrap;
  }
</style>