// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ClaudelanceCore } from "../src/ClaudelanceCore.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deploy is Script {
    function run() external returns (ClaudelanceCore core) {
        address cusd = vm.envAddress("CUSD_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address relayer = vm.envAddress("CI_RELAYER_ADDRESS");
        address owner = vm.envOr("OWNER_ADDRESS", msg.sender);

        require(cusd != address(0), "CUSD_ADDRESS missing");
        require(treasury != address(0), "TREASURY_ADDRESS missing");
        require(relayer != address(0), "CI_RELAYER_ADDRESS missing");

        vm.startBroadcast();
        core = new ClaudelanceCore(IERC20(cusd), treasury, relayer, owner);
        vm.stopBroadcast();

        console2.log("ClaudelanceCore deployed:", address(core));
        console2.log("  cUSD:    ", cusd);
        console2.log("  treasury:", treasury);
        console2.log("  relayer: ", relayer);
        console2.log("  owner:   ", owner);

        _writeDeployment(address(core), cusd, treasury, relayer, owner);
    }

    function _writeDeployment(address core, address cusd, address treasury, address relayer, address owner)
        internal
    {
        string memory chain = _chainName();
        string memory path = string.concat("./deployments/", chain, ".json");
        string memory json = string.concat(
            "{\n",
            '  "chainId": ',
            vm.toString(block.chainid),
            ",\n",
            '  "core": "',
            vm.toString(core),
            '",\n',
            '  "cUSD": "',
            vm.toString(cusd),
            '",\n',
            '  "treasury": "',
            vm.toString(treasury),
            '",\n',
            '  "ciRelayer": "',
            vm.toString(relayer),
            '",\n',
            '  "owner": "',
            vm.toString(owner),
            '",\n',
            '  "deployedAt": ',
            vm.toString(block.timestamp),
            "\n}\n"
        );
        vm.writeFile(path, json);
        console2.log("wrote", path);
    }

    function _chainName() internal view returns (string memory) {
        if (block.chainid == 42_220) return "celo-mainnet";
        if (block.chainid == 11_142_220) return "celo-sepolia";
        return string.concat("chain-", vm.toString(block.chainid));
    }
}
