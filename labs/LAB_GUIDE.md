# Containers for HPC: Pre-built Scientific Software with E4S — Lab Guide

Research Computing Center · Midway3 · Tuesday, October 27, 2026

You will run software from **E4S 26.06**, a pre-built image with 685 Spack packages
(LAMMPS, GROMACS, PETSc, hypre, Trilinos, SUNDIALS, …), under **Apptainer** and
**Slurm**. Nothing gets installed on the cluster.

| Part | Hands-on time | You will |
|---|---|---|
| 0 | 5 min | Log in, get a compute node, copy the labs |
| 1 | 10 min | See what a container on a shared HPC system can and cannot do |
| 2 | 25 min | Pull an E4S image, inspect what is inside, run LAMMPS as a batch job |
| 3a | 15 min | Run an MPI program with the container's MPI, then with Midway3's MPI via **e4s-cl** |
| 3b | 15 min | Add software to an existing image with **e4s-alc** and run it |

Commands you type are shown after a `$`. Lines without `$` are example output.

---

## Part 0 — Setup

```bash
$ ssh <cnetid>@midway3.rcc.uchicago.edu
$ source /project/rcc/workshops/e4s/env.sh
$ sinteractive -c 4 -t 2:00:00          # a compute node for the next two hours
```

`env.sh` prints the Slurm account your jobs will be charged to (`Slurm : … account=…`).
If it says `NOT SET` or isn't the account you want, or `sinteractive` says "Invalid membership" or
"No sufficient SU allocations", set your PI account and source the file again:

```bash
$ export E4S_SLURM_ACCOUNT=pi-<yourpi>
$ source /project/rcc/workshops/e4s/env.sh
```

`sinteractive` logs you into a compute node, which is a new shell, so set up the
environment there again and copy the labs into your scratch space:

```bash
$ source /project/rcc/workshops/e4s/env.sh
E4S workshop environment ready
  E4S_IMAGE  = /project/rcc/workshops/e4s/images/e4s-cpu-x86_64-26.06.sif
  apptainer  : apptainer version 1.4.1-1.el8
  ...
$ cp -r $E4S_WORKSHOP/labs $E4S_SCRATCH/e4s-labs
$ cd $E4S_SCRATCH/e4s-labs
```

`env.sh` loads the `apptainer/1.4.1` module, puts `e4s-cl` and `e4s-alc` on your
`PATH`, and sets `E4S_IMAGE` to the shared E4S image. It also moves Apptainer's
cache (`APPTAINER_CACHEDIR`) to scratch, because image layers fill a 30 GB home
directory quickly.

> Run containers on compute nodes, not login nodes: converting and running
> multi-GB images is real work.

---

## Part 1 — Containers on a shared HPC system

The image is a single file:

```bash
$ ls -lh $E4S_IMAGE
-rw-r--r-- 1 ... 24G ... e4s-cpu-x86_64-26.06.sif
```

**1. A different Linux, on the same machine.**

```bash
$ grep PRETTY_NAME /etc/os-release
PRETTY_NAME="CentOS Linux 8"
$ apptainer exec $E4S_IMAGE grep PRETTY_NAME /etc/os-release
PRETTY_NAME="Ubuntu 24.04.4 LTS"
```

`apptainer exec IMAGE COMMAND` runs one command inside the image. The command sees
the image's files: Ubuntu, its libraries and its software. The kernel, CPUs,
memory and network are still Midway3's.

**2. You are still you.**

```bash
$ id -un
$ apptainer exec $E4S_IMAGE id -un          # same user name, same UID
$ nproc; apptainer exec $E4S_IMAGE nproc    # same 4 cores Slurm gave you
```

There is no root inside the container and no daemon running on your behalf. The
processes belong to you, so Slurm accounting and file permissions work as usual.
This is the main reason HPC centers run Apptainer rather than Docker.

**3. The image is read-only, your files are not.**

```bash
$ apptainer exec $E4S_IMAGE touch /opt/hello
touch: cannot touch '/opt/hello': Read-only file system
$ apptainer exec $E4S_IMAGE touch ~/hello-from-container && ls -l ~/hello-from-container
$ rm ~/hello-from-container
```

Your home directory, `/tmp` and the current directory are mounted into the
container automatically. Add more with `-B /host/path[:/container/path]`.

**4. A throwaway writable layer.**

```bash
$ apptainer exec --writable-tmpfs $E4S_IMAGE bash -c 'touch /opt/hello && ls -l /opt/hello'
$ apptainer exec $E4S_IMAGE ls /opt/hello   # gone: changes lived in memory only
```

**5. Environment variables flow in, unless you stop them.**

```bash
$ env | wc -l
$ apptainer exec $E4S_IMAGE env | wc -l              # host variables + image's own
$ apptainer exec --cleanenv $E4S_IMAGE env | wc -l   # only a minimal set
```

