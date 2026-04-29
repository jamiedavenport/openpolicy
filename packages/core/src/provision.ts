import type { ProvisionRequirement } from "./types";

/**
 * Helpers that build a {@link ProvisionRequirement} for `data.context[category].provision`.
 * Each call carries the consequences of failing to provide the data, as
 * required by GDPR Article 13(2)(e).
 */
export const Statutory = (consequences: string): ProvisionRequirement => ({
	basis: "statutory",
	consequences,
});

export const Contractual = (consequences: string): ProvisionRequirement => ({
	basis: "contractual",
	consequences,
});

export const ContractPrerequisite = (consequences: string): ProvisionRequirement => ({
	basis: "contract-prerequisite",
	consequences,
});

export const Voluntary = (consequences: string): ProvisionRequirement => ({
	basis: "voluntary",
	consequences,
});
