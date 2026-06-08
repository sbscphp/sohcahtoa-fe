import {
  buildTransactionListQueryParams,
  mapTransactionFilterTypesToApi,
  resolveAdminTransactionListGroup,
} from "../transaction-list-params";
import { TRANSACTION_GROUP_TAB_ALL } from "../transaction-group-tabs";

describe("transaction-list-params", () => {
  it("always sends tab group and mapped type together", () => {
    expect(
      buildTransactionListQueryParams({
        activeGroupTab: "Buy FX",
        transactionTypeFilter: "pta,bta",
        page: 1,
        limit: 10,
      }),
    ).toEqual({
      group: "BUY",
      type: "PTA,BTA",
      page: 1,
      limit: 10,
    });
  });

  it("omits group and type when All tab with no type filter", () => {
    expect(
      buildTransactionListQueryParams({
        activeGroupTab: TRANSACTION_GROUP_TAB_ALL,
        page: 1,
      }),
    ).toEqual({
      group: undefined,
      type: undefined,
      page: 1,
    });
  });

  it("maps filter sheet values to API enums", () => {
    expect(mapTransactionFilterTypesToApi("school_fees,imto")).toBe(
      "SCHOOL_FEES,IMTO_REMITTANCE",
    );
  });

  it("maps admin tabs to group", () => {
    expect(resolveAdminTransactionListGroup("buy-fx")).toBe("BUY");
    expect(resolveAdminTransactionListGroup("sellfx")).toBe("SELL");
    expect(resolveAdminTransactionListGroup("all")).toBeUndefined();
  });
});
