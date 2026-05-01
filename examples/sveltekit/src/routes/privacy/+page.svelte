<script lang="ts">
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/svelte";
import config from "../../../openpolicy";
</script>

<svelte:head>
	<title>Privacy Policy</title>
</svelte:head>

<main>
	<OpenPolicy {config}>
		<PrivacyPolicy />
	</OpenPolicy>
</main>
