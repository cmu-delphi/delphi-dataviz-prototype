import all from './data.json';
import moment from 'moment';
import { flatGroup } from 'd3-array';

type EpidataResponse = {
	epidata: Array<EpidataOriginal>;
};

type EpidataOriginal = {
	time_value: number;
	value: number;
	geo_value: string;
	signal: string;
	source: string;
};

type EpidataConverted = {
	time_value: Date;
	value: number;
	geo_value: string;
	signal: string;
	source: string;
};

const data: EpidataResponse = all as EpidataResponse;
export const epidata = data.epidata.map((t) => {
	return {
		time_value: moment(t.time_value.toString(), 'YYYYMMDD').toDate(),
		value: t.value,
		geo_value: t.geo_value,
		signal: t.signal,
		source: t.source
	};
}) as Array<EpidataConverted>;
export const epidataGroup = flatGroup(epidata, (d) => d.geo_value);
