#!/bin/bash
# compile.sh - build the MPI programs *inside* the E4S container, against the
# container's own MPICH and the container's hypre.
#
#   pingpong    reports which MPI library it runs on, then measures latency/bandwidth
#   hypre_test  solves a 3-D Laplace problem with hypre's AMG-preconditioned CG
#               (example from the E4S/ParaTools tutorials)

set -eo pipefail
source "${E4S_WORKSHOP:?source the workshop env.sh first}/env.sh"
cd "$(dirname "$0")"
IMAGE=${1:-$E4S_IMAGE}

# --writable-tmpfs gives Spack a scratch layer for its lock files; the image itself
# stays read-only and nothing written there survives the command.
apptainer exec --writable-tmpfs "$IMAGE" bash -c '
    set -e
    source /spack/share/spack/setup-env.sh
    spack load mpich hypre
    HYPRE_DIR=$(spack location -i hypre)
    echo "Compiling with: $(command -v mpicc)"
    echo "Linking hypre:  $HYPRE_DIR"
    mpicc -O2 -o pingpong mpi_pingpong.c
    mpicc -O2 -o hypre_test hypre_test.c -DHYPRE_TIMING \
          -I$HYPRE_DIR/include -L$HYPRE_DIR/lib -Wl,-rpath,$HYPRE_DIR/lib -lHYPRE -lm
    echo
    echo "pingpong is linked against:"
    ldd pingpong | grep -E "libmpi"
'
