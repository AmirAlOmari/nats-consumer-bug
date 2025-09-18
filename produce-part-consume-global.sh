#!/bin/bash

set -x

# Setup
./steps/create-stream.sh
./steps/create-global-consumer.sh

# Print
./steps/print-streams-report.sh
./steps/print-consumers-report.sh

# Consume in background
./steps/consume-global.sh &
sleep 3

# Produce
./steps/produce-part.sh

sleep 3

# Print
./steps/print-streams-report.sh
./steps/print-consumers-report.sh

for PID_FILE in ./*.pid; do
	if [[ -f "$PID_FILE" ]]; then
		PID=$(basename "$PID_FILE" .pid)
		kill "$PID"
	fi
done
