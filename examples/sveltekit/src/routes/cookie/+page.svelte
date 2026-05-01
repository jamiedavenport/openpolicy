<script lang="ts">
import { CookiePolicy, OpenPolicy } from "@openpolicy/svelte";
import config from "../../../openpolicy";
</script>

<svelte:head>
	<title>Cookie Policy</title>
</svelte:head>

<main>
	<OpenPolicy {config}>
		<CookiePolicy />
	</OpenPolicy>
</main>
