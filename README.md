# Filter subject missing messages

Having a consumer with the filter subjects `example.part, example.*.part` leads to the consumer **NOT** receiving messages from the stream.

The most confusing part is that message are left in the stream with the retention policy "Interest" which implies the're consumers expecting to receive them.

Scenarios:

- [`produce-part-consume-part.sh`](./produce-part-consume-part.sh)

  - Produces messages with the expected subject, illustrates that the consumer may never receive messages.

- [`produce-part-consume-global.sh`](./produce-part-consume-global.sh)
  - Produces messages with the expected subject, behaves correctly.

> Make sure the re-create NATS container between the runs so it has the fresh state every time.
