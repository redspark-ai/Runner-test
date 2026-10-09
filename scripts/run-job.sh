#!/bin/bash
# Usage: T=<token> ./run-job.sh <workflow.yml> <results/file> <outpath> [maxwait_s=900]
# One call: dispatch, wait inside (zero tokens), fetch, print ONE line.
W=$1; F=$2; O=$3; MAX=${4:-900}
A=https://api.github.com/repos/redspark-ai/Runner-test
H="Authorization: Bearer $T"
RUNS="$A/actions/workflows/$W/runs?event=workflow_dispatch&per_page=1"
ID='import sys,json;d=json.load(sys.stdin)["workflow_runs"];print(d[0]["id"] if d else 0)'
last=$(curl -s -H "$H" "$RUNS" | python3 -c "$ID")
c=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "$H" "$A/actions/workflows/$W/dispatches" -d '{"ref":"main"}')
[ "$c" = 204 ] || { echo "dispatch failed $c"; exit 1; }
# wait until the NEW run appears (never trust the previous run)
id=0; t=0
while [ $t -lt 90 ]; do
  sleep 3; t=$((t+3))
  n=$(curl -s -H "$H" "$RUNS" | python3 -c "$ID")
  if [ "$n" != "$last" ] && [ "$n" != 0 ]; then id=$n; break; fi
done
[ "$id" != 0 ] || { echo "run never started"; exit 1; }
# wait for that run to finish
t=0; s=""
while [ $t -lt $MAX ]; do
  s=$(curl -s -H "$H" "$A/actions/runs/$id" | python3 -c "import sys,json;r=json.load(sys.stdin);print(r['status'],r.get('conclusion'))")
  case "$s" in completed*) break;; esac
  sleep 30; t=$((t+30))
done
if [ "$s" != "completed success" ]; then
  step=$(curl -s -H "$H" "$A/actions/runs/$id/jobs" | python3 -c "
import sys,json
for j in json.load(sys.stdin).get('jobs',[]):
    for st in j['steps']:
        if st.get('conclusion')=='failure': print(st['name']); sys.exit()
print('unknown')")
  echo "not done: $s | failed step: $step | run $id"; exit 1
fi
# fetch via API (no CDN cache)
mkdir -p "$(dirname "$O")"
code=$(curl -s -o "$O" -w "%{http_code}" -H "$H" -H "Accept: application/vnd.github.raw" "$A/contents/$F?ref=main")
[ "$code" = 200 ] && [ -s "$O" ] || { echo "fetch failed $code for $F"; exit 1; }
echo "done $(wc -c < "$O") bytes -> $O"
