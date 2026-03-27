import React, { Children, cloneElement, type ReactNode } from "react";

type AnyProps = Record<string, unknown>;

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
	const merged: AnyProps = { ...slotProps, ...childProps };

	// Concatenate classNames
	if (slotProps.className || childProps.className) {
		merged.className = [slotProps.className, childProps.className]
			.filter(Boolean)
			.join(" ");
	}

	// Chain event handlers (both fire; slot fires first)
	for (const key of Object.keys(slotProps)) {
		if (
			typeof slotProps[key] === "function" &&
			typeof childProps[key] === "function" &&
			key.startsWith("on")
		) {
			const slotHandler = slotProps[key] as (...args: unknown[]) => void;
			const childHandler = childProps[key] as (...args: unknown[]) => void;
			merged[key] = (...args: unknown[]) => {
				slotHandler(...args);
				childHandler(...args);
			};
		}
	}

	return merged;
}

interface SlotProps {
	children?: ReactNode;
	[key: string]: unknown;
}

export function Slot({ children, ...slotProps }: SlotProps) {
	const child = Children.only(children) as React.ReactElement<AnyProps>;
	return cloneElement(child, mergeProps(slotProps, child.props as AnyProps));
}
