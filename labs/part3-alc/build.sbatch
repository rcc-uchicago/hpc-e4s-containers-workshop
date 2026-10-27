#!/bin/bash
#SBATCH --job-name=alc-build
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=8
#SBATCH --time=00:20:00
#SBATCH --output=%x-%j.out
#
# Build the image described by hypre.def (written by 'e4s-alc create -f hypre.yaml').
# --fakeroot lets an ordinary user act as root inside the build, so apt-get works;
# nothing on the host is touched.

source "$E4S_WORKSHOP/env.sh"
export APPTAINER_TMPDIR=${TMPDIR:-/tmp}      # node-local scratch for the build sandbox
time apptainer build --fakeroot --force hypre.sif hypre.def
ls -lh hypre.sif
