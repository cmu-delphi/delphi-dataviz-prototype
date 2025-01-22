<script lang="ts">
	import { Axis, Brush, Chart, Spline, Highlight, Svg, Text, Tooltip } from 'layerchart';

	import { State } from 'svelte-ux';
	import { scaleOrdinal, scaleTime } from 'd3-scale';

	import { epidata, epidataGroup } from './data';
	import moment from 'moment';

	const stateColors = {
		ar: 'hsl(var(--color-info))',
		ca: 'hsl(var(--color-success))',
		tx: 'hsl(var(--color-warning))'
	};
</script>

<main class="p-2">
	<h1 class="text-xl font-semibold mb-1">COVIDCast multi-series example</h1>
	<h2 class="text-xl mb-1">
		Data source: <a
			href="https://api.delphi.cmu.edu/epidata/covidcast/?signal=fb-survey:smoothed_cli&time=day:20200406-20240406&geo=state:ar,ca,tx"
			>https://api.delphi.cmu.edu/epidata/covidcast/?signal=fb-survey:smoothed_cli&time=day:20200406-20240406&geo=state:ar,ca,tx</a
		>
	</h2>
	<div class="h-[600px] p-4 border rounded">
		<State initial={{ xDomain: [null, null], yDomain: [0, null] }} let:value let:set>
			<Chart
				data={epidata}
				x="time_value"
				xScale={scaleTime()}
				xDomain={value?.xDomain}
				y="value"
				yDomain={value?.yDomain}
				c="geo_value"
				cScale={scaleOrdinal()}
				cDomain={Object.keys(stateColors)}
				cRange={Object.values(stateColors)}
				padding={{ left: 16, bottom: 24, right: 48 }}
				tooltip={{ mode: 'voronoi' }}
				let:tooltip
				let:cScale
			>
				<Svg>
					<Axis placement="left" grid rule />
					<Axis placement="bottom" rule />
					{#each epidataGroup as [group, data]}
						{@const color =
							tooltip.data == null || tooltip.data.geo_value === group
									? cScale?.(group)
								: 'hsl(var(--color-surface-content) / 20%)'}
						<Spline {data} class="stroke-2" stroke={color}>
							<svelte:fragment slot="end">
								<circle r={4} fill={color} />
								<Text
									value={group}
									verticalAnchor="middle"
									dx={6}
									dy={-2}
									class="text-xs"
									fill={color}
								/>
							</svelte:fragment>
						</Spline>
					{/each}
					<Highlight points lines />
					<Brush
						axis="both"
						on:change={(e) => {
							set({
								// @ts-expect-error
								xDomain: e.detail.xDomain,
								// @ts-expect-error
								yDomain: e.detail.yDomain
							});
						}}
					/>
				</Svg>

				<Tooltip.Root let:data>
					<Tooltip.Header>{moment(data.time_value).format('MMMM Do YYYY')}</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item label={data.geo_value} value={data.value} />
					</Tooltip.List>
				</Tooltip.Root>
			</Chart>
		</State>
	</div>
</main>
