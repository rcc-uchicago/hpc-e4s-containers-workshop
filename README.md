# Containers for HPC: Pre-built Scientific Software with E4S

Materials for a two-hour hands-on workshop run by the
[Research Computing Center](https://rcc.uchicago.edu) at the University of Chicago on
Tuesday, October 27, 2026, on the Midway3 cluster. Participants run software from the
[E4S](https://e4s.io) 26.06 container images with Apptainer and Slurm, swap the
container's MPI for the cluster's at launch with **e4s-cl**, and add software to an
existing image with **e4s-alc**. Abstract: [abstract.txt](abstract.txt).

| You want | Open |
|---|---|
| The slides | [slides/E4S_Workshop_RCC_2026-10-27.pptx](slides/E4S_Workshop_RCC_2026-10-27.pptx) (33 slides, speaker notes on each) · [PDF](slides/E4S_Workshop_RCC_2026-10-27.pdf) |
| The hands-on guide | [labs/LAB_GUIDE.md](labs/LAB_GUIDE.md) |
| Setup, timing, and what broke during testing | [instructor/INSTRUCTOR_NOTES.md](instructor/INSTRUCTOR_NOTES.md) |

## Contents

```
abstract.txt     workshop description
labs/            what participants copy and run
  LAB_GUIDE.md   step-by-step guide with expected output
  part2/         pull.sbatch, inspect.sh, lammps.sbatch (+ in.lj), petsc/ex50.sbatch
  part3-mpi/     compile.sh, 01_container_mpi.sbatch, make_e4scl_profile.sh, 02_e4s-cl.sbatch
  part3-alc/     hypre.yaml, build.sbatch, 03_run_custom.sbatch, extras/e4s-plus-app.yaml
shared/env.sh    participant environment, installed next to the images
instructor/      fetch_images.sh, setup_shared.sh, rehearse.sh, check_rehearsal.sh, notes
slides/          the deck, its generator (build_deck.js), render.sh, lo.def, assets
```

Container images are not in the repository (the main one is 25 GB);
`instructor/fetch_images.sh` downloads them.

## Running the workshop

On Midway3 the materials are installed in `/project/rcc/workshops/e4s`, and
participants start with:

```bash
source /project/rcc/workshops/e4s/env.sh
sinteractive -c 4 -t 2:00:00
source /project/rcc/workshops/e4s/env.sh
cp -r $E4S_WORKSHOP/labs $E4S_SCRATCH/e4s-labs && cd $E4S_SCRATCH/e4s-labs
```

To set up your own copy:

```bash
instructor/fetch_images.sh                     # on a compute node: E4S 26.06 CPU image + e4s-alc base image
instructor/setup_shared.sh --private /path/to/shared/dir   # images, e4s-cl, e4s-alc, labs, env.sh
# set E4S_SLURM_ACCOUNT / E4S_SLURM_RESERVATION at the top of the installed env.sh
source /path/to/shared/dir/env.sh && instructor/rehearse.sh   # every exercise as batch jobs
instructor/check_rehearsal.sh                  # 10 checks
instructor/setup_shared.sh /path/to/shared/dir # open it to participants
```

Requirements: Slurm, Apptainer 1.4 with `--fakeroot`, Python 3.11 for the tool
installs, and a node with outbound internet for the downloads.

Site-specific pieces to adapt elsewhere:
- `shared/env.sh`: module names, scratch path, default partition.
- `labs/part3-mpi/make_e4scl_profile.sh`: the host MPI and network libraries that e4s-cl
  injects (written for Midway3's Intel MPI 2021.5 and Mellanox InfiniBand).
- Partition and account names in the `#SBATCH` lines, which `env.sh` supplies through
  `SBATCH_*` variables.

## Rebuilding the slides

The deck is generated, so edit `slides/build_deck.js`, not the `.pptx`:

```bash
cd slides
npm install                               # once
apptainer build --fakeroot lo.sif lo.def  # once, optional: LibreOffice for the PDF
./render.sh                               # .pptx, .pdf and render/slide-*.jpg
```

## Credits

Parts of the slides and labs are adapted, with permission, from E4S tutorials by
Sameer Shende (University of Oregon and ParaTools, Inc.) and from ParaTools'
[e4s-cloud-examples](https://github.com/ParaToolsInc/e4s-cloud-examples). E4S is a
project of the High Performance Software Foundation. See
[THIRD_PARTY.md](THIRD_PARTY.md) for the origin and license of each borrowed file.

## License

Documentation and slides are licensed under [CC BY 4.0](LICENSE-CC-BY-4.0.txt); scripts
and code under the MIT License. Borrowed files keep their own terms
([THIRD_PARTY.md](THIRD_PARTY.md)). Details: [LICENSE](LICENSE).

Questions about running these materials on Midway3: <help@rcc.uchicago.edu>.
