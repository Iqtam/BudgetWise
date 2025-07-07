<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import { tv, type VariantProps } from "tailwind-variants";

	export const avatarVariants = tv({
		base: "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
	});

	export type AvatarProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
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
	}: AvatarProps = $props();
</script>

<span
	bind:this={ref}
	class={cn(avatarVariants(), className)}
	{...restProps}
>
	{@render children?.()}
</span> 