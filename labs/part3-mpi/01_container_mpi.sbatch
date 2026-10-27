#!/bin/bash
#SBATCH --job-name=mpi-container
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --time=00:05:00
#SBATCH --output=%x-%j.out
#
# Run the container-built ping-pong across two nodes with the container's own
# MPICH. Slurm starts one container per rank; MPICH finds its peers through
# Slurm's PMI2 interface.
#
# Note: no --cleanenv here. MPI needs the PMI_* variables Slurm sets for each rank.

source "$E4S_WORKSHOP/env.sh"
srun --mpi=pmi2 apptainer exec "$E4S_IMAGE" ./pingpong
