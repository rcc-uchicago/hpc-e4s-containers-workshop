#!/bin/bash
#SBATCH --job-name=lammps
#SBATCH --nodes=1
#SBATCH --ntasks=8
#SBATCH --time=00:10:00
#SBATCH --output=%x-%j.out
#
# LAMMPS Lennard-Jones melt (the classic LAMMPS benchmark) run from the E4S image.
# Nothing is installed: the application, its MPI and every library come from the SIF.
# Input adapted from the E4S/ParaTools examples (github.com/ParaToolsInc/e4s-cloud-examples).

source "$E4S_WORKSHOP/env.sh"

# Ask Spack inside the image where it installed LAMMPS.
LMP=$(apptainer exec --writable-tmpfs "$E4S_IMAGE" \
      bash -c 'source /spack/share/spack/setup-env.sh && spack location -i lammps')/bin/lmp
echo "LAMMPS inside the container: $LMP"

# One container per MPI rank; the container's MPICH talks to Slurm through PMI2.
# x/y/z = 2 doubles the box in each direction: 256,000 atoms.
srun --mpi=pmi2 apptainer exec "$E4S_IMAGE" "$LMP" -in in.lj -var x 2 -var y 2 -var z 2
