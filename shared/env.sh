# env.sh - environment for the "Containers for HPC: Pre-built Scientific Software
# with E4S" workshop on Midway3.  Use it with:
#
#     source /project/rcc/workshops/e4s/env.sh
#
# Re-source it in every new shell (including your sinteractive session).

# ---- Instructor settings ----------------------------------------------------
# Slurm account / reservation / partition for workshop jobs. Leave a value empty
# to use your own default. sbatch, srun, salloc and sinteractive all read these.
E4S_SLURM_ACCOUNT=${E4S_SLURM_ACCOUNT:-}
E4S_SLURM_RESERVATION=${E4S_SLURM_RESERVATION:-}
E4S_SLURM_PARTITION=${E4S_SLURM_PARTITION:-caslake}
# ------------------------------------------------------------------------------

# Midway3's submit filter rejects jobs that don't name an account, so when none is
# set above, use the participant's Slurm default account (normally their PI account).
# Override with:  export E4S_SLURM_ACCOUNT=pi-<yourpi>   before sourcing this file.
if [ -z "$E4S_SLURM_ACCOUNT" ] && command -v sacctmgr >/dev/null 2>&1; then
    E4S_SLURM_ACCOUNT=$(sacctmgr -nP show user "$USER" format=defaultaccount 2>/dev/null | head -1)
fi

# Where the workshop's images and tools live: the directory holding this file.
export E4S_WORKSHOP=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# The pre-built E4S 26.06 image we use all afternoon (CPU build, Ubuntu 24.04).
export E4S_IMAGE=${E4S_IMAGE:-$E4S_WORKSHOP/images/e4s-cpu-x86_64-26.06.sif}
# A small Spack-ready Ubuntu image that e4s-alc customizes in Part 3.
export E4S_BASE_IMAGE=$E4S_WORKSHOP/images/ecpe4s-ubuntu24.04.sif

# Apptainer from the module system; e4s-cl and e4s-alc from the workshop install.
type module >/dev/null 2>&1 || source /etc/profile.d/zzz-rcc.sh
module load apptainer/1.4.1
export PATH=$E4S_WORKSHOP/bin:$PATH

# Your work area. Home (30 GB quota) is too small for container images.
export E4S_SCRATCH=/scratch/midway3/$USER
# Apptainer caches image layers here; the default (~/.apptainer) fills your home quota.
export APPTAINER_CACHEDIR=$E4S_SCRATCH/.apptainer/cache
mkdir -p "$APPTAINER_CACHEDIR"
# Inside a container you see $HOME, /tmp and the current directory automatically;
# run the labs from your scratch copy so their files are visible.
# Batch jobs set TMPDIR to a node-local directory that containers can't see.
export APPTAINERENV_TMPDIR=/tmp

# Slurm defaults (sbatch/sinteractive use SBATCH_*, srun uses SLURM_*, salloc SALLOC_*).
for _v in ACCOUNT RESERVATION PARTITION; do
    _val=$(eval echo "\$E4S_SLURM_$_v")
    if [ -n "$_val" ]; then
        export SBATCH_$_v=$_val SLURM_$_v=$_val SALLOC_$_v=$_val
    fi
done
unset _v _val

# e4s-alc reads the OS of the base image before writing a definition file, and
# pulls the image to do so unless it finds it in its cache. Point the cache at
# the shared copy so nobody downloads it again.
mkdir -p ~/.e4s-alc/singularity_images
ln -sfn "$E4S_BASE_IMAGE" ~/.e4s-alc/singularity_images/ecpe4s-ubuntu24.04.sif_latest.sif
ln -sfn "$E4S_IMAGE" ~/.e4s-alc/singularity_images/$(basename "$E4S_IMAGE")_latest.sif

if [ -z "$E4S_QUIET" ]; then
    echo "E4S workshop environment ready"
    echo "  E4S_IMAGE  = $E4S_IMAGE"
    echo "  apptainer  : $(apptainer --version)"
    echo "  e4s-cl     : $(command -v e4s-cl)"
    echo "  e4s-alc    : $(command -v e4s-alc)"
    echo "  Slurm      : partition=${SBATCH_PARTITION:-default} account=${SBATCH_ACCOUNT:-default}${SBATCH_RESERVATION:+ reservation=$SBATCH_RESERVATION}"
fi
export E4S_QUIET=1
