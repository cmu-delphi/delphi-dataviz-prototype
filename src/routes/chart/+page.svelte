<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { LineChart, Axis } from 'layerchart';
	import moment from 'moment';
	import { PeriodType, TextField, Button, Form } from 'svelte-ux';
	import { scaleTime } from 'd3-scale';

	const colors = [
		'hsl(var(--color-info))',
		'hsl(var(--color-success))',
		'hsl(var(--color-warning))',
		'hsl(var(--color-danger))'
	];

	type EpidataResult = {
		epidata: Array<EpidataRow>;
	};

	type EpidataRow = {
		value: number;
		source: string;
		signal: string;
		time_type: string;
		time_value: Date;
		geo_type: string;
		geo_value: string;
	};

	function getCovidcastResponse(
		source: string,
		signal: string,
		time_type: string,
		time_value: string,
		geo_type: string,
		geo_value: string
	) {
		const url = new URL('https://api.delphi.cmu.edu/epidata/covidcast/');
		const params = new URLSearchParams(
			Object.entries({
				signal: `${source}:${signal}`,
				time: `${time_type}:${time_value}`,
				geo: `${geo_type}:${geo_value}`
			})
		);
		return fetch(url.toString(), { method: 'POST', body: params }).then((d) => d.json());
	}

	let chartData = writable([] as Array<EpidataRow>[]); // 2D array

	function addDataset(
		source: string,
		signal: string,
		time_type: string,
		time_value: string,
		geo_type: string,
		geo_value: string
	) {
		getCovidcastResponse(source, signal, time_type, time_value, geo_type, geo_value).then((res) => {
			const data: EpidataResult = res as EpidataResult;
			const convertedData = data.epidata.map((t) => {
				return {
					value: t.value,
					source: t.source,
					signal: t.signal,
					time_type: t.time_type,
					time_value: moment(t.time_value.toString(), 'YYYYMMDD').toDate(),
					geo_type: t.geo_type,
					geo_value: t.geo_value
				};
			}) as Array<EpidataRow>;
			let cd = get(chartData);
			cd.push(convertedData);
			chartData.set(cd);
		});
	}

	addDataset('fb-survey', 'smoothed_cli', 'day', '20200406-20240406', 'state', 'ar');
	addDataset('fb-survey', 'smoothed_cli', 'day', '20200406-20240406', 'state', 'ca');
	addDataset('fb-survey', 'smoothed_cli', 'day', '20200406-20240406', 'state', 'tx');

	let dataSource = writable('fb-survey');
	let signal = writable('smoothed_cli');
	let timeType = writable('day');
	let timeValue = writable('20200406-20240406');
	let geoType = writable('state');
	let geoValue = writable('pa');
</script>

<main class="p-2">
	<h1 class="text-xl font-semibold mb-1">COVIDCast multi-series example</h1>
	<div class="grid grid-cols-4 gap-2">
		<TextField label="Data Source" placeholder="fb-survey" bind:value={$dataSource} />
		<TextField label="Signal" placeholder="smoothed_cli" bind:value={$signal} />
		<TextField label="Time Type" placeholder="day" bind:value={$timeType} />
		<TextField label="Time Value" placeholder="20200406-20240406" bind:value={$timeValue} />
		<TextField label="Geo Type" placeholder="state" bind:value={$geoType} />
		<TextField label="Geo Value" placeholder="pa" bind:value={$geoValue} />
		<Button
			variant="fill"
			color="primary"
			on:click={() => {
				addDataset($dataSource, $signal, $timeType, $timeValue, $geoType, $geoValue);
			}}>Add Dataset</Button
		>
	</div>
	<div class="h-[600px] p-4">
		<LineChart
			x="time_value"
			y="value"
			series={$chartData.map((element, index) => {
				return {
					key: `[${element[0].source}:${element[0].signal}] ${element[0].geo_type}:${element[0].geo_value}`,
					data: element,
					color: colors[index % colors.length]
				};
			})}
			legend
			brush
		>
			<svelte:fragment slot="axis">
				<Axis
					placement="bottom"
					rule
					ticks={(scale) => scaleTime(scale.domain(), scale.range()).ticks()}
					format={PeriodType.Day}
				/>
				<Axis placement="left" rule />
			</svelte:fragment>
		</LineChart>
	</div>
</main>
