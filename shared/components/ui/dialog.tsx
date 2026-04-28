"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

import { createPortal } from "react-dom";

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => {
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!open || !mounted) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange(false)} />
			<div className="relative z-[100] w-full max-w-lg overflow-hidden scale-100 animate-in fade-in zoom-in duration-200">
				{children}
			</div>
		</div>,
		document.body
	);
};

const DialogContent = ({ children, className, onClose }: { children: React.ReactNode; className?: string; onClose?: () => void }) => (
	<div className={cn("bg-background border rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto", className)}>
		{onClose && (
			<button 
				onClick={onClose}
				className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
			>
				<X className="h-4 w-4" />
				<span className="sr-only">Close</span>
			</button>
		)}
		{children}
	</div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
	<div className="space-y-1.5 mb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
	<h2 className="text-lg font-semibold leading-none tracking-tight">{children}</h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
	<p className="text-sm text-muted-foreground">{children}</p>
);

const DialogFooter = ({ children }: { children: React.ReactNode }) => (
	<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">{children}</div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
