export const IDL = {
  "address": "3Pdj6A1v7HpFCi6JHN1St74hSyaDriGjBoVkkNVYjZKV",
  "metadata": {
    "name": "meme_wall",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
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
      "name": "migrate_slots",
      "discriminator": [
        169,
        46,
        111,
        240,
        54,
        22,
        184,
        198
      ],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
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
          "name": "slot_numbers",
          "type": {
            "vec": "u16"
          }
        }
      ]
    },
    {
      "name": "mint_slot",
      "discriminator": [
        25,
        212,
        126,
        206,
        198,
        145,
        240,
        18
      ],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
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
                "value": [
                  115,
                  108,
                  111,
                  116
                ]
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
      "discriminator": [
        111,
        105,
        112,
        240,
        6,
        217,
        210,
        215
      ],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
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
          "name": "phase",
          "type": {
            "defined": {
              "name": "Phase"
            }
          }
        }
      ]
    },
    {
      "name": "set_whitelist",
      "discriminator": [
        169,
        46,
        111,
        240,
        54,
        22,
        184,
        198
      ],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  45,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "whitelist",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
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
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "Slot",
      "discriminator": [
        140,
        54,
        3,
        187,
        53,
        189,
        250,
        230
      ]
    },
    {
      "name": "Whitelist",
      "discriminator": [
        204,
        176,
        52,
        79,
        146,
        121,
        54,
        247
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Only admin can set whitelist."
    }
  ],
  "types": [
    {
      "name": "GlobalState",
      "type": {
        "kind": "struct",
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
              "defined": {
                "name": "Phase"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "minted_slots_array",
            "type": {
              "vec": "u16"
            }
          }
        ]
      }
    },
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
    },
    {
      "name": "Slot",
      "type": {
        "kind": "struct",
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
              "vec": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
}; 