`--cleanenv` is handy for reproducibility, but don't use it for MPI jobs: MPI ranks
find each other through variables that Slurm sets (Part 2).

**6. What does the image do when "run"?**

```bash
$ apptainer inspect $E4S_IMAGE                 # labels: build date, source
$ apptainer inspect --runscript $E4S_IMAGE     # what 'apptainer run' would execute
```

For an interactive look inside, use `apptainer shell $E4S_IMAGE` (type `exit` to
leave). Avoid `apptainer run` with the E4S images: it sources the image's
`/etc/bash.bashrc`, which writes npm settings into your home directory.

---

## Part 2 — E4S images: pull, inspect, run under Slurm

### 2a. Pull an image

E4S publishes images on Docker Hub (`ecpe4s/...`) and as ready-made SIF files on
[e4s.io](https://e4s.io/container-download/). The full images are 22–34 GB, so we
pre-pulled the CPU image for you. Pull the small **cache-backed image** yourself
(1.5 GB: Spack + MPICH, with the rest available from the E4S binary cache):

```bash
$ cd $E4S_SCRATCH/e4s-labs/part2
$ apptainer pull e4s-spack-cpu_26.06.sif docker://ecpe4s/e4s-spack-cpu:26.06
...
INFO:    Creating SIF file...
$ ls -lh e4s-spack-cpu_26.06.sif            # about 1.5 GB, 2-4 minutes
```

`apptainer pull` downloads the Docker image layers into `$APPTAINER_CACHEDIR` and
squashes them into one SIF file. (Or run `sbatch pull.sbatch` to do it in a batch job.)

### 2b. What is inside?

Open a shell in the full image and ask Spack:

```bash
$ apptainer shell --writable-tmpfs $E4S_IMAGE
Apptainer> source /spack/share/spack/setup-env.sh
Apptainer> spack find -x | head -40        # explicitly installed packages
Apptainer> spack find -x | tail -1
==> 127 installed packages
Apptainer> spack find -v petsc@3.25.1      # how was PETSc built? (+on ~off)
Apptainer> spack find -d hypre             # what does hypre depend on?
Apptainer> spack location -i lammps        # where is LAMMPS?
Apptainer> exit
```

`--writable-tmpfs` is there only because Spack wants to create a lock file next to
its database. The image itself stays unchanged.

**Questions to answer:** Is HDF5 in the image? Is PETSc built with hypre?
Which MPI do the packages use? Is GROMACS built with MPI?

`./inspect.sh` runs the same queries in one go (`./inspect.sh e4s-spack-cpu_26.06.sif`
works on your pulled image too).

### 2c. Run an application as a Slurm batch job

```bash
$ cat lammps.sbatch
$ sbatch lammps.sbatch
$ squeue --me
$ cat lammps-<jobid>.out
LAMMPS inside the container: /spack/opt/spack/linux-x86_64_v3/lammps-.../bin/lmp
Created 256000 atoms
Loop time of 1.86 on 8 procs for 100 steps with 256000 atoms
Performance: ... 13.8 Matom-step/s
```

The key line in the script:

```bash
srun --mpi=pmi2 apptainer exec "$E4S_IMAGE" "$LMP" -in in.lj -var x 2 -var y 2 -var z 2
```

Slurm starts 8 ranks. Each rank starts its own container. Inside, LAMMPS uses the
container's MPICH, which finds its peers through Slurm's PMI2 interface.

**Try:** change `--ntasks` to 4 or 16, or the box size (`-var x 3 ...`), and compare
the `Performance:` line.

**Challenge (optional):** `cd petsc && sbatch ex50.sbatch` compiles a PETSc example
inside the container against the image's PETSc and solves it on 4 ranks with PETSc's
algebraic multigrid. Then edit the script to use the solver from the original E4S
example, `-pc_type lu -pc_factor_mat_solver_type superlu_dist`. Why does it fail with
this image? (Hint: `spack find -v petsc@3.25.1`.)

---

## Part 3a — Swap in the host MPI with e4s-cl

Within a node, the container's MPICH is fine. Between nodes it does not know how to
use Midway3's InfiniBand network and falls back to TCP. **e4s-cl** fixes that at
launch time: it bind-mounts Midway3's Intel MPI and network libraries into the
container and preloads them in place of the container's MPICH. This works because
MPICH, Intel MPI, MVAPICH and Cray MPICH share one ABI (`libmpi.so.12`).

**1. Compile inside the container** (against the container's MPICH):

```bash
$ cd $E4S_SCRATCH/e4s-labs/part3-mpi
$ ./compile.sh
Compiling with: /opt/mpi/pkgs/mpich-4.3.2/bin/mpicc
pingpong is linked against:
        libmpi.so.12 => /opt/mpi/pkgs/mpich-4.3.2/lib/libmpi.so.12
```

**2. Baseline: the container's own MPI on two nodes.**

```bash
$ sbatch 01_container_mpi.sbatch
$ cat mpi-container-<jobid>.out
MPI library : MPICH Version:      4.3.2
       bytes    latency(us) bandwidth(MB/s)
           8          12.39            0.6
     4194304        1883.41         2227.0
```

**3. Create an e4s-cl profile for Midway3's Intel MPI** (once):

```bash
$ ./make_e4scl_profile.sh
$ e4s-cl profile list
```

Normally `e4s-cl init` creates this profile automatically by tracing a test
program. Midway3 disables the tracing mechanism (ptrace) for security, so the script
builds the same profile with `e4s-cl profile create` and `e4s-cl profile edit`.
Open the script to see which host libraries get injected.

**4. Same container, same binary, host MPI:**

```bash
$ sbatch 02_e4s-cl.sbatch
$ cat mpi-e4s-cl-<jobid>.out
MPI library : Intel(R) MPI Library 2021.5 for Linux* OS
       bytes    latency(us) bandwidth(MB/s)
           8           1.61            5.0
     4194304         356.68        11759.4
```

The binary never changed, but it now reports Intel MPI and runs at InfiniBand
speed: about 8× lower latency and 5× higher bandwidth. The second half of the job
runs a hypre AMG solver (built against the container's hypre) on 8 ranks the
same way.

The launch command is just your usual launcher with `e4s-cl launch` in front:

```bash
e4s-cl launch mpirun -np 8 -ppn 4 ./hypre_test -P 2 2 2 -n 60 60 60
```

---

## Part 3b — Add software to an existing image with e4s-alc

**e4s-alc** ("à la carte") turns a short YAML file into an Apptainer definition file:
start from an existing image, add OS packages, add Spack packages from the E4S
binary cache, add your own files and commands.

**1. Read the recipe and generate the definition file.**

```bash
$ cd $E4S_SCRATCH/e4s-labs/part3-alc
$ cat hypre.yaml
$ e4s-alc create -f hypre.yaml
$ cat hypre.def
```

**2. Build the image** (about 2 minutes; `--fakeroot` lets you be "root" inside
the build only, so `apt-get` works):

```bash
$ sbatch build.sbatch
$ cat alc-build-<jobid>.out
==> Installing hypre-2.33.0-... [8/8]
INFO:    Build complete: hypre.sif
```

`spack install hypre` downloaded binaries from the E4S build cache, so nothing was
compiled.

**3. Use it**: compile `hypre_test` against the new image's hypre and run on two
nodes with e4s-cl:

```bash
$ sbatch 03_run_custom.sbatch
$ cat alc-run-<jobid>.out
Iterations = 30
Final Relative Residual Norm = 9.5e-09
```

**Try:** add `- htop` under `os-packages`, or another `spack install` line (for
example `sundials`), regenerate, and rebuild.

**Other ways to add software:**

| Approach | Rebuilds the image? | Good for |
|---|---|---|
| `e4s-alc` → `apptainer build` | yes (new SIF) | a reproducible image to share or archive |
| `/etc/e4s/e4s-chain-spack.sh ~/spack` inside the image | no | installing extra Spack packages into your home, on top of the image's Spack |
| `extras/e4s-plus-app.yaml` | yes, from the 25 GB image | baking your application into the full E4S image (instructor demo) |

---

## Cheat sheet

```bash
apptainer pull NAME.sif docker://ORG/IMAGE:TAG   # Docker/OCI image -> SIF
apptainer exec IMAGE CMD                         # run one command
apptainer shell IMAGE                            # interactive shell
apptainer inspect IMAGE                          # metadata
  -B /host:/ctr     bind a directory        --cleanenv       don't pass host env
  --writable-tmpfs  scratch layer in RAM     --nv / --rocm   use GPUs
apptainer build --fakeroot NEW.sif RECIPE.def    # build (on a compute node)

srun --mpi=pmi2 apptainer exec IMAGE ./app       # MPI inside a node / simple cases
e4s-cl launch mpirun -np N ./app                 # MPI across nodes at full speed
e4s-alc create -f recipe.yaml                    # YAML -> definition file
```

## Where to go next

- E4S: <https://e4s.io> · images: <https://e4s.io/container-download/> · build cache: <https://e4s.io/e4s-buildcache/>
- e4s-cl: <https://e4s-cl.readthedocs.io> · e4s-alc: <https://e4s-alc.readthedocs.io>
- Apptainer user guide: <https://apptainer.org/docs/user/latest/>
- RCC help: <help@rcc.uchicago.edu>

Parts of this lab are adapted from E4S tutorials by Sameer Shende (University of
Oregon / ParaTools) and the ParaTools e4s-cloud-examples, used with permission.
