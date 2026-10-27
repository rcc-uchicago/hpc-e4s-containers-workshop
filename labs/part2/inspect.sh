#!/bin/bash
# inspect.sh - what is inside an E4S image?   Usage: ./inspect.sh [image.sif]
source "${E4S_WORKSHOP:?source the workshop env.sh first}/env.sh"
IMAGE=${1:-$E4S_IMAGE}

# Run a Spack command inside the image. --writable-tmpfs gives Spack somewhere to
# put its lock files; the image itself is never modified.
spack_in() {
    apptainer exec --writable-tmpfs "$IMAGE" \
        bash -c 'source /spack/share/spack/setup-env.sh && spack "$@"' spack "$@"
}

echo "### Image metadata";            apptainer inspect "$IMAGE" | head -12
echo; echo "### OS inside the image";  apptainer exec "$IMAGE" grep PRETTY_NAME /etc/os-release
echo; echo "### Packages installed by Spack (explicit / total)"
echo "    $(spack_in find -x --format '{name}' | wc -l) / $(spack_in find --format '{name}' | wc -l)"
echo; echo "### A few of the scientific libraries and applications"
spack_in find -x --format '{name}@{version}' petsc hypre trilinos sundials superlu-dist hdf5 lammps gromacs
echo; echo "### How was PETSc built? (variants: + enabled, ~ disabled)"
spack_in find -v petsc@3.25.1
echo; echo "### What does hypre depend on?"
spack_in find -d hypre
echo; echo "### Where is LAMMPS installed inside the image?"
spack_in location -i lammps
