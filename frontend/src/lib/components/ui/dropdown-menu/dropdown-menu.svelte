<script lang="ts" module>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	export type DropdownMenuProps = DropdownMenuPrimitive.RootProps;
</script>

<script lang="ts">
	let { children, ...restProps }: DropdownMenuProps = $props();
</script>

<DropdownMenuPrimitive.Root {...restProps}>
	{@render children?.()}
</DropdownMenuPrimitive.Root>
