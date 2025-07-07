export const IDL = {
  "address": "3GYFAZwmiaisxDrLuEufKSn7wm56UVsSZSKrJyCXerS9",
  "metadata": {
    "name": "meme_wall",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "total_slots",
          "type": "u16"
        }
      ]
    },
    {
      "name": "mint_slot",
      "discriminator": [25, 212, 126, 206, 198, 145, 240, 18],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          "name": "slot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [115, 108, 111, 116]
              },
              {
                "kind": "arg",
                "path": "slot_number"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "admin",
          "writable": true
        },
        {
          "name": "whitelist",
          "optional": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "slot_number",
          "type": "u16"
        },
        {
          "name": "metadata_uri",
          "type": "string"
        },
        {
          "name": "mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_phase",
      "discriminator": [111, 105, 112, 240, 6, 217, 210, 215],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "new_phase",
          "type": {
            "defined": "Phase"
          }
        }
      ]
    },
    {
      "name": "set_whitelist",
      "discriminator": [183, 18, 70, 36, 118, 92, 199, 127],
      "accounts": [
        {
          "name": "whitelist",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [119, 104, 105, 116, 101, 108, 105, 115, 116]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "addresses",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "GlobalState",
      "discriminator": [8, 175, 175, 109, 31, 13, 152, 155],
      "size": 64,
      "fields": [
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "total_slots",
          "type": "u16"
        },
        {
          "name": "minted_slots",
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
    },
    {
      "name": "Slot",
      "discriminator": [8, 25, 212, 126, 206, 198, 145, 240],
      "size": 275,
      "fields": [
        {
          "name": "slot_number",
          "type": "u16"
        },
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "mint",
          "type": "pubkey"
        },
        {
          "name": "metadata_uri",
          "type": "string"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "Whitelist",
      "discriminator": [8, 183, 18, 70, 36, 118, 92, 199],
      "size": 3213,
      "fields": [
        {
          "name": "addresses",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    }
  ],
  "types": [
    {
      "name": "Phase",
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
  ]
} as const; 