/**
 * Interactive widgets for articles. Import them in an MDX file:
 *
 *   import { PayoffLab } from "@/components/lab";
 *   <PayoffLab lang="de" />
 *
 * Every widget takes `lang` ("de" | "en") for its labels and number format.
 * `Workshop` and `Module` turn an article into a workshop with one module per
 * tab; see workshop.tsx.
 */
export { ArbitrageLab, AmmLab } from "./arbitrage";
export { MarketMap, StrategyExplorer } from "./explore";
export { BasisLab, FundingCarryLab } from "./futures";
export { MonteCarloLab, OptionPricer, PayoffLab } from "./options";
export { FundingLab, LiquidationLab } from "./perps";
export { Quiz } from "./quiz";
export { Module, Workshop, WorkshopSummary } from "./workshop";
