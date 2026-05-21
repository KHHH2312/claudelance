import assert from "node:assert/strict";
import test from "node:test";

import { celoMainnet } from "../chain";
import { connectorResolutionOrder, isMiniPay, resolveConnector, wagmiConfig } from "./config";

test("B39 connector resolution keeps MiniPay before Privy fallback", () => {
  assert.deepEqual(connectorResolutionOrder, ["minipay", "privy"]);
  assert.equal(isMiniPay({ isMiniPay: true }), true);
  assert.equal(isMiniPay({ isMiniPay: false }), false);
  assert.equal(resolveConnector({ isMiniPay: true }), "minipay");
  assert.equal(resolveConnector({ request: async () => [] }), "privy");
});

test("wagmi config targets Celo mainnet only", () => {
  assert.deepEqual(
    wagmiConfig.chains.map((chain) => chain.id),
    [celoMainnet.id],
  );
});
