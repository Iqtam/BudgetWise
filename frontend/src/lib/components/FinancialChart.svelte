<script lang="ts">
	import { onMount } from 'svelte';

	let chartContainer: HTMLDivElement;
	let mounted = false;
	let hoveredPoint: { x: number; y: number; income: number; expenses: number; month: string } | null = null;

	const data = [
		{ month: "Jan", income: 5200, expenses: 3800 },
		{ month: "Feb", income: 5400, expenses: 3200 },
		{ month: "Mar", income: 5100, expenses: 3600 },
		{ month: "Apr", income: 5600, expenses: 3400 },
		{ month: "May", income: 5300, expenses: 3100 },
		{ month: "Jun", income: 5420, expenses: 3280 },
	];

	const maxValue = Math.max(...data.map(d => d.income));
	const minValue = 0;
	const range = maxValue - minValue;

	onMount(() => {
		mounted = true;
	});

	function createSmoothPath(points: {x: number, y: number}[], close = false): string {
		if (points.length < 2) return '';
		
		let path = `M ${points[0].x} ${points[0].y}`;
		
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			
			// Create smooth curves using quadratic bezier curves
			const cpx = (prev.x + curr.x) / 2;
			path += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
			path += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
		}
		
		if (close) {
			path += ` L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;
		}
		
		return path;
	}

	function getChartPoints() {
		const width = 100;
		const height = 100;
		const stepX = width / (data.length - 1);
		
		const incomePoints = data.map((item, index) => ({
			x: index * stepX,
			y: height - ((item.income - minValue) / range) * height
		}));
		
		const expensePoints = data.map((item, index) => ({
			x: index * stepX,
			y: height - ((item.expenses - minValue) / range) * height
		}));
		
		return { incomePoints, expensePoints };
	}

	function handleMouseMove(event: MouseEvent) {
		if (!chartContainer) return;
		
		const rect = chartContainer.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		
		// Find closest data point
		const stepX = 100 / (data.length - 1);
		const closestIndex = Math.round(x / stepX);
		
		if (closestIndex >= 0 && closestIndex < data.length) {
			const item = data[closestIndex];
			hoveredPoint = {
				x: closestIndex * stepX,
				y: 100 - ((item.income - minValue) / range) * 100,
				income: item.income,
				expenses: item.expenses,
				month: item.month
			};
		}
	}

	function handleMouseLeave() {
		hoveredPoint = null;
	}

	$: ({ incomePoints, expensePoints } = getChartPoints());
	$: incomePath = createSmoothPath(incomePoints, true);
	$: expensePath = createSmoothPath(expensePoints, true);
</script>

{#if mounted}
	<div 
		bind:this={chartContainer} 
		class="w-full h-[300px] relative cursor-crosshair"
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
		role="img"
		aria-label="Financial spending overview chart"
	>
		<!-- Chart Container -->
		<div class="relative h-full w-full">
			<!-- SVG Chart -->
			<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<!-- Grid lines -->
				<defs>
					<linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:rgb(16 185 129);stop-opacity:0.8" />
						<stop offset="100%" style="stop-color:rgb(16 185 129);stop-opacity:0.1" />
					</linearGradient>
					<linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" style="stop-color:rgb(239 68 68);stop-opacity:0.8" />
						<stop offset="100%" style="stop-color:rgb(239 68 68);stop-opacity:0.1" />
					</linearGradient>
					<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(55 65 81)" stroke-width="0.1"/>
					</pattern>
				</defs>
				
				<!-- Grid background -->
				<rect width="100" height="100" fill="url(#grid)" opacity="0.2"/>
				
				<!-- Income Area (stacked on top) -->
				<path 
					d={incomePath}
					fill="url(#incomeGradient)"
					stroke="rgb(16 185 129)"
					stroke-width="0.3"
					opacity="0.9"
				/>
				
				<!-- Expenses Area (bottom layer) -->
				<path 
					d={expensePath}
					fill="url(#expenseGradient)"
					stroke="rgb(239 68 68)"
					stroke-width="0.3"
					opacity="0.9"
				/>
				
				<!-- Data points -->
				{#each data as item, index}
					{@const x = (index / (data.length - 1)) * 100}
					{@const incomeY = 100 - ((item.income - minValue) / range) * 100}
					{@const expenseY = 100 - ((item.expenses - minValue) / range) * 100}
					
					<!-- Income point -->
					<circle 
						cx={x} 
						cy={incomeY} 
						r="1" 
						fill="rgb(16 185 129)"
						stroke="white"
						stroke-width="0.2"
						class="transition-all duration-200"
						class:scale-150={hoveredPoint && Math.abs(hoveredPoint.x - x) < 2}
					/>
					
					<!-- Expense point -->
					<circle 
						cx={x} 
						cy={expenseY} 
						r="1" 
						fill="rgb(239 68 68)"
						stroke="white"
						stroke-width="0.2"
						class="transition-all duration-200"
						class:scale-150={hoveredPoint && Math.abs(hoveredPoint.x - x) < 2}
					/>
				{/each}
				
				<!-- Hover line -->
				{#if hoveredPoint}
					<line
						x1={hoveredPoint.x}
						y1="0"
						x2={hoveredPoint.x}
						y2="100"
						stroke="white"
						stroke-width="0.2"
						opacity="0.5"
						stroke-dasharray="2,2"
					/>
				{/if}
			</svg>

			<!-- Interactive Tooltip -->
			{#if hoveredPoint}
				<div 
					class="absolute pointer-events-none bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-10"
					style="left: {hoveredPoint.x}%; top: 10%; transform: translateX(-50%)"
				>
					<div class="text-xs font-medium text-white mb-1">{hoveredPoint.month}</div>
					<div class="space-y-1">
						<div class="flex items-center gap-2 text-xs">
							<div class="w-2 h-2 bg-green-500 rounded-full"></div>
							<span class="text-green-400">Income: ${hoveredPoint.income.toLocaleString()}</span>
						</div>
						<div class="flex items-center gap-2 text-xs">
							<div class="w-2 h-2 bg-red-500 rounded-full"></div>
							<span class="text-red-400">Expenses: ${hoveredPoint.expenses.toLocaleString()}</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- X-axis labels -->
			<div class="absolute bottom-0 left-0 right-0 flex justify-between px-2 pb-2">
				{#each data as item}
					<span class="text-xs text-gray-400">{item.month}</span>
				{/each}
			</div>

			<!-- Y-axis labels -->
			<div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between py-2">
				<span class="text-xs text-gray-400">${(maxValue / 1000).toFixed(0)}k</span>
				<span class="text-xs text-gray-400">${(maxValue / 2 / 1000).toFixed(0)}k</span>
				<span class="text-xs text-gray-400">$0</span>
			</div>

			<!-- Legend -->
			<div class="absolute top-4 right-4 flex gap-4">
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-green-500 rounded-full"></div>
					<span class="text-xs text-gray-300">Income</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="w-3 h-3 bg-red-500 rounded-full"></div>
					<span class="text-xs text-gray-300">Expenses</span>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="w-full h-[300px] flex items-center justify-center">
		<div class="text-gray-400">Loading chart...</div>
	</div>
{/if} 