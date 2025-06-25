<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { tv } from 'tailwind-variants';

	export const dropdownMenuLabelVariants = tv({
		base: 'px-2 py-1.5 text-sm font-semibold'
	});

	export type DropdownMenuLabelProps = {
		class?: string;
		children?: any;
		[key: string]: any;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: DropdownMenuLabelProps = $props();
</script>

<div class={cn(dropdownMenuLabelVariants(), className)} {...restProps}>
	{@render children?.()}
</div>
