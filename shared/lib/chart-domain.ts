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

export function toChartNumber(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return undefined;
}

export function finiteChartPoints(data: Array<{ value: unknown }>): Array<{ value: number }> {
	return data
		.map(point => ({ value: toChartNumber(point.value) }))
		.filter((point): point is { value: number } => point.value !== undefined);
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

export function paddedDomainFromValues(values: number[]): [number, number] {
	const valid = values.filter(Number.isFinite);
	if (valid.length === 0) {
		return [0, 1];
	}

	const min = Math.min(...valid);
	const max = Math.max(...valid);
	const pad = min === max
		? Math.max(Math.abs(min) * 0.05, min < 10 ? 0.5 : 1)
		: (max - min) * 0.1;

	return [min - pad, max + pad];
}

export const dataPaddedYAxisDomain: [DomainBound, DomainBound] = [
	dataPaddedDomainMin,
	dataPaddedDomainMax,
];
