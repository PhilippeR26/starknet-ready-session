import type { Abi } from "starknet";

export const counterAbi: Abi = [
  {
    "type": "impl",
    "name": "TestSession",
    "interface_name": "session_test::ITestSession"
  },
  {
    "type": "interface",
    "name": "session_test::ITestSession",
    "items": [
      {
        "type": "function",
        "name": "increase",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "decrease",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_counter",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "event",
    "name": "session_test::test_session::Event",
    "kind": "enum",
    "variants": []
  }
] as const;