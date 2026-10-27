#!/bin/bash
# check_rehearsal.sh - summarize the outputs of rehearse.sh
W=${1:-${E4S_SCRATCH:-/scratch/midway3/$USER}/e4s-rehearsal}
ok()  { printf '  %-28s %s\n' "$1" "OK  $2"; }
bad() { printf '  %-28s %s\n' "$1" "FAIL  (see $3)"; FAILED=1; }
check() {  # label, file-glob, pattern, detail-pattern
    local f; f=$(ls -t $2 2>/dev/null | head -1)
    if [ -n "$f" ] && grep -q -E "$3" "$f"; then ok "$1" "$(grep -E "$4" "$f" | head -1 | sed 's/^ *//' | cut -c1-70)"
    else bad "$1" "" "${f:-$2}"; fi
}
echo "Rehearsal results in $W"
check "Part 2  pull"             "$W/part2/pull-*.out"                 "e4s-spack-cpu_26.06.sif"   "^real"
check "Part 2  LAMMPS"           "$W/part2/lammps-*.out"               "Performance:"              "Matom-step"
check "Part 2  PETSc ex50"       "$W/part2/petsc/petsc-ex50-*.out"     "KSPSolve"                  "KSPSolve"
check "Part 3a compile"          "$W/part3-mpi/compile.log"            "libmpi.so.12"              "libmpi"
check "Part 3a container MPI"    "$W/part3-mpi/mpi-container-*.out"    "4194304"                   "4194304"
check "Part 3a e4s-cl pingpong"  "$W/part3-mpi/mpi-e4s-cl-*.out"       "Intel\\(R\\) MPI"          "4194304"
check "Part 3a e4s-cl hypre"     "$W/part3-mpi/mpi-e4s-cl-*.out"       "Final Relative Residual"   "Final Relative"
check "Part 3b e4s-alc create"   "$W/part3-alc/hypre.def"              "Bootstrap: localimage"     "From:"
check "Part 3b build"            "$W/part3-alc/alc-build-*.out"        "Build complete"            "^real"
check "Part 3b run custom image" "$W/part3-alc/alc-run-*.out"          "Final Relative Residual"   "Final Relative"
exit ${FAILED:-0}
