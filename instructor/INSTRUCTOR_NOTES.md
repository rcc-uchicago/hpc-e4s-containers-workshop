# Instructor notes — Containers for HPC: Pre-built Scientific Software with E4S

Tuesday, October 27, 2026, 3–5 PM · John Crerar Library, Kathleen A. Zar Room · Midway3

Everything here was tested on Midway3 on Oct 24, 2026 (caslake nodes, apptainer/1.4.1,
intelmpi/2021.5, E4S 26.06). The lab sequence was rehearsed end to end from the shared
install (`instructor/rehearse.sh`, all 10 checks passing).

## 1. Before the workshop

| When | What | Command / note |
|---|---|---|
| Done | Images downloaded into `images/` | `instructor/fetch_images.sh` (CPU image ~33 min at ~13 MB/s) |
| Done | Shared install staged, **group-only** | `/project/rcc/workshops/e4s` (rcc-staff, mode 2770) |
| **To do** | Slurm account and reservation for participants | edit `E4S_SLURM_ACCOUNT` / `E4S_SLURM_RESERVATION` at the top of `/project/rcc/workshops/e4s/env.sh` (see §4) |
| **To do** | Open the install to participants | `instructor/setup_shared.sh /project/rcc/workshops/e4s` (re-run without `--private`; makes it world-readable; keeps the `E4S_SLURM_*` lines you set in the installed env.sh) |
| Day before | Rehearse | `source /project/rcc/workshops/e4s/env.sh && instructor/rehearse.sh`, then `instructor/check_rehearsal.sh` |
| Optional | Pre-build the full-image demo | §6 |

Repository layout:

```
abstract.txt                     workshop abstract
slides/E4S_Workshop_RCC_2026-10-27.pptx   the deck (32 slides, speaker notes) + .pdf
slides/build_deck.js, render.sh  deck generator (pptxgenjs) and render script
labs/                            what participants copy (LAB_GUIDE.md + part2, part3-*)
shared/env.sh                    participant environment (installed as $E4S_WORKSHOP/env.sh)
instructor/                      setup_shared.sh, fetch_images.sh, rehearse.sh, check_rehearsal.sh, these notes
images/                          not tracked: SIF files from fetch_images.sh (25.5 GB CPU image, 1.2 GB base image)
```

## 2. Timeline (120 min)

| Elapsed | Segment | Slides | Notes |
|---|---|---|---|
| 0:00 | Welcome, setup | 1–4 | Everyone runs Part 0. Biggest risk: Slurm account (§4) |
| 0:10 | Part 1 lecture | 5–9 | Why Apptainer, not Docker; rootless model |
| 0:20 | Hands-on 1 | 10 | 10 min |
| 0:30 | Part 2 lecture | 11–17 | Start the pull at slide 14 so it runs during the talk |
| 0:40 | Hands-on 2 | 18 | 25 min: pull (2–4 min), inspect, LAMMPS, PETSc challenge |
| 1:05 | Break | | 5 min |
| 1:10 | Part 3a lecture + hands-on | 19–24 | Charts on slide 20 are real Midway3 numbers |
| 1:35 | Part 3b lecture + hands-on | 25–28 | Build takes ~2 min once scheduled |
| (1:53) | Optional: layered E4S | 29 | 1–2 min, only if time allows; skip otherwise |
| 1:55 | Wrap-up | 30–32 | |

Concurrent load if 30 people attend: 30 × 4-core interactive sessions (~3 nodes), plus
short 2-node jobs in Part 3. A reservation of ~6 caslake nodes covers it comfortably.

## 3. Measured numbers used in the slides

