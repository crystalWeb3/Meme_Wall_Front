export type MemeWall = {
  "version": "0.1.0",
  "name": "meme_wall",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "totalSlots",
          "type": "u16"
        }
      ]
    },
    {
      "name": "mintSlot",
      "accounts": [
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "slot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "slotNumber",
          "type": "u16"
        },
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "mint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setPhase",
      "accounts": [
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newPhase",
          "type": {
            "defined": "Phase"
          }
        }
      ]
    },
    {
      "name": "setWhitelist",
      "accounts": [
        {
          "name": "globalState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelist",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "addresses",
          "type": {
            "vec": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "GlobalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "totalSlots",
            "type": "u16"
          },
          {
            "name": "mintedSlots",
            "type": "u16"
          },
          {
            "name": "phase",
            "type": {
              "defined": "Phase"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Slot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slotNumber",
            "type": "u16"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Whitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addresses",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Phase",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Whitelist"
          },
          {
            "name": "Public"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSlotNumber",
      "msg": "Invalid slot number."
    },
    {
      "code": 6001,
      "name": "SlotAlreadyTaken",
      "msg": "Slot already taken."
    },
    {
      "code": 6002,
      "name": "NotWhitelisted",
      "msg": "Wallet not whitelisted."
    },
    {
      "code": 6003,
      "name": "Unauthorized",
      "msg": "Only admin can change phase."
    }
  ]
};

export type IDL = MemeWall; 