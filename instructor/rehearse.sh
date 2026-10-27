#!/bin/bash
# rehearse.sh - run every lab exercise the way a participant would, from a fresh
# copy of the labs, as a chain of batch jobs. Use it after setup_shared.sh to check
# the install end to end (takes ~10 minutes of queue + run time).
#
#   source /project/rcc/workshops/e4s/env.sh
#   instructor/rehearse.sh [workdir]        # default $E4S_SCRATCH/e4s-rehearsal

set -eo pipefail
: "${E4S_WORKSHOP:?source the workshop env.sh first}"
W=${1:-$E4S_SCRATCH/e4s-rehearsal}
rm -rf "$W" && cp -r "$E4S_WORKSHOP/labs" "$W"
echo "Rehearsing in $W"

jid() { sbatch --parsable "$@"; }

cd "$W/part2"
J1=$(jid lammps.sbatch)
J2=$(jid pull.sbatch)
(cd petsc && jid ex50.sbatch >/dev/null)

cd "$W/part3-mpi"
./compile.sh > compile.log 2>&1
./make_e4scl_profile.sh > profile.log 2>&1
J3=$(jid 01_container_mpi.sbatch)
J4=$(jid 02_e4s-cl.sbatch)

cd "$W/part3-alc"
e4s-alc create -f hypre.yaml > create.log 2>&1
J5=$(jid build.sbatch)
J6=$(jid --dependency=afterok:$J5 03_run_custom.sbatch)

echo "Submitted: lammps=$J1 pull=$J2 container-mpi=$J3 e4s-cl=$J4 alc-build=$J5 alc-run=$J6"
echo "When they finish:  $(dirname "$0")/check_rehearsal.sh $W"