| What | Result |
|---|---|
| `apptainer pull docker://ecpe4s/e4s-spack-cpu:26.06` | 1.5 GB SIF; 103 s on 32 cores, 4 min on a 4-core job |
| `spack find -x` / `spack find` in e4s-cpu 26.06 | 127 / 685 packages |
| LAMMPS LJ melt, 256,000 atoms, 8 ranks, 1 node | 13.9 M atom-steps/s (1.86 s for 100 steps) |
| Ping-pong, 2 nodes, container MPICH 4.3.2 (srun --mpi=pmi2) | 12.4 µs, 2.2 GB/s (TCP) |
| Ping-pong, 2 nodes, e4s-cl + host Intel MPI 2021.5 | 1.61 µs, 11.8 GB/s (InfiniBand) |
| Ping-pong, 2 nodes, native Intel MPI | 1.63 µs, 11.7 GB/s |
| Ping-pong, 2 nodes, native MPICH 5.0.0 module | 13.7 µs, 2.5 GB/s (also TCP; not used) |
| hypre AMG-PCG 120³, 8 ranks / 2 nodes via e4s-cl | 30 iterations, residual 9.5e-09 |
| e4s-alc hypre image build | 83 s on 32 cores; 2 min on 8 cores; 1.2 GB |
| Full-image customization (sandbox + build) | 118 s unpack (76 GB) + 736 s build on 32 cores; 25.6 GB result |

## 4. Things that will bite (found during testing)

1. **Slurm account.** caslake rejects jobs without an account that has SUs
   ("Account is not specified" / "No sufficient SU allocations"). Either participants use
   their own PI accounts, or set `E4S_SLURM_ACCOUNT` (and `E4S_SLURM_RESERVATION`) in the
   shared `env.sh` — sbatch, srun, salloc and `sinteractive` all pick it up through
   `SBATCH_*` / `SLURM_*` / `SALLOC_*` variables. Testing used `rcc-staff`.
2. **Not every caslake node mounts `/scratch/beagle3`.** midway3-0036 does not. Keep all
   workshop files on `/project` and `/scratch/midway3` (both checked on that node).
3. **Home quota.** Apptainer caches layers in `~/.apptainer` by default (30 GB home).
   `env.sh` moves it to `/scratch/midway3/$USER/.apptainer/cache`.
4. **`spack find` in a read-only image** fails with "Read-only file system:
   .spack-db/lock". Use `apptainer exec|shell --writable-tmpfs`.
5. **`--cleanenv` breaks MPI**: every rank becomes a singleton because the PMI_* variables
   are stripped.
