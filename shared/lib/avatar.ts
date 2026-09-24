export const AVATAR_PALETTE = [
	"bg-primary/15 text-primary",
	"bg-chart-2/15 text-chart-2",
	"bg-chart-4/15 text-chart-4",
	"bg-chart-3/15 text-chart-3",
];

export function getInitials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function avatarClass(name: string) {
	const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_PALETTE.length;
	return AVATAR_PALETTE[index];
}
