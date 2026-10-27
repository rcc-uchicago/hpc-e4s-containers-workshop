#!/bin/bash
#SBATCH --job-name=mpi-e4s-cl
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=4
#SBATCH --time=00:10:00
#SBATCH --output=%x-%j.out
#
# Same container, same binaries, but e4s-cl injects Midway3's Intel MPI (and its
# InfiniBand stack) into each container at launch. Intel MPI and MPICH share the
# MPICH ABI (libmpi.so.12), so the container-built programs run unchanged.
#
# Prerequisite: ./make_e4scl_profile.sh (once).

source "$E4S_WORKSHOP/env.sh"
module load intelmpi/2021.5

echo "=== ping-pong: container binary, host Intel MPI"
e4s-cl launch mpirun -np 2 -ppn 1 ./pingpong

echo
echo "=== hypre AMG-PCG, 8 ranks on 2 nodes"
e4s-cl launch mpirun -np 8 -ppn 4 ./hypre_test -P 2 2 2 -n 60 60 60