6. **`apptainer run` with E4S images** sources `/etc/bash.bashrc`.
   - CPU image: overwrites `~/.npmrc` and runs `npm config` in `$HOME` (mild).
   - **CUDA image (`e4s-cuda80`): on first interactive start it installs E4S's AI agent
     tools into `$HOME` in the background** (npm installs of gemini-cli and a coding agent,
     a clone of NVIDIA NemoClaw, and the openclaw.ai installer). This is intended: E4S 26.06
     ships these AI tools (Sameer's SC26 abstract lists OpenClaw and NemoClaw). For a room
     of 30 accounts it means network traffic and home-quota use nobody asked for, so the
     image is not in the shared install (`setup_shared.sh --gpu` adds it for an instructor
     demo). `apptainer shell` (runs bash `--norc`) and `exec` don't trigger it.
7. **ptrace is disabled** (`kernel.yama.ptrace_scope = 3`), so `e4s-cl init` and
   `e4s-cl profile detect` cannot trace. `labs/part3-mpi/make_e4scl_profile.sh` builds the
   equivalent profile by hand from the library list Intel MPI actually loads (captured with
   `LD_DEBUG=libs`).
8. **Launch e4s-cl with `mpirun`, not `srun`.** `e4s-cl launch srun --mpi=pmi2 ...` hangs in
   Intel MPI startup (just before process pinning). `e4s-cl launch mpirun -np N -ppn M`
   (Intel MPI hydra, bootstrap=slurm) works; so does `srun --mpi=pmi2 apptainer exec ...`
   with the same host libraries bound by hand, so the issue is specific to e4s-cl's srun
   path. Worth reporting upstream.
9. **Host MPI choice.** Only `intelmpi/2021.5` uses InfiniBand between nodes in our tests;
   `mpich/5.0.0` (ch4:ofi) ran at TCP speed.
10. **LAMMPS in the CUDA image needs `libcuda.so.1`** and fails on CPU-only nodes; use the
    CPU image on caslake.
11. **Two PETSc builds** (3.21.6 and 3.25.1) in the CPU image: name the version in Spack
    queries. 3.25.1 is `~superlu-dist ~hypre`, so the ParaTools ex50 options fail (the
    challenge turns this into an exercise; the script uses GAMG).
12. **hypre 3.x renamed `seq_mv.h`** to `_hypre_seq_mv.h`; `hypre_test.c` carries an
    `__has_include` fallback so it builds against 2.33 and 3.1.
13. **`APPTAINER_BIND` leaks into builds**: binding a path that doesn't exist in the build
    sandbox makes `apptainer build` fail. `env.sh` no longer sets it.
14. **Docker Hub rate limit**: 100 anonymous pulls/hour per IP (login and compute nodes
    show different IPs). One pull per participant is fine. The e4s-alc recipe bootstraps
    from the shared local copy, so builds don't pull.
15. **e4s-alc always pulls the base image** to read its OS before writing the definition
    file. `env.sh` pre-links the shared images into `~/.e4s-alc/singularity_images/` so
    nothing is downloaded.

## 5. If something fails during the session

| Symptom | Fix |
|---|---|
| `sinteractive`/`sbatch` rejected | account/reservation (§4.1) |
| `apptainer: command not found` in a batch job | the script must `source "$E4S_WORKSHOP/env.sh"`; check `echo $E4S_WORKSHOP` before `sbatch` |
| pull slow or rate-limited | `cp /project/rcc/workshops/e4s/images/...` is not the same image, but they can run `./inspect.sh $E4S_IMAGE` and move on |
| `02_e4s-cl` prints nothing for minutes | they used srun; check they did not edit the launcher. Verify `e4s-cl profile list` shows `midway3-impi` selected |
| e4s-alc build slow/failed | `cp $E4S_WORKSHOP/images/prebuilt-ubuntu24.04_hypre.sif hypre.sif` (staged), then continue with `03_run_custom.sbatch` |

## 6. Optional demo: customizing the full 25 GB image

`labs/part3-alc/extras/e4s-plus-app.yaml` bakes `hypre_test` into the full E4S image.
On Midway3, `apptainer build --fakeroot` cannot unpack the 25 GB SIF directly: there are
no `/etc/subuid` entries, so fakeroot uses a root-mapped namespace and unsquashfs fails on
files owned by other users (postfix, mail, ...). Two-step workaround, on a node with
~160 GB of free local disk (e.g. the build partition):

```bash
source /project/rcc/workshops/e4s/env.sh
cd labs/part3-alc/extras && cp ../../part3-mpi/hypre_test.c .
e4s-alc create -f e4s-plus-app.yaml
export APPTAINER_TMPDIR=/tmp/$USER-build && mkdir -p $APPTAINER_TMPDIR
apptainer build --sandbox /tmp/$USER-e4s-sandbox $E4S_IMAGE        # step 1: ~2 min, 76 GB
sed -i "s|^From: .*|From: /tmp/$USER-e4s-sandbox|" e4s-plus-app.def
apptainer build --fakeroot e4s-plus-app.sif e4s-plus-app.def        # step 2
```

Measured on midway3-0200 (build partition, 32 cores): step 1 118 s, step 2 736 s, peak
~160 GB in `/tmp`, result 25.6 GB. The result is already staged as
`$E4S_WORKSHOP/images/demo-e4s-plus-app.sif`; show it instead of building live:

```bash
apptainer exec $E4S_WORKSHOP/images/demo-e4s-plus-app.sif /opt/app/hypre_test -n 30 30 30
apptainer exec $E4S_WORKSHOP/images/demo-e4s-plus-app.sif which htop
```

## 7. Credits

Portions adapted, with permission, from E4S tutorials by Sameer Shende (University of
Oregon / ParaTools): the E4S 26.06 and 25.11 release decks (https://e4s.io/talks/), the
MUG'26 tutorial, E4S at NERSC 2022, the ParaTools `e4s-cloud-examples`
(hypre e4s-alc/e4s-cl pipeline, LAMMPS and PETSc examples) and the `e4s-cl` demo script.
The slides credit these on the slides where they are used.

Slide 29 (optional, "What's next: layered E4S") summarizes Parm Sinha's accepted SC26 research
poster, "Union of Containers: Layered Software Stacks with Cross-Container Dependency Reuse for
HPC" (Tue Nov 17, 2026), part of a manuscript in preparation with Sameer Shende as second author.
It uses only the figures published in the poster abstract
(https://sc26.conference-program.com/presentation/?id=rpost284&sess=sess313).
