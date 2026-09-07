CREATE TABLE `wishes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`email_status` text DEFAULT 'pending' NOT NULL,
	`ip_hash` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `wishes_created_idx` ON `wishes` (`created_at`);--> statement-breakpoint
CREATE INDEX `wishes_ip_created_idx` ON `wishes` (`ip_hash`,`created_at`);