<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { updated } from "$app/stores";

  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<div class="root">
  <nav>
    <ol>
      <li><a href="/">Root</a></li>
      <li><a href="/config">Config</a></li>
      <li><a href="/logs">Logs</a></li>
    </ol>
  </nav>

  <main>
    <slot />
  </main>
</div>

<style lang="scss">
  :global(html) {
    height: 100%;
  }

  :global(body) {
    margin: 0;
    height: 100%;
  }

  .root {
    display: flex;
    height: 100%;

    nav {
      background-color: grey;
      margin-right: 1em;
      padding: 1em;

      ol {
        padding: 0;
        margin: 0;
        list-style-type: none;
      }
    }
  }
</style>
