import { ADDRESS } from "../../config";
import {
  Address,
  BusinessData,
  PaymentAction,
  PaymentInfo,
} from "@celo/payments-types";

export const KYC: PaymentInfo = {
  requiredPayerData: {
    givenName: true,
    surname: true,
    phoneNumber: true,
    address: {
      city: true,
      country: true,
      line1: true,
      line2: false,
      postalCode: true,
      state: false,
    },
    nationalIdData: {
      idValue: true,
      country: true,
      type: true,
    },
  },
  receiver: {
    accountAddress: ADDRESS,
    businessData: <BusinessData>{
      name: "Acme Autos",
      legalName: "Acme Autos LLC",
      address: <Address>{
        city: "San Frans",
        country: "US",
        line1: "1260 Market Street",
        line2: "Suite 450",
        postalCode: "94103",
        state: "CA",
      },
    },
  },
  action: {
    amount: 10,
    currency: PaymentAction.currency.C_USD,
    action: PaymentAction.action.CHARGE,
    timestamp: Date.now(),
  },
  referenceId: "00000000-0000-0000-0000000001",
  description: "Mock purchase",
};
