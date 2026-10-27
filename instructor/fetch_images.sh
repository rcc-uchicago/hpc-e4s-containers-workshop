#!/bin/bash
# fetch_images.sh - download the workshop images into ../images
#
# Run on a compute node (the SIF conversion in 'apptainer pull' is CPU heavy):
#   sinteractive -c 8 -t 2:00:00
#   instructor/fetch_images.sh [--gpu]
#
#   e4s-cpu-x86_64-26.06.sif   25.5 GB  E4S 26.06, CPU build (Ubuntu 24.04)   ~30 min at 13 MB/s
#   ecpe4s-ubuntu24.04.sif      1.2 GB  Spack-ready base image for e4s-alc     ~1 min
#   e4s-cuda80-x86_64-26.06.sif 34 GB   (--gpu) E4S 26.06, CUDA sm_80 build, for an optional GPU demo

set -euo pipefail
DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/images
mkdir -p "$DIR" && cd "$DIR"

type module >/dev/null 2>&1 || source /etc/profile.d/zzz-rcc.sh
module load apptainer/1.4.1
export APPTAINER_CACHEDIR=${APPTAINER_CACHEDIR:-/scratch/midway3/$USER/.apptainer/cache}
export APPTAINER_TMPDIR=${TMPDIR:-/tmp}

E4S_URL=https://oaciss.nic.uoregon.edu/e4s/images/26.06

# The E4S project publishes ready-made SIF files, so a plain download is all we need
# (curl -C - resumes an interrupted transfer).
curl -L -C - -o e4s-cpu-x86_64-26.06.sif "$E4S_URL/e4s-cpu-x86_64-26.06.sif"

# The e4s-alc base image only exists on Docker Hub; apptainer converts it to SIF.
[ -f ecpe4s-ubuntu24.04.sif ] || apptainer pull ecpe4s-ubuntu24.04.sif docker://ecpe4s/ubuntu24.04:latest

if [ "${1:-}" = "--gpu" ]; then
    curl -L -C - -o e4s-cuda80-x86_64-26.06.sif "$E4S_URL/e4s-cuda80-x86_64-26.06.sif"
fi
ls -lh "$DIR"
