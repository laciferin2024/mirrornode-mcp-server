import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

export interface ApiEndpoint {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  alias: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: 'Path' | 'Query' | 'Body';
    schema: z.ZodType<any>;
  }>;
  response: z.ZodType<any>;
  errors?: Array<{
    status: number;
    description?: string;
    schema: z.ZodType<any>;
  }>;
};

export const EntityId = z.string();
export const Alias = z.string();
export const TimestampNullable = z.string();
export const Balance = z
  .object({
    timestamp: TimestampNullable.regex(/^\d{1,10}(\.\d{1,9})?$/).nullable(),
    balance: z.number().int().nullable(),
    tokens: z.array(
      z
        .object({
          token_id: EntityId.regex(/^\d{1,10}\.\d{1,10}\.\d{1,10}$/).nullable(),
          balance: z.number().int(),
        })
        .partial()
        .passthrough()
    ),
  })
  .passthrough();

export const EvmAddressNullable = z.string();
export const Key = z
  .object({
    _type: z.enum(["ECDSA_SECP256K1", "ED25519", "ProtobufEncoded"]),
    key: z.string(),
  })
  .partial()
  .passthrough();

export const AccountInfo = z
  .object({
    account: EntityId.regex(/^\d{1,10}\.\d{1,10}\.\d{1,10}$/).nullable(),
    alias: Alias.regex(
      /^(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}|[A-Z2-7]{4,5}|[A-Z2-7]{7,8})$/
    ).nullable(),
    auto_renew_period: z.number().int().nullable(),
    balance: Balance.nullable(),
    created_timestamp: TimestampNullable.regex(
      /^\d{1,10}(\.\d{1,9})?$/
    ).nullable(),
    decline_reward: z.boolean(),
    deleted: z.boolean().nullable(),
    ethereum_nonce: z.number().int().nullable(),
    evm_address: EvmAddressNullable.min(40)
      .max(42)
      .regex(/^(0x)?[A-Fa-f0-9]{40}$/)
      .nullable(),
    expiry_timestamp: TimestampNullable.regex(
      /^\d{1,10}(\.\d{1,9})?$/
    ).nullable(),
    key: Key.nullable(),
    max_automatic_token_associations: z.number().int().nullable(),
    memo: z.string().nullable(),
    pending_reward: z.number().int().optional(),
    receiver_sig_required: z.boolean().nullable(),
    staked_account_id: EntityId.and(z.unknown()),
    staked_node_id: z.number().int().nullable(),
    stake_period_start: TimestampNullable.and(z.unknown()),
  })
  .passthrough();

export const Accounts = z.array(AccountInfo);
export const Links = z.object({ next: z.string().nullable() }).partial().passthrough();
export const AccountsResponse = z
  .object({ accounts: Accounts, links: Links })
  .passthrough();

export const Error = z
  .object({
    _status: z
      .object({
        messages: z.array(
          z
            .object({
              data: z
                .string()
                .regex(/^0x[0-9a-fA-F]+$/)
                .nullable(),
              detail: z.string().nullable(),
              message: z.string(),
            })
            .partial()
            .passthrough()
        ),
      })
      .partial()
      .passthrough(),
  })
  .partial()
  .passthrough();

const apiEndpoints: ApiEndpoint[] = [
  {
    method: 'get',
    path: '/api/v1/accounts/:idOrAliasOrEvmAddress',
    alias: 'getAccount',
    description: 'Return the account transactions and balance information given an account alias, an account id, or an evm address.',
    parameters: [
      {
        name: 'idOrAliasOrEvmAddress',
        type: 'Path',
        schema: z.string().regex(/^(\d{1,10}\.){0,2}(\d{1,10}|(0x)?[A-Fa-f0-9]{40}|(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}|[A-Z2-7]{4,5}|[A-Z2-7]{7,8}))$/)
      }
    ],
    response: AccountsResponse,
    errors: [
      {
        status: 400,
        description: 'Invalid parameter',
        schema: Error
      },
      {
        status: 404,
        description: 'Not Found',
        schema: Error
      }
    ]
  }
];

export const api = makeApi(apiEndpoints);
export const endpointDefinitions = apiEndpoints;

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, api, options);
}