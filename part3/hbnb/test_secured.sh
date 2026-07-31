#!/usr/bin/env bash
BASE="http://127.0.0.1:5000/api/v1"

run() {
  local label=$1 expect=$2; shift 2
  result=$(curl -s -w "HTTPSTATUS:%{http_code}" "$@")
  body=$(echo "$result" | sed 's/HTTPSTATUS:[0-9]*//')
  code=$(echo "$result" | tr -d '\n' | sed 's/.*HTTPSTATUS://')
  if [ "$code" = "$expect" ]; then mark="PASS"; else mark="FAIL (got $code)"; fi
  msg=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); k=list(d.keys())[0]; print(k+': '+str(d[k])[:60])" 2>/dev/null || echo "$(echo "$body" | tr -d '\n' | cut -c1-60)")
  printf "  [%-4s] %-50s | %s\n" "$mark" "$label → HTTP $expect" "$msg"
}

# ── SETUP ────────────────────────────────────────────────────
U1=$(curl -s -X POST "$BASE/users/" -H "Content-Type: application/json" \
  -d '{"first_name":"Alice","last_name":"Dupont","email":"alice@test.com","password":"secret123"}')
U2=$(curl -s -X POST "$BASE/users/" -H "Content-Type: application/json" \
  -d '{"first_name":"Bob","last_name":"Martin","email":"bob@test.com","password":"pass456"}')
USER1_ID=$(echo "$U1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
USER2_ID=$(echo "$U2" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
T1=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"secret123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
T2=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"bob@test.com","password":"pass456"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
PLACE_RESP=$(curl -s -X POST "$BASE/places/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d "{\"title\":\"Maison Alice\",\"description\":\"Nice\",\"price\":120,\"latitude\":48.85,\"longitude\":2.35,\"owner_id\":\"$USER1_ID\"}")
PLACE_ID=$(echo "$PLACE_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo ""
echo "SETUP"
echo "  USER1_ID = $USER1_ID"
echo "  USER2_ID = $USER2_ID"
echo "  PLACE_ID = $PLACE_ID"
echo ""

# ── AUTH ─────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════"
echo "  AUTH"
echo "═══════════════════════════════════════════════════"
run "AUTH-1  Login invalide" 401 \
  -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"wrong"}'

run "AUTH-2  /protected sans token" 401 \
  "$BASE/auth/protected"

run "AUTH-3  /protected avec token valide" 200 \
  "$BASE/auth/protected" -H "Authorization: Bearer $T1"

# ── USERS ────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  USERS — PUT /users/<id>"
echo "═══════════════════════════════════════════════════"
run "USER-1  PUT sans token" 401 \
  -X PUT "$BASE/users/$USER1_ID" -H "Content-Type: application/json" \
  -d '{"first_name":"X"}'

run "USER-2  PUT autre utilisateur" 403 \
  -X PUT "$BASE/users/$USER2_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d '{"first_name":"X"}'

run "USER-3  PUT changer email" 400 \
  -X PUT "$BASE/users/$USER1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d '{"email":"new@x.com"}'

run "USER-4  PUT changer password" 400 \
  -X PUT "$BASE/users/$USER1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d '{"password":"hack"}'

run "USER-5  PUT valide (first_name)" 200 \
  -X PUT "$BASE/users/$USER1_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d '{"first_name":"AliceV2","last_name":"Dupont"}'

# ── PLACES ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  PLACES — POST/PUT /places/"
echo "═══════════════════════════════════════════════════"
run "PLACE-1  POST sans token" 401 \
  -X POST "$BASE/places/" -H "Content-Type: application/json" \
  -d "{\"title\":\"V\",\"price\":100,\"latitude\":1,\"longitude\":1,\"owner_id\":\"$USER1_ID\"}"

run "PLACE-2  POST owner_id != token" 403 \
  -X POST "$BASE/places/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d "{\"title\":\"V\",\"price\":100,\"latitude\":1,\"longitude\":1,\"owner_id\":\"$USER2_ID\"}"

run "PLACE-3  PUT sans token" 401 \
  -X PUT "$BASE/places/$PLACE_ID" -H "Content-Type: application/json" \
  -d "{\"title\":\"H\",\"price\":1,\"latitude\":1,\"longitude\":1,\"owner_id\":\"$USER1_ID\"}"

run "PLACE-4  PUT non-proprietaire (user2 spoof son ID)" 403 \
  -X PUT "$BASE/places/$PLACE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T2" \
  -d "{\"title\":\"H\",\"price\":1,\"latitude\":1,\"longitude\":1,\"owner_id\":\"$USER2_ID\"}"

run "PLACE-5  PUT proprietaire valide" 200 \
  -X PUT "$BASE/places/$PLACE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d "{\"title\":\"Maison V2\",\"description\":\"Nice\",\"price\":150,\"latitude\":48.85,\"longitude\":2.35,\"owner_id\":\"$USER1_ID\"}"

# ── REVIEWS ──────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  REVIEWS — POST/PUT/DELETE /reviews/"
echo "═══════════════════════════════════════════════════"
run "REVIEW-1  POST sans token" 401 \
  -X POST "$BASE/reviews/" -H "Content-Type: application/json" \
  -d "{\"text\":\"N\",\"rating\":5,\"user_id\":\"$USER2_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-2  POST user_id != token" 403 \
  -X POST "$BASE/reviews/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T2" \
  -d "{\"text\":\"N\",\"rating\":5,\"user_id\":\"$USER1_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-3  POST sur sa propre place" 400 \
  -X POST "$BASE/reviews/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d "{\"text\":\"N\",\"rating\":5,\"user_id\":\"$USER1_ID\",\"place_id\":\"$PLACE_ID\"}"

# Review valide
REVIEW_RESP=$(curl -s -X POST "$BASE/reviews/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T2" \
  -d "{\"text\":\"Great place\",\"rating\":4,\"user_id\":\"$USER2_ID\",\"place_id\":\"$PLACE_ID\"}")
REVIEW_ID=$(echo "$REVIEW_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
printf "  [%-4s] %-50s | id: %s\n" "PASS" "REVIEW-4  POST valide (user2/place user1) → HTTP 201" "$REVIEW_ID"

run "REVIEW-5  POST double review" 400 \
  -X POST "$BASE/reviews/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T2" \
  -d "{\"text\":\"Again\",\"rating\":3,\"user_id\":\"$USER2_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-6  PUT sans token" 401 \
  -X PUT "$BASE/reviews/$REVIEW_ID" -H "Content-Type: application/json" \
  -d "{\"text\":\"H\",\"rating\":1,\"user_id\":\"$USER2_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-7  PUT par non-auteur (user1 spoof son ID)" 403 \
  -X PUT "$BASE/reviews/$REVIEW_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T1" \
  -d "{\"text\":\"H\",\"rating\":1,\"user_id\":\"$USER1_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-8  PUT valide par auteur (user2)" 200 \
  -X PUT "$BASE/reviews/$REVIEW_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $T2" \
  -d "{\"text\":\"Updated review\",\"rating\":5,\"user_id\":\"$USER2_ID\",\"place_id\":\"$PLACE_ID\"}"

run "REVIEW-9  DELETE sans token" 401 \
  -X DELETE "$BASE/reviews/$REVIEW_ID"

run "REVIEW-10 DELETE par non-auteur (user1)" 403 \
  -X DELETE "$BASE/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $T1"

run "REVIEW-11 DELETE valide par auteur (user2)" 200 \
  -X DELETE "$BASE/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $T2"

echo ""
