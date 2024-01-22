<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import '@fontsource-variable/montserrat';
  import '@fontsource-variable/roboto-mono';

  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<div class="root">
  <main>
    <slot />
  </main>
</div>

<style lang="scss">
  @use 'sass:color';

  @function size($a) {
    @return calc(var(--size-unit) * $a);
  }

  $colorTomato: #ff6347;

  :root {
    --size-unit: 4px;
    --colorMindaro: #e3f988;
    --colorColumbiaBlue: #b9d9eb;
    --colorSpaceCadet: #1e2952;
    --colorTomato: #{$colorTomato};
    --colorApricot: #fbceb1;

    background-color: rgb(228, 226, 222);
    color: rgb(39, 39, 39);
    font-family: 'Montserrat Variable', sans-serif;
    margin: 0;
    padding: 0;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(pre) {
    margin: 0;
    font-family: 'Roboto Mono Variable', monospace;
  }

  :global(body) {
    margin: 0;
    padding-bottom: size(24);
  }

  :global(h1) {
    font-size: 72pt;
    font-weight: 100;
    margin-top: size(12);
    margin-left: size(24);
    /* padding */
    background: -webkit-linear-gradient(color.adjust($colorTomato, $lightness: 16%), $colorTomato);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 4px 4px 1px rgba(0, 0, 0, 0.1);
  }

  :global(h2) {
    font-weight: 400;
    margin: size(2) 0 size(4) size(4);
  }

  :global(section) {
    background-color: rgb(255, 255, 255);
    border-radius: size(4);
    padding: size(4);
    overflow: auto;
    max-width: 1200px;
    box-shadow: 1px 3px 3px rgba(0, 0, 0, 0.05);
    border: 2px solid rgba(0, 0, 0, 0.15);
    margin-bottom: size(8);
  }

  :global(table) {
    border-collapse: collapse;

    :global(thead th) {
      padding-bottom: 0.5em;
    }

    :global(td),
    :global(th) {
      padding: 0 0.5em;
      border-color: rgb(170, 170, 170);
      border-style: solid;
      border-width: 0 1px;

      &:first-of-type {
        padding-left: 0;
        border-left-width: 0;
      }
      &:last-of-type {
        padding-right: 0;
        border-right-width: 0;
      }
    }

    :global(tbody tr:hover) {
      background-color: rgb(238, 238, 238);
    }
  }

  .root {
    margin-left: size(4);
    margin-right: size(4);
  }
</style>
