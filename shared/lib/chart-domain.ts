type DomainBound = (dataMin: number, dataMax: number) => number;

function paddingForRange(min: number, max: number): number {
	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return 1;
	}
	if (min === max) {
		return Math.max(Math.abs(min) * 0.05, min < 10 ? 0.5 : 1);
	}
	return (max - min) * 0.1;
}

export function finiteChartPoints(data: Array<{ value: number }>): Array<{ value: number }> {
	return data.filter(point => Number.isFinite(point.value));
}

export const dataPaddedDomainMin: DomainBound = (min, max) => {
	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return 0;
	}
	return min - paddingForRange(min, max);
};

export const dataPaddedDomainMax: DomainBound = (min, max) => {
	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return 1;
	}
	return max + paddingForRange(min, max);
};

export const dataPaddedYAxisDomain: [DomainBound, DomainBound] = [
	dataPaddedDomainMin,
	dataPaddedDomainMax,
];
