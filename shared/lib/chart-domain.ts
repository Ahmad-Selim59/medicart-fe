type DomainBound = (dataMin: number, dataMax: number) => number;

function paddingForRange(min: number, max: number): number {
	if (min === max) {
		return Math.max(Math.abs(min) * 0.05, min < 10 ? 0.5 : 1);
	}
	return (max - min) * 0.1;
}

export const dataPaddedDomainMin: DomainBound = (min, max) => {
	return min - paddingForRange(min, max);
};

export const dataPaddedDomainMax: DomainBound = (min, max) => {
	return max + paddingForRange(min, max);
};

export const dataPaddedYAxisDomain: [DomainBound, DomainBound] = [
	dataPaddedDomainMin,
	dataPaddedDomainMax,
];
