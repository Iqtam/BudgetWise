<script lang="ts">
	import type { HTMLDivAttributes } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type Props = WithElementRef<HTMLDivAttributes>;

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn("relative overflow-auto", className)}
	{...restProps}
>
	{@render children?.()}
</div> 