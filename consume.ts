import { connect, type NatsConnection } from "@nats-io/transport-node";
import { jetstreamManager, type JetStreamManager } from "@nats-io/jetstream";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

export const STREAM = process.env.STREAM || "example";
export const CONSUMER = process.env.CONSUMER || "example-part";

let nc: NatsConnection | null = null;

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

const PID_FILE_NAME = `${process.pid}.pid`;
const PID_FILE_PATH = join(process.cwd(), PID_FILE_NAME);

export async function main(): Promise<void> {
  await writeFile(PID_FILE_PATH, "1");

  nc = await connect();
  const jsm = await jetstreamManager(nc);
  const js = jsm.jetstream();

  const consumer = await js.consumers.get(STREAM, CONSUMER);

  console.log(`Subscribed via consumer: ${STREAM} > ${CONSUMER}`);
  const consumerMessages = await consumer.consume({ max_messages: 500 });
  const subjectToCountDict: Record<string, number> = {};

  for await (const message of consumerMessages) {
    if (!subjectToCountDict[message.subject]) {
      subjectToCountDict[message.subject] = 0;
    }

    subjectToCountDict[message.subject]!++;

    console.log(
      "Received message",
      JSON.stringify({
        messageSeq: message.seq,
        streamSeq: message.info.streamSequence,
        subjectToCountDict,
      })
    );

    await message.ackAck();
  }
}

main().catch((error) => {
  console.error(error);

  process.exitCode = 1;
});

let shutdownSignalCount = 0;
async function handleShutdown() {
  if (shutdownSignalCount === 1) {
    console.warn("Force shutdown");

    return process.exit(process.exitCode ?? 0);
  }

  console.log("Start graceful shutdown sequence...");

  await nc?.drain();
  await nc?.close();
  await unlink(PID_FILE_PATH);

  console.log("Finish graceful shutdown sequence");
}
