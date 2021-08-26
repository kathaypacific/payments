import { newKit } from "@celo/contractkit";
import cli from "cli-ux";
import { Command, flags } from "@oclif/command";
import {
  Charge,
  ContractKitTransactionHandler,
  PaymentInfo,
} from "@celo/payments-sdk";
import { getAccount } from "../helpers";
import { CeloAccountPrivateKeyFilePath } from "../helpers/create-account";

export default class Init extends Command {
  static description = "Create a charge and interactively submit it";

  static examples = [
    `$ payments init --referenceId XXX --baseUrl https://psp.com --privateKey 0x...`,
    `$ payments init --deepLink celo://... --privateKey 0x...`,
  ];

  static flags = {
    apiBase: flags.string({
      char: "u",
      description: "URL of the payment service provider",
    }),
    referenceId: flags.string({
      char: "r",
      description: "Reference ID of the purchase",
    }),
    privateKey: flags.string({
      char: "p",
      description: "Private key of the purchasee",
    }),
    testnet: flags.boolean({
      default: true,
      description:
        "Whether to submit transactions on the Celo mainnet or Alfajores testnet",
    }),
    deepLink: flags.string({
      char: "d",
      description: "A deep link presented by the merchant",
    }),
  };

  async run() {
    let {
      flags: { privateKey, testnet, referenceId, apiBase, deepLink },
    } = this.parse(Init);
    let charge: Charge;

    if (!privateKey) {
      privateKey = await cli.prompt(
        "Enter a private key to sign transactions with",
        { type: "hide", required: false }
      );
      if (!privateKey) {
        cli.info(
          `No private key! generating new one (or using the one save @ ${CeloAccountPrivateKeyFilePath})...`
        );
        privateKey = (await getAccount()).privateKey;
        cli.info(`privateKey: ${privateKey}`);
      }
    }

    const kit = newKit(
      testnet
        ? "https://alfajores-forno.celo-testnet.org"
        : "https://forno.celo.org"
    );
    kit.addAccount(privateKey);
    const [defaultAccount] = await kit.getWallet().getAccounts();
    kit.defaultAccount = defaultAccount;

    const txHandler = new ContractKitTransactionHandler(kit);

    if (!deepLink) {
      deepLink = await cli.prompt(
        "Enter a deep link or press <Enter> to skip",
        { required: false }
      );
    }
    if (deepLink) {
      charge = Charge.fromDeepLink(deepLink, txHandler);
    } else {
      if (!referenceId) {
        referenceId = await cli.prompt("Enter a purchase reference ID");
      }
      if (!apiBase) {
        apiBase = await cli.prompt("Enter a PSP base URL");
      }

      charge = new Charge(apiBase, referenceId, txHandler);
    }

    cli.info("");
    cli.info("Payment link details:");
    cli.info(`PSP API base url: ${charge.apiBase}`);
    cli.info(`Payment reference id: ${charge.referenceId}`);

    const info: PaymentInfo = await charge.getInfo();
    console.log(JSON.stringify(info, null, 2));

    const confirmed = await cli.confirm("Continue with payment?");
    if (confirmed) {
      await charge.submit({});
    } else {
      await charge.abort(/*AbortCode.user_declined_payment*/);
    }
  }
}
