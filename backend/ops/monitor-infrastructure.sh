#!/usr/bin/env bash
set -Eeuo pipefail

PUBLIC_HOST="${PUBLIC_HOST:?PUBLIC_HOST não configurado}"
HEALTH_URL="${LIFEGUARD_HEALTH_URL:-https://${PUBLIC_HOST}/health}"
DISK_THRESHOLD="${LIFEGUARD_DISK_THRESHOLD:-85}"
STATE_DIR="${LIFEGUARD_MONITOR_STATE_DIR:-/home/ubuntu/.local/state/lifeguard-monitor}"
STATE_FILE="${STATE_DIR}/last-status"

mkdir -p "${STATE_DIR}"
chmod 700 "${STATE_DIR}"

problems=()
health_response="$(curl --fail --silent --show-error --max-time 15 "${HEALTH_URL}" 2>&1)" || \
  problems+=("API indisponível em ${HEALTH_URL}: ${health_response}")
if (( ${#problems[@]} == 0 )) && [[ "${health_response}" != *'"banco":"ok"'* ]]; then
  problems+=("A API respondeu, mas não confirmou a conexão com o PostgreSQL.")
fi

disk_used="$(df -P / | awk 'NR == 2 { gsub(/%/, "", $5); print $5 }')"
if [[ ! "${disk_used}" =~ ^[0-9]+$ ]]; then
  problems+=("Não foi possível medir o uso do disco principal.")
elif (( disk_used >= DISK_THRESHOLD )); then
  problems+=("Disco principal com ${disk_used}% de uso; limite configurado: ${DISK_THRESHOLD}%.")
fi

current_status="ok"
if (( ${#problems[@]} > 0 )); then
  current_status="failure"
fi
previous_status="unknown"
if [[ -f "${STATE_FILE}" ]]; then
  previous_status="$(<"${STATE_FILE}")"
fi

send_email() {
  local subject="$1"
  local body="$2"

  if [[ -z "${MONITOR_ALERT_EMAIL:-}" || -z "${SMTP_HOST:-}" || -z "${SMTP_USER:-}" || -z "${SMTP_PASSWORD:-}" || -z "${EMAIL_FROM:-}" ]]; then
    printf 'Aviso por e-mail não configurado; registre MONITOR_ALERT_EMAIL e as variáveis SMTP.\n' >&2
    return 0
  fi

  local from_address="${EMAIL_FROM}"
  if [[ "${EMAIL_FROM}" =~ \<([^\>]*)\> ]]; then
    from_address="${BASH_REMATCH[1]}"
  fi

  local message_file
  message_file="$(mktemp)"
  {
    printf 'From: %s\r\n' "${EMAIL_FROM}"
    printf 'To: %s\r\n' "${MONITOR_ALERT_EMAIL}"
    printf 'Subject: %s\r\n' "${subject}"
    printf 'Content-Type: text/plain; charset=UTF-8\r\n'
    printf '\r\n%b\r\n' "${body}"
  } > "${message_file}"

  local smtp_scheme="smtp"
  local tls_options=(--ssl-reqd)
  if [[ "${SMTP_SECURE:-false}" == "true" ]]; then
    smtp_scheme="smtps"
    tls_options=()
  fi

  local curl_result=0
  curl --fail --silent --show-error \
    --url "${smtp_scheme}://${SMTP_HOST}:${SMTP_PORT:-587}" \
    "${tls_options[@]}" \
    --user "${SMTP_USER}:${SMTP_PASSWORD}" \
    --mail-from "${from_address}" \
    --mail-rcpt "${MONITOR_ALERT_EMAIL}" \
    --upload-file "${message_file}" || curl_result=$?
  rm -f -- "${message_file}"
  return "${curl_result}"
}

if [[ "${current_status}" != "${previous_status}" ]]; then
  if [[ "${current_status}" == "failure" ]]; then
    details="$(printf '%s\n' "${problems[@]}")"
    send_email "LifeGuard: falha na infraestrutura" "O monitoramento detectou um problema:\n\n${details}\n\nHorário UTC: $(date -u --iso-8601=seconds)"
  elif [[ "${previous_status}" == "failure" ]]; then
    send_email "LifeGuard: infraestrutura recuperada" "A API e o disco da VM voltaram ao estado normal.\n\nHorário UTC: $(date -u --iso-8601=seconds)"
  fi
fi

state_temp="${STATE_FILE}.tmp"
printf '%s\n' "${current_status}" > "${state_temp}"
mv -- "${state_temp}" "${STATE_FILE}"

if [[ "${current_status}" == "failure" ]]; then
  printf 'Falha no monitoramento:\n%s\n' "$(printf '%s\n' "${problems[@]}")" >&2
  exit 1
fi

printf 'Monitoramento normal: API e banco acessíveis; disco em %s%%.\n' "${disk_used}"
