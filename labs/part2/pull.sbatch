#!/bin/bash
#SBATCH --job-name=pull
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=4
#SBATCH --time=00:15:00
#SBATCH --output=%x-%j.out
#
# Pull the E4S "cache-backed" image (Spack + MPICH, 1.5 GB) from Docker Hub and
# convert it to a single SIF file. Same command you would type interactively;
# the conversion step is CPU-heavy, so it belongs on a compute node.

source "$E4S_WORKSHOP/env.sh"
time apptainer pull --force e4s-spack-cpu_26.06.sif docker://ecpe4s/e4s-spack-cpu:26.06
ls -lh e4s-spack-cpu_26.06.sif
