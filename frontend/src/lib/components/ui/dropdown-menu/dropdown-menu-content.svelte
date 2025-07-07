<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { tv } from "tailwind-variants";

	export const dropdownMenuContentVariants = tv({
		base: "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
	});

	export type DropdownMenuContentProps = DropdownMenuPrimitive.ContentProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: DropdownMenuContentProps = $props();
</script>

<DropdownMenuPrimitive.Content
	{sideOffset}
	class={cn(dropdownMenuContentVariants(), className)}
	{...restProps}
>
	{@render children?.()}
</DropdownMenuPrimitive.Content> 