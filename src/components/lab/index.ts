/**
 * Interactive widgets for articles. Import them in an MDX file:
 *
 *   import { PayoffLab } from "@/components/lab";
 *   <PayoffLab lang="de" />
 *
 * Every widget takes `lang` ("de" | "en") for its labels and number format.
 */
export { ArbitrageLab, AmmLab } from "./arbitrage";
export { BasisLab, FundingCarryLab, LiquidationLab } from "./futures";
export { OptionPricer, PayoffLab } from "./options";
export { Quiz } from "./quiz";
