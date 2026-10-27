#!/bin/bash
# make_e4scl_profile.sh - build an e4s-cl profile for Midway3's Intel MPI 2021.5
#
# Normally you would just run:
#     module load intelmpi/2021.5
#     e4s-cl init --backend apptainer --image $E4S_IMAGE
# and e4s-cl would trace a small MPI program to discover which host libraries
# and files the MPI library needs. That tracing uses ptrace(2), which Midway3
# disables for security (kernel.yama.ptrace_scope = 3), so here we create the
# same profile by hand. The library list below is what Intel MPI actually loads
# on Midway3 (captured with LD_DEBUG=libs on a 2-node run).
#
# Usage:  ./make_e4scl_profile.sh [profile-name]      (default: midway3-impi)

set -eo pipefail
PROFILE=${1:-midway3-impi}

: "${E4S_IMAGE:?source the workshop env.sh first}"
type module >/dev/null 2>&1 || source /etc/profile.d/zzz-rcc.sh
module load intelmpi/2021.5
IMPI=$I_MPI_ROOT

# Host libraries to inject into the container. e4s-cl resolves their
# dependencies itself, and skips anything (like glibc) that must come from the
# container.
LIBS=(
    "$IMPI/lib/release/libmpi.so.12"           # Intel MPI (MPICH ABI: libmpi.so.12)
    "$IMPI/lib/libmpifort.so.12"               # Fortran bindings
    "$IMPI/libfabric/lib/libfabric.so.1"       # OFI transport layer
    /usr/lib64/libibverbs.so.1                 # InfiniBand verbs
    /usr/lib64/librdmacm.so.1
    /usr/lib64/libibverbs/libmlx5-rdmav34.so   # Mellanox HCA driver
    /usr/lib64/libnl-3.so.200
    /usr/lib64/libnl-route-3.so.200
    /usr/lib64/libnuma.so.1
    /usr/lib64/libucp.so.0 /usr/lib64/libuct.so.0 /usr/lib64/libucs.so.0 /usr/lib64/libucm.so.0
)

# Files and directories that are opened by path at run time, bound at the
# same location inside the container.
FILES=(
    "$IMPI/etc"                                # Intel MPI tuning files
    "$IMPI/libfabric/lib/prov"                 # libfabric providers (FI_PROVIDER_PATH)
    /etc/libibverbs.d                          # verbs driver configuration
    /usr/lib64/libibverbs                      # verbs provider plugins ...
    "$(readlink -f /usr/lib64/libibverbs/libmlx5-rdmav34.so)"   # ... and the file they point to
    /usr/lib64/ucx                             # UCX transport modules
    /software/slurm-current-el8-x86_64/lib/libpmi2.so           # I_MPI_PMI_LIBRARY for srun
)

e4s-cl profile delete "$PROFILE" >/dev/null 2>&1 || true
e4s-cl profile create "$PROFILE" --backend apptainer --image "$E4S_IMAGE"
e4s-cl profile edit "$PROFILE" --add-libraries "${LIBS[@]}"
e4s-cl profile edit "$PROFILE" --add-files "${FILES[@]}"
e4s-cl profile select "$PROFILE"
e4s-cl profile show "$PROFILE"
