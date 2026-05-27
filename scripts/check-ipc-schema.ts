import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  IPC_MESSAGE_TYPES,
  IPC_SCHEMA_VERSION,
  createIpcRequest,
  validateIpcEnvelope
} from "../native/shared/ipc/messages";

interface JsonSchema {
  $defs?: {
    MessageType?: {
      enum?: unknown[];
    };
    IpcRequest?: {
      properties?: {
        version?: {
          const?: unknown;
        };
      };
    };
  };
}

const schemaPath = resolve("native/shared/ipc/lekh-keyboard-ipc.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as JsonSchema;

const schemaMessageTypes = schema.$defs?.MessageType?.enum ?? [];
const missingFromSchema = IPC_MESSAGE_TYPES.filter((type) => !schemaMessageTypes.includes(type));
const extraInSchema = schemaMessageTypes.filter((type) => !IPC_MESSAGE_TYPES.includes(type as (typeof IPC_MESSAGE_TYPES)[number]));
const schemaVersion = schema.$defs?.IpcRequest?.properties?.version?.const;

const sample = createIpcRequest("health.check", { client: "daemon-test" }, "ipc_schema_smoke", 1);
const validation = validateIpcEnvelope(sample);

const failures = [
  ...missingFromSchema.map((type) => `Missing IPC message type in schema: ${type}`),
  ...extraInSchema.map((type) => `Unexpected IPC message type in schema: ${String(type)}`),
  schemaVersion === IPC_SCHEMA_VERSION ? "" : `Schema request version ${String(schemaVersion)} does not match ${IPC_SCHEMA_VERSION}.`,
  validation.ok ? "" : `Runtime IPC validator rejected sample envelope: ${validation.errors.join("; ")}`
].filter(Boolean);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "pass",
      schema: schemaPath,
      version: IPC_SCHEMA_VERSION,
      messageTypes: IPC_MESSAGE_TYPES.length,
      checkedAt: new Date().toISOString()
    },
    null,
    2
  )
);
