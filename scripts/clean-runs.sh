#!/bin/bash
# Usage: T=<token> ./clean-runs.sh  -> deletes every run that is not completed+success
A=https://api.github.com/repos/redspark-ai/Runner-test/actions/runs
H="Authorization: Bearer $T"
curl -s -H "$H" "$A?per_page=100" | python3 -c "
import sys,json
for r in json.load(sys.stdin)['workflow_runs']:
    if not(r['status']=='completed' and r['conclusion']=='success'): print(r['id'],r['status'])" |
while read id st; do
  [ "$st" != completed ] && curl -s -o /dev/null -X POST -H "$H" "$A/$id/cancel" && sleep 3
  curl -s -o /dev/null -X DELETE -H "$H" "$A/$id"; n=$((n+1))
done
echo "deleted ${n:-0} runs"
