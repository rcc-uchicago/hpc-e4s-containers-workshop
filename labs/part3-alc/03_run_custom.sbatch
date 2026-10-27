#!/bin/bash
#SBATCH --job-name=alc-run
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=4
#SBATCH --time=00:10:00
#SBATCH --output=%x-%j.out
#
# Use the image you just built: compile hypre_test against *its* hypre, then run
# it on two nodes with e4s-cl swapping in Midway3's Intel MPI.

source "$E4S_WORKSHOP/env.sh"
cp ../part3-mpi/hypre_test.c .
apptainer exec --writable-tmpfs hypre.sif bash -c '
    source /spack/share/spack/setup-env.sh && spack load mpich hypre
    H=$(spack location -i hypre)
    mpicc -O2 -o hypre_test_custom hypre_test.c -DHYPRE_TIMING -I$H/include -L$H/lib -Wl,-rpath,$H/lib -lHYPRE -lm'

module load intelmpi/2021.5
echo "=== hypre_test from the e4s-alc image, host Intel MPI via e4s-cl"
e4s-cl launch --image "$PWD/hypre.sif" mpirun -np 8 -ppn 4 ./hypre_test_custom -P 2 2 2 -n 60 60 60
