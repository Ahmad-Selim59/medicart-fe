"use client";

import { BadgeCheckIcon, ChevronsUpDownIcon, LogOutIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { logout, changePassword } from "@/app/login/actions";
import { useState } from "react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/shared/components/ui/sidebar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
		role: string;
	};
}) {
	const { isMobile } = useSidebar();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	function resetDialog() {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setShowCurrent(false);
		setShowNew(false);
		setShowConfirm(false);
		setError(null);
		setSuccess(false);
		setLoading(false);
	}

	async function handleChangePassword(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}

		setLoading(true);
		const result = await changePassword(currentPassword, newPassword);
		setLoading(false);

		if (result?.error) {
			setError(result.error);
		} else {
			setSuccess(true);
			setTimeout(() => {
				setDialogOpen(false);
				resetDialog();
			}, 1500);
		}
	}

	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
							}
						>
							<Avatar>
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground capitalize">{user.role}</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="min-w-56 rounded-lg"
							side={isMobile ? "bottom" : "right"}
							align="end"
							sideOffset={4}
						>
							<DropdownMenuGroup>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar>
											<AvatarImage src={user.avatar} alt={user.name} />
											<AvatarFallback>CN</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-medium">{user.name}</span>
											<span className="truncate text-xs text-muted-foreground capitalize">{user.role}</span>
										</div>
									</div>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={() => {
										resetDialog();
										setDialogOpen(true);
									}}
								>
									<BadgeCheckIcon />
									Account
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => logout()}>
								<LogOutIcon />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>

			{/* Change Password Dialog */}
			<Dialog open={dialogOpen} onOpenChange={(open) => {
				setDialogOpen(open);
				if (!open) resetDialog();
			}}>
				<DialogContent onClose={() => { setDialogOpen(false); resetDialog(); }}>
					<DialogHeader>
						<DialogTitle>
							<span className="flex items-center gap-2">
								<KeyRoundIcon className="size-5" />
								Change Password
							</span>
						</DialogTitle>
						<DialogDescription>
							Enter your current password and choose a new one.
						</DialogDescription>
					</DialogHeader>

					{success ? (
						<div className="flex flex-col items-center gap-3 py-6 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
								<KeyRoundIcon className="size-6" />
							</div>
							<p className="text-sm font-medium text-emerald-600">Password updated successfully!</p>
						</div>
					) : (
						<form onSubmit={handleChangePassword} className="space-y-4">
							{/* Current Password */}
							<div className="space-y-2">
								<label htmlFor="current-password" className="text-sm font-medium leading-none">
									Current password
								</label>
								<div className="relative">
									<Input
										id="current-password"
										type={showCurrent ? "text" : "password"}
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										required
										className="pr-10"
										placeholder="Enter current password"
									/>
									<button
										type="button"
										onClick={() => setShowCurrent(!showCurrent)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showCurrent ? "Hide password" : "Show password"}
									>
										{showCurrent ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
									</button>
								</div>
							</div>

							{/* New Password */}
							<div className="space-y-2">
								<label htmlFor="new-password" className="text-sm font-medium leading-none">
									New password
								</label>
								<div className="relative">
									<Input
										id="new-password"
										type={showNew ? "text" : "password"}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										minLength={6}
										className="pr-10"
										placeholder="Min. 6 characters"
									/>
									<button
										type="button"
										onClick={() => setShowNew(!showNew)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showNew ? "Hide password" : "Show password"}
									>
										{showNew ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
									</button>
								</div>
							</div>

							{/* Confirm Password */}
							<div className="space-y-2">
								<label htmlFor="confirm-password" className="text-sm font-medium leading-none">
									Confirm new password
								</label>
								<div className="relative">
									<Input
										id="confirm-password"
										type={showConfirm ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										minLength={6}
										className="pr-10"
										placeholder="Repeat new password"
									/>
									<button
										type="button"
										onClick={() => setShowConfirm(!showConfirm)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showConfirm ? "Hide password" : "Show password"}
									>
										{showConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
									</button>
								</div>
							</div>

							{error && (
								<p className="text-sm font-medium text-red-500">{error}</p>
							)}

							<DialogFooter className="pt-2">
								<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
									Cancel
								</Button>
								<Button type="submit" disabled={loading}>
									{loading ? "Updating..." : "Update password"}
								</Button>
							</DialogFooter>
						</form>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
