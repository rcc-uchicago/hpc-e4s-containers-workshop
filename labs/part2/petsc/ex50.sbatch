#!/bin/bash
#SBATCH --job-name=petsc-ex50
#SBATCH --nodes=1
#SBATCH --ntasks=4
#SBATCH --time=00:10:00
#SBATCH --output=%x-%j.out
#
# Challenge: compile your own code against a library in the image, then run it.
# PETSc example ex50 (2-D Poisson, DMDA + KSP), adapted from the E4S/ParaTools
# examples, solved with PETSc's algebraic multigrid (GAMG).
#
# Try the ParaTools options instead:  -pc_type lu -pc_factor_mat_solver_type superlu_dist
# Why does that fail with this image? (hint: spack find -v petsc@3.25.1)

source "$E4S_WORKSHOP/env.sh"

# 1. Compile inside the container with PETSc's own makefile rules.
apptainer exec --writable-tmpfs "$E4S_IMAGE" bash -c '
    source /spack/share/spack/setup-env.sh
    spack load mpich
    export PETSC_DIR=$(spack location -i petsc@3.25.1)
    make ex50'

# 2. Run on 4 ranks.
srun --mpi=pmi2 apptainer exec "$E4S_IMAGE" ./ex50 \
    -da_grid_x 512 -da_grid_y 512 \
    -ksp_type cg -pc_type gamg \
    -ksp_monitor -log_view | grep -E "Residual norm|KSPSolve |^Time \(sec\)"
