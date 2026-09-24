import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className={`${jakarta.className} min-h-screen`}>
			{children}
		</main>
	);
}
