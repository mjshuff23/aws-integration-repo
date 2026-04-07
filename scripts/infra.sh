#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="${ROOT_DIR}/infra/terraform"
TFVARS_FILE="${TFVARS_FILE:-${TF_DIR}/terraform.tfvars}"
BACKUP_DIR="${TF_DIR}/state-backups"
DEFAULT_DIAGRAM_OUTPUT="${ROOT_DIR}/frontend/public/architecture/terraform-inframap.svg"

usage() {
  cat <<'EOF'
Usage: ./scripts/infra.sh <command> [terraform args...]

Commands:
  init          Initialize Terraform in infra/terraform
  plan          Run terraform plan with terraform.tfvars
  up            Run terraform apply with terraform.tfvars
  down          Run terraform destroy with terraform.tfvars
  diagram       Generate an Inframap SVG for the frontend architecture page
  outputs       Show terraform outputs
  status        Show tracked resources and outputs
  backup-state  Save a timestamped snapshot of the current local state

Notes:
  - State snapshots are backups only. Do not restore an old snapshot after a
    successful destroy unless you are intentionally repairing state.
  - By default this script uses infra/terraform/terraform.tfvars.
  - Override TFVARS_FILE if you want a different tfvars path.
EOF
}

log() {
  printf '[infra] %s\n' "$*"
}

require_terraform() {
  if ! command -v terraform >/dev/null 2>&1; then
    printf 'terraform is required but was not found in PATH.\n' >&2
    exit 1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    printf 'docker is required to generate the Terraform diagram.\n' >&2
    exit 1
  fi
}

ensure_tfvars() {
  if [[ ! -f "${TFVARS_FILE}" ]]; then
    printf 'Missing tfvars file: %s\n' "${TFVARS_FILE}" >&2
    printf 'Create it from infra/terraform/terraform.tfvars.example first.\n' >&2
    exit 1
  fi
}

terraform_cmd() {
  (
    cd "${TF_DIR}"
    terraform "$@"
  )
}

ensure_initialized() {
  if [[ ! -d "${TF_DIR}/.terraform" ]]; then
    log "Initializing Terraform"
    terraform_cmd init -input=false
  fi
}

snapshot_state() {
  mkdir -p "${BACKUP_DIR}"

  local timestamp suffix state_file outputs_file
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  suffix="${1:-manual}"
  state_file="${BACKUP_DIR}/${timestamp}-${suffix}.tfstate"
  outputs_file="${BACKUP_DIR}/${timestamp}-${suffix}.outputs.json"

  if terraform_cmd state pull >"${state_file}" 2>/dev/null; then
    log "Saved state snapshot to ${state_file}"
  else
    rm -f "${state_file}"
    log "No readable Terraform state to snapshot yet"
    return 0
  fi

  if terraform_cmd output -json >"${outputs_file}" 2>/dev/null; then
    log "Saved outputs snapshot to ${outputs_file}"
  else
    rm -f "${outputs_file}"
  fi
}

command_init() {
  terraform_cmd init -input=false "$@"
}

command_plan() {
  ensure_tfvars
  ensure_initialized
  snapshot_state "plan"
  terraform_cmd plan -input=false -var-file="${TFVARS_FILE}" "$@"
}

command_up() {
  ensure_tfvars
  ensure_initialized
  snapshot_state "apply-before"
  terraform_cmd apply -input=false -var-file="${TFVARS_FILE}" "$@"
  snapshot_state "apply-after"
}

command_down() {
  ensure_tfvars
  ensure_initialized
  snapshot_state "destroy-before"
  terraform_cmd destroy -input=false -var-file="${TFVARS_FILE}" "$@"
  snapshot_state "destroy-after"
}

command_outputs() {
  ensure_initialized
  terraform_cmd output "$@"
}

command_diagram() {
  ensure_initialized
  require_docker

  local output_file output_dir assets_dir asset_prefix temp_dir state_file raw_svg asset_list generate_cmd
  output_file="${1:-${TF_DIAGRAM_OUTPUT:-${DEFAULT_DIAGRAM_OUTPUT}}}"
  output_dir="$(dirname "${output_file}")"
  assets_dir="${TF_DIAGRAM_ASSETS_DIR:-${output_dir}/inframap-assets}"
  asset_prefix="${TF_DIAGRAM_ASSET_PREFIX:-./inframap-assets}"

  mkdir -p "${output_dir}"
  rm -rf "${assets_dir}"
  mkdir -p "${assets_dir}"

  temp_dir="$(mktemp -d)"
  state_file="${temp_dir}/state.tfstate"
  raw_svg="${temp_dir}/terraform-inframap.raw.svg"
  asset_list="${temp_dir}/asset-paths.txt"
  trap "rm -rf '${temp_dir}'" EXIT

  if terraform_cmd state pull >"${state_file}" 2>/dev/null && [[ -s "${state_file}" ]]; then
    log "Generating Terraform diagram from current state"
    generate_cmd='/home/inframap/inframap generate --tfstate /work/state.tfstate'
  else
    log "No readable Terraform state found; generating Terraform diagram from HCL"
    generate_cmd='/home/inframap/inframap generate --hcl /terraform'
  fi

  docker run --rm \
    -v "${temp_dir}:/work:rw" \
    -v "${TF_DIR}:/terraform:ro" \
    --entrypoint /bin/sh \
    cycloid/inframap \
    -lc "
      set -e
      ${generate_cmd} | dot -Tsvg > /work/terraform-inframap.raw.svg
      grep -o '/home/inframap/.cache/inframap/assets[^\" ]*' /work/terraform-inframap.raw.svg | sort -u > /work/asset-paths.txt || true
      if [ -s /work/asset-paths.txt ]; then
        while IFS= read -r asset; do
          [ -n \"\$asset\" ] || continue
          rel=\${asset#/home/inframap/.cache/inframap/assets/}
          mkdir -p \"/work/exported-assets/\$(dirname \"\$rel\")\"
          cp \"\$asset\" \"/work/exported-assets/\$rel\"
        done < /work/asset-paths.txt
      fi
    "

  if [[ -d "${temp_dir}/exported-assets" ]]; then
    cp -R "${temp_dir}/exported-assets/." "${assets_dir}"
  fi

  sed "s|/home/inframap/.cache/inframap/assets|${asset_prefix}|g" "${raw_svg}" >"${output_file}"

  log "Saved Terraform diagram to ${output_file}"
}

command_status() {
  ensure_initialized
  log "Tracked resources"
  terraform_cmd state list || true
  printf '\n'
  log "Outputs"
  terraform_cmd output || true
}

main() {
  require_terraform

  local command="${1:-}"
  if [[ -z "${command}" ]]; then
    usage
    exit 1
  fi

  shift || true

  case "${command}" in
    init)
      command_init "$@"
      ;;
    plan)
      command_plan "$@"
      ;;
    up)
      command_up "$@"
      ;;
    down)
      command_down "$@"
      ;;
    diagram)
      command_diagram "$@"
      ;;
    outputs)
      command_outputs "$@"
      ;;
    status)
      command_status "$@"
      ;;
    backup-state)
      ensure_initialized
      snapshot_state "manual"
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      printf 'Unknown command: %s\n\n' "${command}" >&2
      usage
      exit 1
      ;;
  esac
}

main "$@"
