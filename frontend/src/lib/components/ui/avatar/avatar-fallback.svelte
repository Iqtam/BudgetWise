<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";

	export type AvatarFallbackProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		class?: string;
	};
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: AvatarFallbackProps = $props();
</script>

<span
	bind:this={ref}
	class={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
	{...restProps}
>
	{@render children?.()}
</span> 